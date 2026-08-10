import type { OpenAPISpec } from "../types.js";

export function setOpenapiVersion(
  spec: OpenAPISpec,
  version: string,
): OpenAPISpec {
  spec.openapi = version;
  return spec;
}
