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
