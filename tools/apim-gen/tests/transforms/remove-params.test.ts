import { removeParams } from "../../src/transforms/remove-params.js";
import type { OpenAPISpec } from "../../src/types.js";

function makeSpec(overrides?: Partial<OpenAPISpec>): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
    ...overrides,
  };
}

describe("removeParams", () => {
  it("removes inline operation parameters by name (case-insensitive)", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [
              { name: "X-Custom-Header", in: "header" },
              { name: "limit", in: "query" },
            ],
          },
        },
      },
    });

    removeParams(spec, [{ name: "x-custom-header" }]);

    const params = spec.paths["/items"].get!.parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { name: string }).name).toBe("limit");
  });

  it("removes inline path-level parameters", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          parameters: [
            { name: "Accept", in: "header" },
            { name: "id", in: "path", required: true },
          ],
          get: { operationId: "getItems" },
        },
      },
    });

    removeParams(spec, [{ name: "Accept" }]);

    const params = spec.paths["/items"].parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { name: string }).name).toBe("id");
  });

  it("removes $ref parameters by resolving them", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [
              { $ref: "#/components/parameters/ContentType" },
              { name: "limit", in: "query" },
            ],
          },
        },
      },
      components: {
        parameters: {
          ContentType: {
            name: "Content-Type",
            in: "header",
          },
        },
      },
    });

    removeParams(spec, [{ name: "content-type" }]);

    const params = spec.paths["/items"].get!.parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { name: string }).name).toBe("limit");
  });

  it("matches by name AND in when 'in' is specified", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [
              { name: "token", in: "header" },
              { name: "token", in: "query" },
            ],
          },
        },
      },
    });

    removeParams(spec, [{ name: "token", in: "header" }]);

    const params = spec.paths["/items"].get!.parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { in: string }).in).toBe("query");
  });

  it("returns spec unchanged when matchers array is empty", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [{ name: "limit", in: "query" }],
          },
        },
      },
    });

    removeParams(spec, []);

    expect(spec.paths["/items"].get!.parameters).toHaveLength(1);
  });

  it("sets parameters to undefined when all are removed", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [{ name: "Accept", in: "header" }],
          },
        },
      },
    });

    removeParams(spec, [{ name: "accept" }]);

    expect(spec.paths["/items"].get!.parameters).toBeUndefined();
  });

  it("keeps unresolvable $ref params intact", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [
              { $ref: "#/components/parameters/Missing" },
              { name: "limit", in: "query" },
            ],
          },
        },
      },
    });

    removeParams(spec, [{ name: "limit" }]);

    const params = spec.paths["/items"].get!.parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { $ref: string }).$ref).toBe(
      "#/components/parameters/Missing",
    );
  });

  it("removes params across multiple operations and paths", () => {
    const spec = makeSpec({
      paths: {
        "/a": {
          get: {
            operationId: "getA",
            parameters: [
              { name: "X-Remove", in: "header" },
              { name: "keep", in: "query" },
            ],
          },
          post: {
            operationId: "postA",
            parameters: [{ name: "X-Remove", in: "header" }],
          },
        },
        "/b": {
          get: {
            operationId: "getB",
            parameters: [{ name: "X-Remove", in: "header" }],
          },
        },
      },
    });

    removeParams(spec, [{ name: "x-remove" }]);

    expect(spec.paths["/a"].get!.parameters).toHaveLength(1);
    expect(spec.paths["/a"].post!.parameters).toBeUndefined();
    expect(spec.paths["/b"].get!.parameters).toBeUndefined();
  });
});
