import { describe, it, expect, vi } from "vitest";
import router from "./gameRoutes";

describe("gameRoutes", () => {
  it("exposes a stack with middleware and route layers", () => {
    const stack = (router as any).stack as any[];
    expect(Array.isArray(stack)).toBe(true);
    expect(stack.length).toBeGreaterThanOrEqual(3);
  });

  it("has CORS middleware as the first layer (not a route)", () => {
    const first = (router as any).stack[0];
    expect(first).toBeDefined();
    expect(first.route).toBeUndefined();
    expect(typeof first.handle).toBe("function");
  });

  it("CORS middleware responds with 200 for OPTIONS requests", () => {
    const middleware = (router as any).stack[0].handle;
    const req = { method: "OPTIONS" } as any;
    const res = {
      headers: {} as Record<string, string>,
      header(key: string, value: string) {
        this.headers[key] = value;
      },
      sendStatus: vi.fn(),
    };
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("CORS middleware sets headers and calls next for non-OPTIONS requests", () => {
    const middleware = (router as any).stack[0].handle;
    const req = { method: "GET" } as any;
    const res = {
      headers: {} as Record<string, string>,
      header(key: string, value: string) {
        this.headers[key] = value;
      },
      sendStatus: vi.fn(),
    };
    const next = vi.fn();

    middleware(req, res, next);

    expect(res.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(res.headers["Access-Control-Allow-Methods"]).toContain("GET");
    expect(res.headers["Access-Control-Allow-Headers"]).toContain(
      "Content-Type"
    );
    expect(next).toHaveBeenCalled();
    expect(res.sendStatus).not.toHaveBeenCalled();
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
