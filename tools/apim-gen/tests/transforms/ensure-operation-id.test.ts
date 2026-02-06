import { ensureOperationId } from "../../src/transforms/ensure-operation-id.js";
import type { OpenAPISpec } from "../../src/types.js";

function makeSpec(overrides?: Partial<OpenAPISpec>): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
    ...overrides,
  };
}

describe("ensureOperationId", () => {
  it("generates operationId for operations without one", () => {
    const spec = makeSpec({
      paths: {
        "/api/items": {
          get: { responses: {} },
        },
      },
    });

    ensureOperationId(spec);

    expect(spec.paths["/api/items"].get!.operationId).toBeDefined();
    expect(spec.paths["/api/items"].get!.operationId).toContain("get");
  });

  it("preserves existing operationIds", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: { operationId: "myCustomId", responses: {} },
        },
      },
    });

    ensureOperationId(spec);

    expect(spec.paths["/items"].get!.operationId).toBe("myCustomId");
  });

  it("generates unique ids for same path different methods", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: { responses: {} },
          post: { responses: {} },
        },
      },
    });

    ensureOperationId(spec);

    const getId = spec.paths["/items"].get!.operationId;
    const postId = spec.paths["/items"].post!.operationId;
    expect(getId).not.toBe(postId);
  });

  it("handles path parameters in generated ids", () => {
    const spec = makeSpec({
      paths: {
        "/items/{itemId}": {
          get: { responses: {} },
        },
      },
    });

    ensureOperationId(spec);

    const opId = spec.paths["/items/{itemId}"].get!.operationId!;
    expect(opId).toContain("ByItemId");
  });

  it("deduplicates with counter when collision occurs", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: { operationId: "get_items", responses: {} },
        },
        "/items/": {
          get: { responses: {} },
        },
      },
    });

    ensureOperationId(spec);

    const ids = new Set<string>();
    for (const pathItem of Object.values(spec.paths)) {
      if (pathItem.get?.operationId) {
        ids.add(pathItem.get.operationId);
      }
    }
    expect(ids.size).toBe(2);
  });

  it("is a no-op when all operations already have ids", () => {
    const spec = makeSpec({
      paths: {
        "/a": { get: { operationId: "getA", responses: {} } },
        "/b": { post: { operationId: "postB", responses: {} } },
      },
    });

    ensureOperationId(spec);

    expect(spec.paths["/a"].get!.operationId).toBe("getA");
    expect(spec.paths["/b"].post!.operationId).toBe("postB");
  });

  it("handles empty paths", () => {
    const spec = makeSpec({ paths: {} });
    ensureOperationId(spec);
    expect(Object.keys(spec.paths)).toHaveLength(0);
  });

  it("returns the spec reference", () => {
    const spec = makeSpec({ paths: {} });
    const result = ensureOperationId(spec);
    expect(result).toBe(spec);
  });
});
