import type { OpenAPISpec } from "../types.js";

function collectRefs(obj: unknown, refs: Set<string>): void {
  if (obj === null || obj === undefined) return;
  if (typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectRefs(item, refs);
    }
    return;
  }

  const record = obj as Record<string, unknown>;
  if (typeof record["$ref"] === "string") {
    refs.add(record["$ref"]);
  }

  for (const value of Object.values(record)) {
    collectRefs(value, refs);
  }
}

function refToComponentKey(ref: string): { section: string; name: string } | null {
  const match = ref.match(/^#\/components\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return {
    section: match[1],
    name: match[2].replace(/~1/g, "/").replace(/~0/g, "~"),
  };
}

export function cleanupComponents(spec: OpenAPISpec): OpenAPISpec {
  if (!spec.components) return spec;

  const maxIterations = 20;
  for (let i = 0; i < maxIterations; i++) {
    const refs = new Set<string>();

    collectRefs(spec.paths, refs);
    collectRefs(spec.tags, refs);
    collectRefs(spec.security, refs);

    // Also collect refs from components themselves (cross-references)
    if (spec.components) {
      collectRefs(spec.components, refs);
    }

    const referencedKeys = new Set<string>();
    for (const ref of refs) {
      const parsed = refToComponentKey(ref);
      if (parsed) {
        referencedKeys.add(`${parsed.section}/${parsed.name}`);
      }
    }

    let removedAny = false;
    for (const [section, sectionValue] of Object.entries(spec.components)) {
      if (
        typeof sectionValue !== "object" ||
        sectionValue === null ||
        Array.isArray(sectionValue)
      ) {
        continue;
      }

      const sectionRecord = sectionValue as Record<string, unknown>;
      for (const name of Object.keys(sectionRecord)) {
        const key = `${section}/${name}`;
        if (!referencedKeys.has(key)) {
          delete sectionRecord[name];
          removedAny = true;
        }
      }

      if (Object.keys(sectionRecord).length === 0) {
        delete (spec.components as Record<string, unknown>)[section];
      }
    }

    if (!removedAny) break;
  }

  if (spec.components && Object.keys(spec.components).length === 0) {
    delete spec.components;
  }

  return spec;
}
