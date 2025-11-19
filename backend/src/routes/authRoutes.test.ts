// ...existing code...
import { describe, it, expect, vi, beforeEach } from "vitest";

let router: any; // will import after mocks are set up

// Create mocks BEFORE importing the router so the module uses the mocked functions
const registerMock = vi.fn();
const loginMock = vi.fn();
const getDashboardMock = vi.fn();
const authenticateMock = vi.fn((req: any, res: any, next: any) => next());

// Use non-hoisted mocks so they run when we import the module later
vi.doMock("../controllers/authController", () => ({
  register: registerMock,
  login: loginMock,
  getDashboard: getDashboardMock,
}));

vi.doMock("../middleware/auth", () => ({
  authenticate: authenticateMock,
}));

// Now import the router inside beforeEach so mocks are applied
describe("authRoutes", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    router = (await import("./authRoutes")).default;
  });

  it("has CORS middleware that sets headers and responds to OPTIONS", () => {
    // First stack item is the CORS middleware defined via router.use(...)
    const corsLayer = (router as any).stack[0];
    expect(corsLayer).toBeDefined();
    const corsMiddleware = corsLayer.handle;

    // Simulate res object to capture headers and status
    const headers: Record<string, string> = {};
    let sentStatus: number | undefined;
    const res = {
      header: (k: string, v: string) => {
        headers[k] = v;
        return res;
      },
      sendStatus: (code: number) => {
        sentStatus = code;
        return res;
      },
    } as any;

    const next = vi.fn();

    // OPTIONS should short-circuit with 200
    corsMiddleware({ method: "OPTIONS" } as any, res, next);
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(headers["Access-Control-Allow-Methods"]).toContain("GET");
    expect(headers["Access-Control-Allow-Methods"]).toContain("POST");
    expect(headers["Access-Control-Allow-Headers"]).toContain("Content-Type");
    expect(sentStatus).toBe(200);

    // Non-OPTIONS should call next()
    const next2 = vi.fn();
    const res2 = {
      header: () => res2,
      sendStatus: vi.fn(),
    } as any;
    corsMiddleware({ method: "GET" } as any, res2, next2);
    expect(next2).toHaveBeenCalled();
  });

  it("defines POST /register route using register controller", () => {
    const routeLayers = (router as any).stack.filter((l: any) => l.route);
    const registerRoute = routeLayers.find(
      (r: any) => r.route.path === "/register"
    );
    expect(registerRoute).toBeDefined();
    expect(registerRoute.route.methods.post).toBeTruthy();

    const handles = registerRoute.route.stack.map((s: any) => s.handle);
    expect(handles).toContain(registerMock);
  });

  it("defines POST /login route using login controller", () => {
    const routeLayers = (router as any).stack.filter((l: any) => l.route);
    const loginRoute = routeLayers.find((r: any) => r.route.path === "/login");
    expect(loginRoute).toBeDefined();
    expect(loginRoute.route.methods.post).toBeTruthy();

    const handles = loginRoute.route.stack.map((s: any) => s.handle);
    expect(handles).toContain(loginMock);
  });

  it("defines GET /dashboard route protected by authenticate middleware then getDashboard handler", () => {
    const routeLayers = (router as any).stack.filter((l: any) => l.route);
    const dashboardRoute = routeLayers.find(
      (r: any) => r.route.path === "/dashboard"
    );
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute.route.methods.get).toBeTruthy();

    const stackHandles = dashboardRoute.route.stack.map((s: any) => s.handle);
    // Expect authenticate middleware to appear before the final handler
    expect(stackHandles[0]).toBe(authenticateMock);
    expect(stackHandles[stackHandles.length - 1]).toBe(getDashboardMock);
  });
});
// ...existing code...
