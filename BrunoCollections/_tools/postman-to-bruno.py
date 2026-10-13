#!/usr/bin/env python3
"""Convert VTEX Postman v2.1 collections (PostmanCollections/) into Bruno .bru collections.

This is stage 1 of the pipeline driven by convert.sh; stage 2 (bru-to-opencollection.js)
turns the .bru output into the OpenCollection .yml format that ships in BrunoCollections/.
Pass an output directory as the first argument; it defaults to BrunoCollections/.
"""
import json, os, re, sys, glob, shutil, collections

# This script lives at BrunoCollections/_tools/, so the repo root is two levels up.
# Resolving from __file__ keeps it runnable from any working directory.
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "PostmanCollections")
DST = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(ROOT, "BrunoCollections")

# ---------------------------------------------------------------- bru writing

def esc_block(text):
    """Indent a multi-line value for a Bruno text block (2 spaces per line)."""
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    return "\n".join(("  " + l) if l.strip() else "" for l in lines)

def text_block(name, content):
    if content is None or content == "":
        return ""
    return "%s {\n%s\n}\n\n" % (name, esc_block(content))

def one_line(v):
    return re.sub(r"\s*\n\s*", " ", str(v)).strip()

def dict_block(name, pairs):
    """pairs: list of (key, value, enabled)."""
    if not pairs:
        return ""
    out = ["%s {" % name]
    for k, v, enabled in pairs:
        prefix = "" if enabled else "~"
        out.append("  %s%s: %s" % (prefix, one_line(k), one_line(v)))
    out.append("}\n")
    return "\n".join(out) + "\n"

def list_block(name, values):
    if not values:
        return ""
    return "%s [\n%s\n]\n\n" % (name, ",\n".join("  " + v for v in values))

# ---------------------------------------------------------------- postman bits

def desc_text(d):
    if d is None:
        return ""
    if isinstance(d, str):
        return d
    if isinstance(d, dict):
        return d.get("content", "") or ""
    return ""

def kv_list(entries):
    """Postman key/value entries -> (key, value, enabled) tuples."""
    out = []
    for e in entries or []:
        if not isinstance(e, dict) or "key" not in e:
            continue
        out.append((e["key"], e.get("value", "") or "", not e.get("disabled", False)))
    return out

def dedupe(pairs):
    seen, out = set(), []
    for k, v, en in pairs:
        if k in seen:
            continue
        seen.add(k)
        out.append((k, v, en))
    return out

def build_url(u):
    if isinstance(u, str):
        return u
    if not isinstance(u, dict):
        return ""
    host = u.get("host") or []
    if isinstance(host, str):
        host = [host]
    host = ".".join(host)
    protocol = u.get("protocol")
    if protocol and not host.startswith("{{"):
        host = "%s://%s" % (protocol, host)
    port = u.get("port")
    if port:
        host = "%s:%s" % (host, port)
    path = u.get("path") or []
    if isinstance(path, str):
        path = [p for p in path.split("/") if p != ""]
    url = host
    if path:
        url = host.rstrip("/") + "/" + "/".join(str(p) for p in path)
    enabled_q = [(k, v) for k, v, en in kv_list(u.get("query")) if en]
    if enabled_q:
        url += "?" + "&".join("%s=%s" % (k, v) for k, v in enabled_q)
    return url

BODY_LANG = {"json": "json", "xml": "xml", "html": "text", "text": "text", "javascript": "text"}

def body_blocks(body):
    """-> (body_mode_for_meta, block_text)"""
    if not body or not isinstance(body, dict):
        return "none", ""
    mode = body.get("mode")
    if mode == "raw":
        raw = body.get("raw", "")
        lang = (body.get("options", {}).get("raw", {}) or {}).get("language", "text")
        btype = BODY_LANG.get(lang, "text")
        if not raw:
            return "none", ""
        return btype, text_block("body:%s" % btype, raw)
    if mode == "urlencoded":
        pairs = kv_list(body.get("urlencoded"))
        return "formUrlEncoded", dict_block("body:form-urlencoded", pairs)
    if mode == "formdata":
        rows = []
        for e in body.get("formdata") or []:
            key = e.get("key")
            if key is None:
                continue
            enabled = not e.get("disabled", False)
            if e.get("type") == "file":
                src = e.get("src")
                if isinstance(src, list):
                    src = src[0] if src else None
                rows.append((key, "@file(%s)" % (src or ""), enabled))
            else:
                rows.append((key, e.get("value", "") or "", enabled))
        return "multipartForm", dict_block("body:multipart-form", rows)
    if mode == "file":
        src = (body.get("file") or {}).get("src")
        if src:
            return "file", dict_block("body:file", [("file", "@file(%s)" % src, True)])
        return "file", ""
    if mode == "graphql":
        gq = body.get("graphql") or {}
        blk = text_block("body:graphql", gq.get("query", ""))
        if gq.get("variables"):
            blk += text_block("body:graphql:vars", gq["variables"])
        return "graphql", blk
    return "none", ""

