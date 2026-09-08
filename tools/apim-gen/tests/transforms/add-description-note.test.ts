import { addDescriptionNote } from "../../src/transforms/add-description-note.js";
import type { OpenAPISpec } from "../../src/types.js";

const NOTE = "Send with `Content-Type: application/json`.";

function makeSpec(overrides?: Partial<OpenAPISpec>): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "Test", version: "1.0.0" },
    paths: {},
    ...overrides,
  };
}

describe("addDescriptionNote", () => {
  it("adds note to POST operations with requestBody", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          post: {
            operationId: "createItem",
            requestBody: { content: { "application/json": {} } },
          },
        },
      },
    });

    addDescriptionNote(spec, NOTE);

    expect(spec.paths["/items"].post!.description).toBe(`> ${NOTE}`);
  });

  it("adds note to PUT and PATCH operations with requestBody", () => {
    const spec = makeSpec({
      paths: {
        "/items/{id}": {
          put: {
            operationId: "updateItem",
            requestBody: { content: {} },
          },
          patch: {
            operationId: "patchItem",
            requestBody: { content: {} },
          },
        },
      },
    });

    addDescriptionNote(spec, NOTE);

    expect(spec.paths["/items/{id}"].put!.description).toBe(`> ${NOTE}`);
    expect(spec.paths["/items/{id}"].patch!.description).toBe(`> ${NOTE}`);
  });

  it("does NOT add note to GET/DELETE operations", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          get: { operationId: "getItems" },
          delete: { operationId: "deleteItems" },
        },
      },
    });

    addDescriptionNote(spec, NOTE);

    expect(spec.paths["/items"].get!.description).toBeUndefined();
    expect(spec.paths["/items"].delete!.description).toBeUndefined();
  });

  it("does NOT add note to POST without requestBody", () => {
    const spec = makeSpec({
      paths: {
        "/trigger": {
          post: { operationId: "triggerAction" },
        },
      },
    });

    addDescriptionNote(spec, NOTE);

    expect(spec.paths["/trigger"].post!.description).toBeUndefined();
  });

  it("appends note to existing description", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          post: {
            operationId: "createItem",
            description: "Creates an item.",
            requestBody: { content: {} },
          },
        },
      },
    });

    addDescriptionNote(spec, NOTE);

    expect(spec.paths["/items"].post!.description).toBe(
      `Creates an item.\n\n> ${NOTE}`,
    );
  });

  it("is idempotent — does not add the same note twice", () => {
    const spec = makeSpec({
      paths: {
        "/items": {
          post: {
            operationId: "createItem",
            requestBody: { content: {} },
          },
        },
      },
    });

    addDescriptionNote(spec, NOTE);
    addDescriptionNote(spec, NOTE);

    const desc = spec.paths["/items"].post!.description!;
    const occurrences = desc.split(NOTE).length - 1;
    expect(occurrences).toBe(1);
  });

  it("returns the spec reference", () => {
    const spec = makeSpec({ paths: {} });
    const result = addDescriptionNote(spec, NOTE);
    expect(result).toBe(spec);
  });

  it("handles empty paths", () => {
    const spec = makeSpec({ paths: {} });
    addDescriptionNote(spec, NOTE);
    expect(Object.keys(spec.paths)).toHaveLength(0);
  });
});
