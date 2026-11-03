#!/usr/bin/env node
/*
 * Stage 2: convert a tree of Bruno .bru collections into the OpenCollection (.yml)
 * format.
 *
 * The serialisation is delegated to @usebruno/filestore -- the same package the
 * Bruno app and the bru CLI use to write these files -- so the output tracks the
 * spec rather than a hand-rolled approximation of it.
 *
 *   node bru-to-opencollection.js <src-bru-tree> <dst-yml-tree>
 */
const fs = require('fs');
const path = require('path');
const store = require('@usebruno/filestore');

const SRC = process.argv[2];
const DST = process.argv[3];

if (!SRC || !DST) {
  console.error('usage: node bru-to-opencollection.js <src-bru-tree> <dst-yml-tree>');
  process.exit(1);
}

const stats = { collections: 0, folders: 0, requests: 0, environments: 0 };
const errors = [];

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : content + '\n');
};

const convertDir = (srcDir, dstDir) => {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      convertDir(src, path.join(dstDir, entry.name));
      continue;
    }
    if (!entry.name.endsWith('.bru')) continue;

    const raw = fs.readFileSync(src, 'utf8');
    try {
      if (entry.name === 'collection.bru') {
        // bruno.json and collection.bru collapse into a single opencollection.yml.
        const config = JSON.parse(fs.readFileSync(path.join(srcDir, 'bruno.json'), 'utf8'));
        delete config.version;
        const root = store.parseCollection(raw, { format: 'bru' });
        write(path.join(dstDir, 'opencollection.yml'), store.stringifyCollection(root, config, { format: 'yml' }));
        stats.collections++;
      } else if (entry.name === 'folder.bru') {
        const root = store.parseFolder(raw, { format: 'bru' });
        // The bru parser hands back `auth: {}` with no mode, which stringifyFolder reads
        // as "has auth" and turns into a stray empty `request: {}`. Spelling the mode out
        // as none keeps the folder file to its info block, while leaving a folder that
        // really does define auth untouched.
        root.request = root.request || {};
        root.request.auth = root.request.auth || {};
        root.request.auth.mode = root.request.auth.mode || 'none';
        write(path.join(dstDir, 'folder.yml'), store.stringifyFolder(root, { format: 'yml' }));
        stats.folders++;
      } else if (path.basename(srcDir) === 'environments') {
        const env = store.parseEnvironment(raw, { format: 'bru' });
        // A .bru environment takes its name from the filename; the yml format stores
        // the name in the file, so carry it across explicitly.
        env.name = entry.name.replace(/\.bru$/, '');
        write(path.join(dstDir, env.name + '.yml'), store.stringifyEnvironment(env, { format: 'yml' }));
        stats.environments++;
      } else {
        const item = store.parseRequest(raw, { format: 'bru' });
        write(path.join(dstDir, entry.name.replace(/\.bru$/, '.yml')), store.stringifyRequest(item, { format: 'yml' }));
        stats.requests++;
      }
    } catch (err) {
      errors.push(src + ' :: ' + err.message);
    }
  }
};

for (const name of fs.readdirSync(SRC)) {
  const dir = path.join(SRC, name);
  if (fs.statSync(dir).isDirectory()) convertDir(dir, path.join(DST, name));
}

console.log('converted ' + JSON.stringify(stats));
if (errors.length) {
  console.error('errors: ' + errors.length);
  errors.forEach((e) => console.error('  ' + e));
  process.exit(1);
}