def auth_blocks(auth):
    """Postman auth -> (bruno mode, block text). None if absent/noauth."""
    if not auth or not isinstance(auth, dict):
        return None, ""
    t = auth.get("type")
    if t in (None, "noauth"):
        return "none", ""
    params = {}
    for e in auth.get(t) or []:
        if isinstance(e, dict) and "key" in e:
            params[e["key"]] = e.get("value", "")
    if t == "apikey":
        placement = params.get("in", "header")
        return "apikey", dict_block("auth:apikey", [
            ("key", params.get("key", ""), True),
            ("value", params.get("value", ""), True),
            ("placement", placement, True),
        ])
    if t == "bearer":
        return "bearer", dict_block("auth:bearer", [("token", params.get("token", ""), True)])
    if t == "basic":
        return "basic", dict_block("auth:basic", [
            ("username", params.get("username", ""), True),
            ("password", params.get("password", ""), True),
        ])
    return "none", ""

# ---------------------------------------------------------------- test translation

TEST_RE = re.compile(r'pm\.test\(\s*("(?:[^"\\]|\\.)*")\s*,\s*function\s*\(\s*\)\s*\{(.*?)\n\s*\}\s*\)\s*;', re.S)
SCHEMA_RE = re.compile(r'^\s*const schema\s*=\s*(.+?)\s*$', re.M)
CT_RE = re.compile(r'headers\.get\(\s*"([^"]+)"\s*\)\s*\)\s*\.to\.include\(\s*"([^"]+)"\s*\)')
HDR_RE = re.compile(r'to\.have\.header\(\s*"([^"]+)"\s*\)')

def js_str(s):
    return json.dumps(s)

def translate_tests(events):
    """portman pm.* scripts -> Bruno test() blocks. Returns body text or ''."""
    src = ""
    for e in events or []:
        if e.get("listen") != "test":
            continue
        exec_ = (e.get("script") or {}).get("exec") or []
        src += "".join(exec_) if isinstance(exec_, list) else str(exec_)
    if not src.strip():
        return ""

    schemas = SCHEMA_RE.findall(src)
    schema_i = 0
    out, needs_ajv = [], False

    for name_lit, body in TEST_RE.findall(src):
        try:
            name = json.loads(name_lit)
        except Exception:
            name = name_lit.strip('"')
        name = js_str(name)

        if "to.be.success" in body:
            out.append(
                'test(%s, function () {\n'
                '  expect(res.getStatus()).to.be.at.least(200);\n'
                '  expect(res.getStatus()).to.be.below(300);\n'
                '});' % name)
        elif "to.be.error" in body:
            out.append(
                'test(%s, function () {\n'
                '  expect(res.getStatus()).to.be.at.least(400);\n'
                '  expect(res.getStatus()).to.be.below(500);\n'
                '});' % name)
        elif CT_RE.search(body):
            hdr, val = CT_RE.search(body).groups()
            out.append(
                'test(%s, function () {\n'
                '  expect(String(res.getHeader(%s))).to.include(%s);\n'
                '});' % (name, js_str(hdr.lower()), js_str(val)))
        elif "jsonBody()" in body:
            out.append(
                'test(%s, function () {\n'
                '  const data = res.getBody();\n'
                '  expect(data).to.not.be.undefined;\n'
                '  expect(data).to.not.be.null;\n'
                '});' % name)
        elif "jsonSchema(" in body:
            schema = schemas[schema_i] if schema_i < len(schemas) else "{}"
            schema_i += 1
            needs_ajv = True
            out.append(
                'test(%s, function () {\n'
                '  const schema = %s;\n'
                '  const validate = ajv.compile(schema);\n'
                '  const valid = validate(res.getBody());\n'
                '  expect(valid, JSON.stringify(validate.errors)).to.be.true;\n'
                '});' % (name, schema))
        elif "to.not.be.withBody" in body:
            out.append(
                'test(%s, function () {\n'
                '  const data = res.getBody();\n'
                '  expect(data === undefined || data === null || data === "").to.be.true;\n'
                '});' % name)
        elif HDR_RE.search(body):
            hdr = HDR_RE.search(body).group(1)
            out.append(
                'test(%s, function () {\n'
                '  expect(res.getHeaders()).to.have.property(%s);\n'
                '});' % (name, js_str(hdr.lower())))

    if not out:
        return ""
    prelude = ""
    if needs_ajv:
        prelude = (
            'const Ajv = require("ajv");\n'
            'const addFormats = require("ajv-formats");\n'
            'const ajv = new Ajv({ allErrors: true, strict: false });\n'
            'addFormats(ajv);\n\n')
    return prelude + "\n\n".join(out)

