import type {
  OpenAPISpec,
  OpenAPIParameter,
  OpenAPIParameterOrRef,
} from "../types.js";
import { isRef, resolveRef, forEachOperation } from "../types.js";

export interface ParamMatcher {
  name: string;
  in?: string;
}

function matchesParam(
  resolved: OpenAPIParameter,
  matchers: ParamMatcher[],
): boolean {
  return matchers.some(
    (m) =>
      resolved.name.toLowerCase() === m.name.toLowerCase() &&
      (m.in === undefined || resolved.in === m.in),
  );
}

function filterParams(
  params: OpenAPIParameterOrRef[] | undefined,
  matchers: ParamMatcher[],
  spec: OpenAPISpec,
): OpenAPIParameterOrRef[] | undefined {
  if (!params || params.length === 0) return params;

  const filtered = params.filter((param) => {
    if (isRef(param)) {
      const resolved = resolveRef<OpenAPIParameter>(spec, param.$ref);
      if (!resolved) return true;
      return !matchesParam(resolved, matchers);
    }
    return !matchesParam(param, matchers);
  });

  return filtered.length > 0 ? filtered : undefined;
}

export function removeParams(
  spec: OpenAPISpec,
  matchers: ParamMatcher[],
): OpenAPISpec {
  if (matchers.length === 0) return spec;

  forEachOperation(spec, (_path, _method, operation, pathItem) => {
    operation.parameters = filterParams(
      operation.parameters,
      matchers,
      spec,
    );
    pathItem.parameters = filterParams(
      pathItem.parameters,
      matchers,
      spec,
    );
  });

  return spec;
}
