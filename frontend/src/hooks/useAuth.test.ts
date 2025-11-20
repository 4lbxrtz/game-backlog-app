import { describe, it, expect, beforeEach, vi } from "vitest";
import { authService } from "../services/authService";
import { api } from "../services/api";

describe("authService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("register posts to /api/auth/register with correct payload and returns response.data", async () => {
    const mockResponse = { data: { ok: true } };
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce(mockResponse as any);

    const result = await authService.register(
      "bob",
      "bob@example.com",
      "secret"
    );

    expect(result).toEqual(mockResponse.data);

    // accept either relative or absolute URL; assert it ends with the expected path
    const calledUrl = (postSpy as any).mock.calls[0][0];
    expect(String(calledUrl)).toMatch(/\/api\/auth\/register$/);

    const payload = (postSpy as any).mock.calls[0][1];
    expect(payload).toEqual({
      username: "bob",
      email: "bob@example.com",
      password: "secret",
    });
  });

  it("login posts to /api/auth/login with correct payload and returns response.data", async () => {
    const mockResponse = { data: { token: "t", user: { id: 1 } } };
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValueOnce(mockResponse as any);

    const result = await authService.login("alice@example.com", "pwd");

    expect(result).toEqual(mockResponse.data);

    const calledUrl = (postSpy as any).mock.calls[0][0];
    expect(String(calledUrl)).toMatch(/\/api\/auth\/login$/);

    const payload = (postSpy as any).mock.calls[0][1];
    expect(payload).toEqual({
      email: "alice@example.com",
      password: "pwd",
    });
  });

  it("getDashboard calls GET /api/auth/dashboard and returns response.data", async () => {
    const mockResponse = { data: { dashboard: [] } };
    const getSpy = vi
      .spyOn(api, "get")
      .mockResolvedValueOnce(mockResponse as any);

    const result = await authService.getDashboard();

    expect(result).toEqual(mockResponse.data);

    const calledUrl = (getSpy as any).mock.calls[0][0];
    expect(String(calledUrl)).toMatch(/\/api\/auth\/dashboard$/);
  });
});