# ---------------------------------------------------------------- docs

def params_table(rows):
    if not rows:
        return ""
    out = ["| Name | In | Description |", "| --- | --- | --- |"]
    for name, loc, d in rows:
        out.append("| `%s` | %s | %s |" % (name, loc, one_line(d).replace("|", "\\|")))
    return "\n".join(out)

def request_docs(item, req, example):
    parts = []
    d = desc_text(req.get("description")) or desc_text(item.get("description"))
    if d.strip():
        parts.append(d.strip())

    rows = []
    u = req.get("url")
    if isinstance(u, dict):
        for e in u.get("variable") or []:
            if e.get("key"):
                rows.append((e["key"], "path", desc_text(e.get("description"))))
        for e in u.get("query") or []:
            if e.get("key"):
                rows.append((e["key"], "query", desc_text(e.get("description"))))
    seen = set()
    for e in req.get("header") or []:
        k = e.get("key")
        if k and k not in seen:
            seen.add(k)
            rows.append((k, "header", desc_text(e.get("description"))))
    rows = [r for r in rows if r[2].strip()]
    if rows:
        parts.append("## Parameters\n\n" + params_table(rows))

    if example:
        parts.append(example)
    return "\n\n".join(parts)

def example_section(responses):
    """First 2xx response example, if compact enough to inline."""
    for r in responses or []:
        code = r.get("code")
        if not isinstance(code, int) or not (200 <= code < 300):
            continue
        body = r.get("body")
        if not body or not str(body).strip():
            continue
        body = str(body)
        lang = (r.get("_", {}) or {}).get("postman_previewlanguage", "json")
        if len(body) > 4000:
            return "## Example response (`%s`)\n\n_Omitted here: %d KB. See `%s` in PostmanCollections._" % (
                code, len(body) // 1024, r.get("name", "example"))
        return "## Example response (`%s`)\n\n```%s\n%s\n```" % (code, lang if lang else "", body)
    return ""

# ---------------------------------------------------------------- emit

def safe_name(name):
    n = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "-", name).strip().rstrip(".")
    return n[:120] or "unnamed"

def unique_name(base, used):
    """Folders and request files share a directory, and macOS/Windows are
    case-insensitive, so reserve names case-insensitively."""
    name, n = base, 1
    while name.lower() in used:
        n += 1
        name = "%s (%d)" % (base, n)
    used.add(name.lower())
    return name

