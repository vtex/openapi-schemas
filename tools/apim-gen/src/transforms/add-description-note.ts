import type { OpenAPISpec } from "../types.js";
import { forEachOperation } from "../types.js";

export function addDescriptionNote(
  spec: OpenAPISpec,
  note: string,
): OpenAPISpec {
  forEachOperation(spec, (_path, method, operation) => {
    const hasBody = ["put", "post", "patch"].includes(method);
    if (!hasBody) return;
    if (operation.requestBody === undefined) return;

    const existing = operation.description || "";
    if (existing.includes(note)) return;

    operation.description = existing
      ? `${existing}\n\n> ${note}`
      : `> ${note}`;
  });

  return spec;
}
