import { mkdirSync, writeFileSync, readFileSync, rmSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runPipeline } from "../src/pipeline.js";
import type { ClientConfig } from "../src/config.js";
import type { OpenAPISpec } from "../src/types.js";

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), "apim-gen-test-"));
}

function writeJsonSpec(dir: string, filename: string, spec: OpenAPISpec): void {
  writeFileSync(join(dir, filename), JSON.stringify(spec), "utf-8");
}

function readJsonSpec(path: string): OpenAPISpec {
  return JSON.parse(readFileSync(path, "utf-8")) as OpenAPISpec;
}

describe("runPipeline", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
    mkdirSync(join(tempDir, "specs"), { recursive: true });
    mkdirSync(join(tempDir, "output"), { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("processes a single spec with defaults", () => {
    const inputSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Source API", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            responses: { "200": { description: "OK" } },
          },
          post: {
            requestBody: { content: { "application/json": {} } },
            responses: { "200": { description: "OK" } },
          },
        },
      },
    };

    writeJsonSpec(join(tempDir, "specs"), "source.json", inputSpec);

    const config: ClientConfig = {
      client: "test-client",
      outputDir: "output",
      specsDir: "specs",
      defaults: {
        openapiVersion: "3.0.3",
        removeParams: [],
        removeFalsePathParams: true,
        ensureOperationId: true,
        descriptionNote: "Send JSON.",
      },
      specs: [
        {
          source: "source.json",
          outputName: "test-api",
        },
      ],
    };

    const results = runPipeline(config, tempDir);

    expect(results).toHaveLength(1);
    expect(results[0].pathCount).toBe(1);

    const output = readJsonSpec(results[0].outputPath);
    expect(output.openapi).toBe("3.0.3");
    expect(output.paths["/items"].get!.operationId).toBeDefined();
    expect(output.paths["/items"].post!.description).toContain("Send JSON.");
  });

  it("processes a spec with split", () => {
    const inputSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Big API", version: "2.0.0" },
      paths: {
        "/api/catalog/products": {
          get: { operationId: "listProducts", responses: {} },
        },
        "/api/catalog/brands": {
          get: { operationId: "listBrands", responses: {} },
        },
        "/api/orders/list": {
          get: { operationId: "listOrders", responses: {} },
        },
      },
    };

    writeJsonSpec(join(tempDir, "specs"), "big.json", inputSpec);

    const config: ClientConfig = {
      client: "test-client",
      outputDir: "output",
      specsDir: "specs",
      defaults: {
        openapiVersion: "3.0.3",
        removeParams: [],
        removeFalsePathParams: false,
        ensureOperationId: false,
        descriptionNote: "",
      },
      specs: [
        {
          source: "big.json",
          split: [
            { prefix: "/api/catalog", outputName: "catalog", title: "Catalog API" },
            { prefix: "/api/orders", outputName: "orders", title: "Orders API" },
          ],
        },
      ],
    };

    const results = runPipeline(config, tempDir);

    expect(results).toHaveLength(2);

    const catalogResult = results.find((r) => r.title === "Catalog API")!;
    expect(catalogResult.pathCount).toBe(2);

    const ordersResult = results.find((r) => r.title === "Orders API")!;
    expect(ordersResult.pathCount).toBe(1);

    const catalogSpec = readJsonSpec(catalogResult.outputPath);
    expect(catalogSpec.info.title).toBe("Catalog API");
    expect(catalogSpec.openapi).toBe("3.0.3");
  });

  it("applies removeParams from defaults", () => {
    const inputSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/items": {
          get: {
            operationId: "getItems",
            parameters: [
              { name: "Content-Type", in: "header" },
              { name: "limit", in: "query" },
            ],
            responses: {},
          },
        },
      },
    };

    writeJsonSpec(join(tempDir, "specs"), "source.json", inputSpec);

    const config: ClientConfig = {
      client: "test-client",
      outputDir: "output",
      specsDir: "specs",
      defaults: {
        openapiVersion: "3.0.3",
        removeParams: [{ name: "Content-Type" }],
        removeFalsePathParams: false,
        ensureOperationId: false,
        descriptionNote: "",
      },
      specs: [
        { source: "source.json", outputName: "test" },
      ],
    };

    const results = runPipeline(config, tempDir);
    const output = readJsonSpec(results[0].outputPath);

    const params = output.paths["/items"].get!.parameters;
    expect(params).toHaveLength(1);
    expect((params![0] as { name: string }).name).toBe("limit");
  });

  it("applies custom title per spec entry", () => {
    const inputSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Original", version: "1.0.0" },
      paths: {
        "/a": { get: { operationId: "getA", responses: {} } },
      },
    };

    writeJsonSpec(join(tempDir, "specs"), "source.json", inputSpec);

    const config: ClientConfig = {
      client: "test-client",
      outputDir: "output",
      specsDir: "specs",
      defaults: {
        openapiVersion: "3.0.3",
        removeParams: [],
        removeFalsePathParams: false,
        ensureOperationId: false,
        descriptionNote: "",
      },
      specs: [
        { source: "source.json", outputName: "renamed", title: "Renamed API" },
      ],
    };

    const results = runPipeline(config, tempDir);
    const output = readJsonSpec(results[0].outputPath);
    expect(output.info.title).toBe("Renamed API");
  });

  it("derives outputName from source when not specified", () => {
    const inputSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
      paths: {
        "/a": { get: { operationId: "getA", responses: {} } },
      },
    };

    writeJsonSpec(join(tempDir, "specs"), "My API.json", inputSpec);

    const config: ClientConfig = {
      client: "test",
      outputDir: "output",
      specsDir: "specs",
      defaults: {
        openapiVersion: "3.0.3",
        removeParams: [],
        removeFalsePathParams: false,
        ensureOperationId: false,
        descriptionNote: "",
      },
      specs: [
        { source: "My API.json" },
      ],
    };

    const results = runPipeline(config, tempDir);
    expect(results[0].outputPath).toContain("my-api.json");
  });

  it("cleans up unused components", () => {
    const inputSpec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "Test", version: "1.0.0" },
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
    };

    writeJsonSpec(join(tempDir, "specs"), "source.json", inputSpec);

    const config: ClientConfig = {
      client: "test",
      outputDir: "output",
      specsDir: "specs",
      defaults: {
        openapiVersion: "3.0.3",
        removeParams: [],
        removeFalsePathParams: false,
        ensureOperationId: false,
        descriptionNote: "",
      },
      specs: [
        { source: "source.json", outputName: "test" },
      ],
    };

    const results = runPipeline(config, tempDir);
    const output = readJsonSpec(results[0].outputPath);
    expect(output.components?.schemas).toHaveProperty("Item");
    expect(output.components?.schemas).not.toHaveProperty("Unused");
  });
});
