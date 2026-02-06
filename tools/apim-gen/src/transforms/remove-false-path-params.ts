import type {
  OpenAPISpec,
  OpenAPIParameter,
  OpenAPIParameterOrRef,
} from "../types.js";
import { isRef, resolveRef, forEachOperation, extractPathParams } from "../types.js";

function filterFalsePathParams(
  params: OpenAPIParameterOrRef[] | undefined,
  validPathParams: string[],
  spec: OpenAPISpec,
): OpenAPIParameterOrRef[] | undefined {
  if (!params || params.length === 0) return params;

  const filtered = params.filter((param) => {
    const resolved = isRef(param)
      ? resolveRef<OpenAPIParameter>(spec, param.$ref)
      : param;
    if (!resolved) return true;
    if (resolved.in !== "path") return true;
    return validPathParams.some(
      (valid) => valid.toLowerCase() === resolved.name.toLowerCase(),
    );
  });

  return filtered.length > 0 ? filtered : undefined;
}

export function removeFalsePathParams(spec: OpenAPISpec): OpenAPISpec {
  forEachOperation(spec, (path, _method, operation, pathItem) => {
    const validParams = extractPathParams(path);

    operation.parameters = filterFalsePathParams(
      operation.parameters,
      validParams,
      spec,
    );
    pathItem.parameters = filterFalsePathParams(
      pathItem.parameters,
      validParams,
      spec,
    );
  });

  return spec;
}
