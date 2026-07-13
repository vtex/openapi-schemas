import type { OpenAPISpec, HttpMethod } from "../types.js";
import { forEachOperation } from "../types.js";

function generateOperationId(method: HttpMethod, path: string): string {
  const parts = path
    .split("/")
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("{") && part.endsWith("}")) {
        const paramName = part.slice(1, -1);
        return `By${paramName.charAt(0).toUpperCase()}${paramName.slice(1)}`;
      }
      return part
        .replace(/[^a-zA-Z0-9]/g, "_")
        .split("_")
        .filter(Boolean)
        .map((word, i) =>
          i === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join("");
    });

  const methodPrefix = method.toLowerCase();
  return `${methodPrefix}_${parts.join("_")}`;
}

export function ensureOperationId(spec: OpenAPISpec): OpenAPISpec {
  const existingIds = new Set<string>();

  forEachOperation(spec, (_path, _method, operation) => {
    if (operation.operationId) {
      existingIds.add(operation.operationId);
    }
  });

  forEachOperation(spec, (path, method, operation) => {
    if (operation.operationId) return;

    let candidate = generateOperationId(method, path);
    let counter = 1;
    while (existingIds.has(candidate)) {
      candidate = `${generateOperationId(method, path)}_${counter}`;
      counter++;
    }

    operation.operationId = candidate;
    existingIds.add(candidate);
  });

  return spec;
}
