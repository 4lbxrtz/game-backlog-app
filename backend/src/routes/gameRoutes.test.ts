import { describe, it, expect, vi } from "vitest";
import router from "./gameRoutes";

describe("gameRoutes", () => {
  it("exposes a stack with middleware and route layers", () => {
    const stack = (router as any).stack as any[];
    expect(Array.isArray(stack)).toBe(true);
    expect(stack.length).toBeGreaterThanOrEqual(3);
  });

  it("registers GET /search and GET /:id routes", () => {
    const routeLayers = (router as any).stack
      .filter((l: any) => l.route)
      .map((l: any) => l.route);
    const paths = routeLayers.map((r: any) => r.path);
    expect(paths).toEqual(expect.arrayContaining(["/search", "/:id"]));

    const searchRoute = routeLayers.find((r: any) => r.path === "/search");
    const idRoute = routeLayers.find((r: any) => r.path === "/:id");

    expect(searchRoute).toBeDefined();
    expect(idRoute).toBeDefined();
    expect(searchRoute.methods.get).toBeTruthy();
    expect(idRoute.methods.get).toBeTruthy();
  });
});
