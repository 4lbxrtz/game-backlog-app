/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, beforeEach, it, expect } from "vitest";
import { api } from "../services/api";

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

// Mock the api module before importing the provider so the module uses the mock
vi.mock("../services/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Partially mock React: keep real React exports but replace useState and useEffect
// so we can execute hook logic synchronously without a DOM renderer.
vi.mock("react", async () => {
  const React = await vi.importActual<any>("react");
  return {
    ...React,
    useState: (initial: any) => {
      const ref = { current: initial };
      const setState = (v: any) => {
        ref.current = typeof v === "function" ? v(ref.current) : v;
      };
      return [ref, setState];
    },
    useEffect: (cb: Function) => {
      try {
        const maybeCleanup = cb();
        if (typeof maybeCleanup === "function") {
          // ignore cleanup in tests
        }
      } catch {
        // ignore
      }
    },
  };
});

// import the provider AFTER mocking react so the provider uses the mocked hooks
import { AuthProvider } from "./authContext";

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

it("calls /auth/me with stored token on mount", async () => {
  localStorage.setItem("token", "stored-token");
  (api.get as any).mockResolvedValueOnce({
    data: { id: 1, username: "u", email: "e" },
  });

  // invoke provider function directly (hooks are mocked to run synchronously)
  // we don't need to render to a DOM
  AuthProvider({ children: "child" });

  // wait one tick so any promises inside effect settle
  await new Promise((r) => setTimeout(r, 0));

  expect(api.get).toHaveBeenCalledTimes(1);
  expect(api.get).toHaveBeenCalledWith("/auth/me", {
    headers: { Authorization: "Bearer stored-token" },
  });
});

it("removes token from localStorage when /auth/me fails", async () => {
  localStorage.setItem("token", "bad-token");
  (api.get as any).mockRejectedValueOnce(new Error("invalid token"));

  AuthProvider({ children: null });

  await new Promise((r) => setTimeout(r, 0));

  expect(api.get).toHaveBeenCalled();
  expect(localStorage.getItem("token")).toBeNull();
});

it("does not call /auth/me when no token in localStorage", async () => {
  AuthProvider({ children: null });

  // allow any synchronous effects to run
  await new Promise((r) => setTimeout(r, 0));

  expect(api.get).not.toHaveBeenCalled();
});