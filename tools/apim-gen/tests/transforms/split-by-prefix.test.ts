import { splitByPrefix } from "../../src/transforms/split-by-prefix.js";
import type { OpenAPISpec } from "../../src/types.js";

function makeSpec(paths: Record<string, object>): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    paths: paths as OpenAPISpec["paths"],
  };
}

describe("splitByPrefix", () => {
  it("splits paths by prefix into separate specs", () => {
    const spec = makeSpec({
      "/api/catalog/products": { get: { operationId: "listProducts" } },
      "/api/catalog/categories": { get: { operationId: "listCategories" } },
      "/api/orders/list": { get: { operationId: "listOrders" } },
    });

    const result = splitByPrefix(spec, [
      { prefix: "/api/catalog", outputName: "catalog" },
      { prefix: "/api/orders", outputName: "orders" },
    ]);

    expect(result.size).toBe(2);

    const catalog = result.get("catalog")!;
    expect(Object.keys(catalog.paths)).toEqual([
      "/api/catalog/products",
      "/api/catalog/categories",
    ]);

    const orders = result.get("orders")!;
    expect(Object.keys(orders.paths)).toEqual(["/api/orders/list"]);
  });

  it("returns empty paths when prefix matches nothing", () => {
    const spec = makeSpec({
      "/api/catalog/products": { get: { operationId: "listProducts" } },
    });

    const result = splitByPrefix(spec, [
      { prefix: "/api/orders", outputName: "orders" },
    ]);

    expect(result.size).toBe(1);
    expect(Object.keys(result.get("orders")!.paths)).toEqual([]);
  });

  it("sets title when provided in split config", () => {
    const spec = makeSpec({
      "/api/v1/items": { get: { operationId: "getItems" } },
    });

    const result = splitByPrefix(spec, [
      { prefix: "/api/v1", outputName: "v1", title: "V1 API" },
    ]);

    expect(result.get("v1")!.info.title).toBe("V1 API");
  });

  it("keeps original title when split config has no title", () => {
    const spec = makeSpec({
      "/api/v1/items": { get: { operationId: "getItems" } },
    });

    const result = splitByPrefix(spec, [
      { prefix: "/api/v1", outputName: "v1" },
    ]);

    expect(result.get("v1")!.info.title).toBe("Test API");
  });

  it("does not mutate the original spec", () => {
    const spec = makeSpec({
      "/api/a/1": { get: {} },
      "/api/b/2": { get: {} },
    });

    const originalPaths = Object.keys(spec.paths);
    splitByPrefix(spec, [
      { prefix: "/api/a", outputName: "a", title: "Changed" },
    ]);

    expect(Object.keys(spec.paths)).toEqual(originalPaths);
    expect(spec.info.title).toBe("Test API");
  });

  it("handles multiple splits from same spec", () => {
    const spec = makeSpec({
      "/v1/a": { get: {} },
      "/v1/b": { get: {} },
      "/v2/a": { get: {} },
    });

    const result = splitByPrefix(spec, [
      { prefix: "/v1", outputName: "v1" },
      { prefix: "/v2", outputName: "v2" },
    ]);

    expect(Object.keys(result.get("v1")!.paths)).toHaveLength(2);
    expect(Object.keys(result.get("v2")!.paths)).toHaveLength(1);
  });

  it("preserves components and other top-level keys in each split", () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: { "/a/1": { get: {} } } as OpenAPISpec["paths"],
      components: { schemas: { Foo: { type: "object" } } },
      servers: [{ url: "https://example.com" }],
    };

    const result = splitByPrefix(spec, [
      { prefix: "/a", outputName: "a" },
    ]);

    const a = result.get("a")!;
    expect(a.components?.schemas).toHaveProperty("Foo");
    expect(a.servers).toHaveLength(1);
  });
});
