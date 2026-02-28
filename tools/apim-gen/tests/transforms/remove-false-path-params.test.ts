import { removeFalsePathParams } from "../../src/transforms/remove-false-path-params.js";
import type { OpenAPISpec } from "../../src/types.js";

function makeSpec(overrides?: Partial<OpenAPISpec>): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
    ...overrides,
  };
}

describe("removeFalsePathParams", () => {
  it("removes path params not present in URL template", () => {
    const spec = makeSpec({
      paths: {
        "/items/{itemId}": {
          get: {
            operationId: "getItem",
            parameters: [
              { name: "itemId", in: "path", required: true },
              { name: "accountName", in: "path", required: true },
            ],
          },
        },
      },
    });

    removeFalsePathParams(spec);

    const params = spec.paths["/items/{itemId}"].get!.parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { name: string }).name).toBe("itemId");
  });

  it("keeps non-path params even if not in URL template", () => {
    const spec = makeSpec({
      paths: {
        "/items/{itemId}": {
          get: {
            operationId: "getItem",
            parameters: [
              { name: "itemId", in: "path", required: true },
              { name: "limit", in: "query" },
              { name: "Authorization", in: "header" },
            ],
          },
        },
      },
    });

    removeFalsePathParams(spec);

    const params = spec.paths["/items/{itemId}"].get!.parameters;
    expect(params).toHaveLength(3);
  });

  it("handles path-level parameters", () => {
    const spec = makeSpec({
      paths: {
        "/items/{itemId}": {
          parameters: [
            { name: "itemId", in: "path", required: true },
            { name: "environment", in: "path", required: true },
          ],
          get: { operationId: "getItem" },
        },
      },
    });

    removeFalsePathParams(spec);

    const params = spec.paths["/items/{itemId}"].parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { name: string }).name).toBe("itemId");
  });

  it("resolves $ref params before checking", () => {
    const spec = makeSpec({
      paths: {
        "/items/{itemId}": {
          get: {
            operationId: "getItem",
            parameters: [
              { $ref: "#/components/parameters/AccountName" },
              { name: "itemId", in: "path", required: true },
            ],
          },
        },
      },
      components: {
        parameters: {
          AccountName: {
            name: "accountName",
            in: "path",
            required: true,
          },
        },
      },
    });

    removeFalsePathParams(spec);

    const params = spec.paths["/items/{itemId}"].get!.parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { name: string }).name).toBe("itemId");
  });

  it("sets parameters to undefined when all path params are false", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [
              { name: "accountName", in: "path", required: true },
            ],
          },
        },
      },
    });

    removeFalsePathParams(spec);

    expect(spec.paths["/items"].get!.parameters).toBeUndefined();
  });

  it("is a no-op when all path params are valid", () => {
    const spec = makeSpec({
      paths: {
        "/items/{itemId}/details/{detailId}": {
          get: {
            operationId: "getDetail",
            parameters: [
              { name: "itemId", in: "path", required: true },
              { name: "detailId", in: "path", required: true },
            ],
          },
        },
      },
    });

    removeFalsePathParams(spec);

    const params =
      spec.paths["/items/{itemId}/details/{detailId}"].get!.parameters;
    expect(params).toHaveLength(2);
  });

  it("handles paths with no parameters gracefully", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: { operationId: "getItems" },
        },
      },
    });

    removeFalsePathParams(spec);

    expect(spec.paths["/items"].get!.parameters).toBeUndefined();
  });

  it("matches path param names case-insensitively", () => {
    const spec = makeSpec({
      paths: {
        "/items/{ItemId}": {
          get: {
            operationId: "getItem",
            parameters: [
              { name: "itemid", in: "path", required: true },
            ],
          },
        },
      },
    });

    removeFalsePathParams(spec);

    const params = spec.paths["/items/{ItemId}"].get!.parameters;
    expect(params).toHaveLength(1);
  });

  it("keeps unresolvable $ref params", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [
              { $ref: "#/components/parameters/Unknown" },
            ],
          },
        },
      },
    });

    removeFalsePathParams(spec);

    const params = spec.paths["/items"].get!.parameters;
    expect(params).toHaveLength(1);
  });
});
