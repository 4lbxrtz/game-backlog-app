/* eslint-disable @typescript-eslint/no-explicit-any */
// ...existing code...
import { describe, it, expect, beforeEach, vi } from "vitest";

// Provide a minimal in-memory Storage polyfill for Node test environment
const makeStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  } as unknown as Storage;
};

if (typeof (globalThis as any).localStorage === "undefined") {
  (globalThis as any).localStorage = makeStorage();
}
if (typeof (globalThis as any).sessionStorage === "undefined") {
  (globalThis as any).sessionStorage = makeStorage();
}

// Import modules after setting up storage mocks
import { authService } from "./authService";
import { api } from "./api";

describe("authService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("register posts to /api/auth/register with correct payload and returns response.data", async () => {
    const mockResponse = { data: { id: 1, username: "bob" } };
    const postSpy = vi.spyOn(api, "post").mockResolvedValue(mockResponse);

    const result = await authService.register(
      "bob",
      "bob@example.com",
      "secret"
    );

    expect(postSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/register"),
      {
        username: "bob",
        email: "bob@example.com",
        password: "secret",
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("login posts to /api/auth/login with correct payload and returns response.data", async () => {
    const mockResponse = { data: { token: "abc" } };
    const postSpy = vi.spyOn(api, "post").mockResolvedValue(mockResponse);

    const result = await authService.login("alice@example.com", "pwd");

    expect(postSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      {
        email: "alice@example.com",
        password: "pwd",
      }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("getDashboard calls GET /api/auth/dashboard and returns response.data", async () => {
    const mockResponse = { data: { msg: "ok" } };
    const getSpy = vi.spyOn(api, "get").mockResolvedValue(mockResponse);

    const result = await authService.getDashboard();

    expect(getSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/dashboard")
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("register propagates errors from api.post", async () => {
    const error = new Error("network failure");
    vi.spyOn(api, "post").mockRejectedValue(error);

    await expect(authService.register("u", "e@e.com", "p")).rejects.toThrow(
      "network failure"
    );
  });

  it("login propagates errors from api.post", async () => {
    const error = new Error("login failed");
    vi.spyOn(api, "post").mockRejectedValue(error);

    await expect(authService.login("e@e.com", "p")).rejects.toThrow(
      "login failed"
    );
  });

  it("logout removes token and user from both localStorage and sessionStorage", () => {
    localStorage.setItem("token", "t1");
    localStorage.setItem("user", "u1");
    sessionStorage.setItem("token", "t2");
    sessionStorage.setItem("user", "u2");

    authService.logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
    expect(sessionStorage.getItem("user")).toBeNull();
  });
});
