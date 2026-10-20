import { setOpenapiVersion } from "../../src/transforms/set-openapi-version.js";
import type { OpenAPISpec } from "../../src/types.js";

function makeSpec(version: string): OpenAPISpec {
  return {
    openapi: version,
    info: { title: "Test", version: "1.0.0" },
    paths: {},
  };
}

describe("setOpenapiVersion", () => {
  it("sets the openapi version", () => {
    const spec = makeSpec("3.0.0");
    setOpenapiVersion(spec, "3.0.3");
    expect(spec.openapi).toBe("3.0.3");
  });

  it("overwrites an existing version", () => {
    const spec = makeSpec("3.1.0");
    setOpenapiVersion(spec, "3.0.3");
    expect(spec.openapi).toBe("3.0.3");
  });

  it("returns the spec reference", () => {
    const spec = makeSpec("3.0.0");
    const result = setOpenapiVersion(spec, "3.0.3");
    expect(result).toBe(spec);
  });

  it("is a no-op when version is already the same", () => {
    const spec = makeSpec("3.0.3");
    setOpenapiVersion(spec, "3.0.3");
    expect(spec.openapi).toBe("3.0.3");
  });
});
