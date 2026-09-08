/**
 * Minimal OpenAPI 3.x type definitions for the transforms.
 * Not exhaustive — only covers what our transforms need to inspect/modify.
 */

// ── OpenAPI Spec Types ──────────────────────────────────────────────

export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, OpenAPIPathItem>;
  components?: OpenAPIComponents;
  security?: unknown[];
  tags?: unknown[];
  externalDocs?: unknown;
  [key: string]: unknown;
}

export interface OpenAPIInfo {
  title: string;
  description?: string;
  version: string;
  [key: string]: unknown;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenAPIServerVariable>;
  [key: string]: unknown;
}

export interface OpenAPIServerVariable {
  default: string;
  description?: string;
  enum?: string[];
  [key: string]: unknown;
}

export interface OpenAPIPathItem {
  summary?: string;
  description?: string;
  parameters?: OpenAPIParameterOrRef[];
  get?: OpenAPIOperation;
  put?: OpenAPIOperation;
  post?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  options?: OpenAPIOperation;
  head?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  trace?: OpenAPIOperation;
  [key: string]: unknown;
}

export interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameterOrRef[];
  requestBody?: OpenAPIRequestBodyOrRef;
  responses?: Record<string, unknown>;
  security?: unknown[];
  [key: string]: unknown;
}

export interface OpenAPIParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  schema?: unknown;
  style?: string;
  [key: string]: unknown;
}

export interface OpenAPIRef {
  $ref: string;
}

export type OpenAPIParameterOrRef = OpenAPIParameter | OpenAPIRef;

export interface OpenAPIRequestBody {
  description?: string;
  content?: Record<string, unknown>;
  required?: boolean;
  [key: string]: unknown;
}

export type OpenAPIRequestBodyOrRef = OpenAPIRequestBody | OpenAPIRef;

export interface OpenAPIComponents {
  schemas?: Record<string, unknown>;
  parameters?: Record<string, OpenAPIParameter>;
  responses?: Record<string, unknown>;
  requestBodies?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  securitySchemes?: Record<string, unknown>;
  examples?: Record<string, unknown>;
  links?: Record<string, unknown>;
  callbacks?: Record<string, unknown>;
  [key: string]: unknown;
}

// ── Helpers ─────────────────────────────────────────────────────────

export const HTTP_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export function isRef(obj: unknown): obj is OpenAPIRef {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "$ref" in obj &&
    typeof (obj as OpenAPIRef).$ref === "string"
  );
}

/**
 * Resolve a JSON $ref pointer within a spec.
 * Only supports local references (starting with #/).
 */
export function resolveRef<T = unknown>(
  spec: OpenAPISpec,
  ref: string,
): T | undefined {
  if (!ref.startsWith("#/")) return undefined;
  const parts = ref
    .slice(2)
    .split("/")
    .map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));
  let current: unknown = spec;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current as T;
}

/**
 * Deep clone a value using structured clone.
 */
export function deepClone<T>(value: T): T {
  return structuredClone(value);
}

/**
 * Iterate over all operations in a spec, calling the callback for each.
 */
export function forEachOperation(
  spec: OpenAPISpec,
  callback: (
    path: string,
    method: HttpMethod,
    operation: OpenAPIOperation,
    pathItem: OpenAPIPathItem,
  ) => void,
): void {
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (operation && typeof operation === "object") {
        callback(path, method, operation as OpenAPIOperation, pathItem);
      }
    }
  }
}

/**
 * Extract path parameter names from a URL path template.
 * e.g., "/api/catalog/{productId}/sku/{skuId}" → ["productId", "skuId"]
 */
export function extractPathParams(pathTemplate: string): string[] {
  const matches = pathTemplate.matchAll(/\{([^}]+)\}/g);
  return Array.from(matches, (m) => m[1]);
}
