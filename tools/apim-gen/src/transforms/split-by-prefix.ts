import type { OpenAPISpec, OpenAPIComponents } from "../types.js";
import { deepClone } from "../types.js";

export interface SplitConfig {
  prefix: string;
  outputName: string;
  title?: string;
}

export function splitByPrefix(
  spec: OpenAPISpec,
  splits: SplitConfig[],
): Map<string, OpenAPISpec> {
  const result = new Map<string, OpenAPISpec>();

  for (const split of splits) {
    const clone = deepClone(spec);

    const filteredPaths: Record<string, unknown> = {};
    for (const [path, pathItem] of Object.entries(clone.paths)) {
      if (path.startsWith(split.prefix)) {
        filteredPaths[path] = pathItem;
      }
    }

    clone.paths = filteredPaths as OpenAPISpec["paths"];

    if (split.title) {
      clone.info.title = split.title;
    }

    result.set(split.outputName, clone);
  }

  return result;
}
