import { removePaths } from "../../src/transforms/remove-paths.js";
import type { OpenAPISpec } from "../../src/types.js";

function makeSpec(paths: Record<string, object>): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "Test", version: "1.0.0" },
    paths: paths as OpenAPISpec["paths"],
  };
}

describe("removePaths", () => {
  it("removes specified paths from the spec", () => {
    const spec = makeSpec({
      "/a": { get: {} },
      "/b": { get: {} },
      "/c": { get: {} },
    });

    removePaths(spec, ["/a", "/c"]);

    expect(Object.keys(spec.paths)).toEqual(["/b"]);
  });

  it("is a no-op when paths to remove do not exist", () => {
    const spec = makeSpec({
      "/a": { get: {} },
    });

    removePaths(spec, ["/nonexistent"]);

    expect(Object.keys(spec.paths)).toEqual(["/a"]);
  });

  it("handles empty pathsToRemove array", () => {
    const spec = makeSpec({
      "/a": { get: {} },
      "/b": { get: {} },
    });

    removePaths(spec, []);

    expect(Object.keys(spec.paths)).toEqual(["/a", "/b"]);
  });

  it("removes all paths when all are specified", () => {
    const spec = makeSpec({
      "/a": { get: {} },
      "/b": { get: {} },
    });

    removePaths(spec, ["/a", "/b"]);

    expect(Object.keys(spec.paths)).toEqual([]);
  });

  it("returns the spec reference", () => {
    const spec = makeSpec({ "/a": { get: {} } });
    const result = removePaths(spec, ["/a"]);
    expect(result).toBe(spec);
  });
});