def write(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def emit_request(item, directory, seq, used, collection_has_auth):
    req = item.get("request")
    if isinstance(req, str):
        req = {"method": "GET", "url": req}
    method = (req.get("method") or "GET").lower()
    url = build_url(req.get("url"))

    body_mode, body_text = body_blocks(req.get("body"))
    auth_mode, auth_text = auth_blocks(req.get("auth"))
    if auth_mode is None:
        auth_mode = "inherit" if collection_has_auth else "none"
        auth_text = ""

    out = "meta {\n  name: %s\n  type: http\n  seq: %d\n}\n\n" % (one_line(item["name"]), seq)
    out += "%s {\n  url: %s\n  body: %s\n  auth: %s\n}\n\n" % (method, url, body_mode, auth_mode)

    u = req.get("url")
    if isinstance(u, dict):
        out += dict_block("params:query", dedupe(kv_list(u.get("query"))))
        out += dict_block("params:path", dedupe(kv_list(u.get("variable"))))
    out += dict_block("headers", dedupe(kv_list(req.get("header"))))
    out += auth_text
    out += body_text

    tests = translate_tests(item.get("event"))
    if tests:
        out += text_block("tests", tests)

    docs = request_docs(item, req, example_section(item.get("response")))
    if docs.strip():
        out += text_block("docs", docs)

    fname = unique_name(safe_name(item["name"]), used)
    write(os.path.join(directory, fname + ".bru"), out)
    return 1

def emit_folder(item, directory, seq, collection_has_auth, used):
    name = unique_name(safe_name(item["name"]), used)
    path = os.path.join(directory, name)
    os.makedirs(path, exist_ok=True)
    out = "meta {\n  name: %s\n  seq: %d\n}\n" % (one_line(item["name"]), seq)
    d = desc_text(item.get("description"))
    if d.strip():
        out += "\n" + text_block("docs", d.strip()).rstrip("\n") + "\n"
    write(os.path.join(path, "folder.bru"), out)
    return emit_items(item.get("item") or [], path, collection_has_auth)

def emit_items(items, directory, collection_has_auth):
    used = set()
    count = 0
    for i, it in enumerate(items, start=1):
        if "item" in it:
            count += emit_folder(it, directory, i, collection_has_auth, used)
        elif "request" in it:
            count += emit_request(it, directory, i, used, collection_has_auth)
    return count

VAR_RE = re.compile(r"\{\{([A-Za-z0-9_\-]+)\}\}")

def emit_collection(src_path, dst_root):
    doc = json.load(open(src_path, encoding="utf-8"))
    info = doc.get("info") or {}
    coll_name = os.path.splitext(os.path.basename(src_path))[0]
    root = os.path.join(dst_root, safe_name(coll_name))
    os.makedirs(root, exist_ok=True)

    write(os.path.join(root, "bruno.json"), json.dumps({
        "version": "1",
        "name": coll_name,
        "type": "collection",
        "ignore": ["node_modules", ".git"],
    }, indent=2) + "\n")

    auth_mode, auth_text = auth_blocks(doc.get("auth"))
    has_auth = auth_mode not in (None, "none")

    cbru = "meta {\n  name: %s\n}\n\n" % one_line(coll_name)
    cbru += "auth {\n  mode: %s\n}\n\n" % (auth_mode if has_auth else "none")
    cbru += auth_text
    cdesc = desc_text(info.get("description"))
    if cdesc.strip():
        cbru += text_block("docs", cdesc.strip())
    write(os.path.join(root, "collection.bru"), cbru)

    n = emit_items(doc.get("item") or [], root, has_auth)

    # environment: collection variables + any undefined {{vars}} referenced anywhere
    defined = collections.OrderedDict()
    for v in doc.get("variable") or []:
        if v.get("key"):
            defined[v["key"]] = v.get("value", "") or ""
    referenced = set()

    def scan_auth(a):
        if isinstance(a, dict) and a.get("type"):
            for e in a.get(a["type"]) or []:
                if isinstance(e, dict):
                    referenced.update(VAR_RE.findall(str(e.get("value", ""))))

    def scan_items(items):
        for it in items:
            if "item" in it:
                scan_items(it.get("item") or [])
                continue
            r = it.get("request")
            if isinstance(r, str):
                referenced.update(VAR_RE.findall(r))
                continue
            if not isinstance(r, dict):
                continue
            referenced.update(VAR_RE.findall(build_url(r.get("url"))))
            for e in r.get("header") or []:
                referenced.update(VAR_RE.findall(str(e.get("value", ""))))
            b = r.get("body") or {}
            if b.get("mode") == "raw":
                referenced.update(VAR_RE.findall(b.get("raw") or ""))
            scan_auth(r.get("auth"))

    scan_auth(doc.get("auth"))
    scan_items(doc.get("item") or [])
    secrets = sorted(r for r in referenced if r not in defined)

    secret_re = re.compile(r"key|token|password|secret|cookie|auth", re.I)
    creds = [v for v in secrets if secret_re.search(v)]
    plain = [v for v in secrets if not secret_re.search(v)]

    os.makedirs(os.path.join(root, "environments"), exist_ok=True)
    rows = [(k, v, True) for k, v in defined.items()]
    rows += [(k, "", True) for k in plain]
    env = dict_block("vars", rows)
    if creds:
        env += list_block("vars:secret", creds)
    write(os.path.join(root, "environments", "VTEX.bru"), env)
    return n, secrets

def main():
    # Clear only the generated collection directories, so the README and the
    # _tools/ directory living alongside them survive a regeneration.
    os.makedirs(DST, exist_ok=True)
    for entry in os.listdir(DST):
        sub = os.path.join(DST, entry)
        if os.path.isdir(sub) and not entry.startswith("_"):
            shutil.rmtree(sub)
    total, colls = 0, 0
    allsecrets = collections.Counter()
    for f in sorted(glob.glob(os.path.join(SRC, "*.json"))):
        n, secrets = emit_collection(f, DST)
        allsecrets.update(secrets)
        total += n
        colls += 1
    print("collections: %d  requests: %d" % (colls, total))
    print("secret/undefined vars:", dict(allsecrets))

if __name__ == "__main__":
    main()
