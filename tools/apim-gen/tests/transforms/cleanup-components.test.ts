import { cleanupComponents } from "../../src/transforms/cleanup-components.js";
import type { OpenAPISpec } from "../../src/types.js";

function makeSpec(overrides?: Partial<OpenAPISpec>): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
    ...overrides,
  };
}

describe("cleanupComponents", () => {
  it("removes unreferenced schemas", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Item" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Item: { type: "object" },
          Unused: { type: "string" },
        },
      },
    });

    cleanupComponents(spec);

    expect(spec.components?.schemas).toHaveProperty("Item");
    expect(spec.components?.schemas).not.toHaveProperty("Unused");
  });

  it("removes components section entirely when nothing is referenced", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: { operationId: "getItems", responses: {} },
        },
      },
      components: {
        schemas: {
          Orphan: { type: "object" },
        },
      },
    });

    cleanupComponents(spec);

    expect(spec.components).toBeUndefined();
  });

  it("is a no-op when there are no components", () => {
    const spec = makeSpec({
      paths: { "/a": { get: { operationId: "getA" } } },
    });

    cleanupComponents(spec);

    expect(spec.components).toBeUndefined();
  });

  it("keeps cross-referenced components", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/ItemList" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          ItemList: {
            type: "array",
            items: { $ref: "#/components/schemas/Item" },
          },
          Item: { type: "object", properties: { id: { type: "string" } } },
        },
      },
    });

    cleanupComponents(spec);

    expect(spec.components?.schemas).toHaveProperty("ItemList");
    expect(spec.components?.schemas).toHaveProperty("Item");
  });

  it("iteratively removes components that only reference removed components", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Used" },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Used: { type: "object" },
          ChainA: {
            type: "object",
            properties: {
              b: { $ref: "#/components/schemas/ChainB" },
            },
          },
          ChainB: {
            type: "object",
            properties: {
              c: { $ref: "#/components/schemas/ChainC" },
            },
          },
          ChainC: { type: "string" },
        },
      },
    });

    cleanupComponents(spec);

    expect(spec.components?.schemas).toHaveProperty("Used");
    expect(spec.components?.schemas).not.toHaveProperty("ChainA");
    expect(spec.components?.schemas).not.toHaveProperty("ChainB");
    expect(spec.components?.schemas).not.toHaveProperty("ChainC");
  });

  it("handles multiple component sections (schemas, parameters, responses)", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [{ $ref: "#/components/parameters/Limit" }],
            responses: {
              "200": { $ref: "#/components/responses/Success" },
            },
          },
        },
      },
      components: {
        schemas: {
          Orphan: { type: "object" },
        },
        parameters: {
          Limit: { name: "limit", in: "query" },
          Unused: { name: "unused", in: "header" },
        },
        responses: {
          Success: { description: "OK" },
        },
      },
    });

    cleanupComponents(spec);

    expect(spec.components?.schemas).toBeUndefined();
    expect(spec.components?.parameters).toHaveProperty("Limit");
    expect(spec.components?.parameters).not.toHaveProperty("Unused");
    expect(spec.components?.responses).toHaveProperty("Success");
  });

  it("removes empty component sections", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [{ $ref: "#/components/parameters/Limit" }],
          },
        },
      },
      components: {
        schemas: {
          Unused: { type: "object" },
        },
        parameters: {
          Limit: { name: "limit", in: "query" },
        },
      },
    });

    cleanupComponents(spec);

    expect(spec.components?.schemas).toBeUndefined();
    expect(spec.components?.parameters).toHaveProperty("Limit");
  });

  it("returns the spec reference", () => {
    const spec = makeSpec({ paths: {} });
    const result = cleanupComponents(spec);
    expect(result).toBe(spec);
  });
});
