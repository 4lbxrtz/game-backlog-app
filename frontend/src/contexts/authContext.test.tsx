/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, beforeEach, it, expect, describe } from "vitest";
import { api } from "../services/api";

// 1. Storage Mock
const makeStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  } as unknown as Storage;
};

// Apply storage mock
(globalThis as any).localStorage = makeStorage();
(globalThis as any).sessionStorage = makeStorage();

// 2. API Mock
vi.mock("../services/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// 3. React Mock (Crucial for testing Context without DOM)
// We capture the SetState calls to verify logic
const setStateSpy = vi.fn();

vi.mock("react", async () => {
  const React = await vi.importActual<any>("react");
  return {
    ...React,
    // Simple mock of useState that returns the initial value and our spy
    useState: (initial: any) => [initial, setStateSpy],
    useEffect: (cb: Function) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    },
    createContext: (defaultValue: any) => ({
      Provider: ({ children }: any) => children,
      _currentValue: defaultValue,
    }),
  };
});

// Import Provider AFTER mocking
import { AuthProvider } from "./authContext";

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset internal storage of our mock
    (localStorage.setItem as any).mockClear();
    (localStorage.getItem as any).mockClear();
    (localStorage.clear as any).mockClear();
  });

  it("initializes state from localStorage WITHOUT making API calls", async () => {
    // Setup valid data in storage
    const mockUser = { id: 1, username: "test", email: "test@test.com" };
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    // Run the provider logic
    AuthProvider({ children: "child" });

    // Wait for effects
    await new Promise((r) => setTimeout(r, 0));

    // EXPECTATIONS:
    // 1. Should NOT call API (Optimistic loading)
    expect(api.get).not.toHaveBeenCalled();

    // 2. Should read from localStorage
    expect(localStorage.getItem).toHaveBeenCalledWith("user");
    expect(localStorage.getItem).toHaveBeenCalledWith("token");

    // 3. Should update state with the user from storage
    // Note: The first call might be loading state, search for the user object
    expect(setStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ username: "test" })
    );
  });

  it("clears localStorage if the user data is corrupted (JSON parse error)", async () => {
    // Setup corrupted JSON
    localStorage.setItem("token", "valid-token");
    localStorage.setItem("user", "{ invalid-json ... ");

    // Silence console.error for this test since we expect a parsing error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    AuthProvider({ children: null });
    await new Promise((r) => setTimeout(r, 0));

    // Should detect error and clear storage
    expect(localStorage.clear).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("does nothing if no token is present", async () => {
    // Storage is empty by default in beforeEach
    AuthProvider({ children: null });
    await new Promise((r) => setTimeout(r, 0));

    expect(localStorage.getItem).toHaveBeenCalled();
    // Should NOT try to set user state (other than initial null)
    // We check that it didn't try to parse anything
    expect(localStorage.clear).not.toHaveBeenCalled();
  });
});