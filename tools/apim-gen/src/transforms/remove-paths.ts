import type { OpenAPISpec } from "../types.js";

export function removePaths(
  spec: OpenAPISpec,
  pathsToRemove: string[],
): OpenAPISpec {
  for (const path of pathsToRemove) {
    delete spec.paths[path];
  }
  return spec;
}
