import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";
import { authenticate, optionalAuth } from "./auth";

vi.mock("../utils/auth", () => ({
  verifyToken: vi.fn(),
}));

const createMockReq = (authHeader?: string) =>
  ({ headers: { authorization: authHeader } } as unknown as Request);

const createMockRes = () => {
  const res: any = {};
  res.json = vi.fn();
  res.status = vi.fn(() => res);
  return res as Response;
};

const createNext = () => vi.fn() as unknown as NextFunction;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("middleware/auth", () => {
  describe("authenticate", () => {
    it("responds 401 when no Authorization header is present", () => {
      const req = createMockReq();
      const res = createMockRes();
      const next = createNext();

      authenticate(req, res, next);

      expect(res.status as any).toHaveBeenCalledWith(401);
      expect(res.json as any).toHaveBeenCalledWith({
        error: "No token provided",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("responds 401 when Authorization header does not start with Bearer", () => {
      const req = createMockReq("Token abc");
      const res = createMockRes();
      const next = createNext();

      authenticate(req, res, next);

      expect(res.status as any).toHaveBeenCalledWith(401);
      expect(res.json as any).toHaveBeenCalledWith({
        error: "No token provided",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("attaches user and calls next when token is valid", () => {
      const payload = { id: "user1", role: "tester" };
      (verifyToken as unknown as vi.Mock).mockReturnValue(payload);

      const req = createMockReq("Bearer valid.token.here") as any;
      const res = createMockRes();
      const next = createNext();

      authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith("valid.token.here");
      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalled();
      expect(res.status as any).not.toHaveBeenCalled();
      expect(res.json as any).not.toHaveBeenCalled();
    });

    it("responds 401 when verifyToken throws (invalid/expired token)", () => {
      (verifyToken as unknown as vi.Mock).mockImplementation(() => {
        throw new Error("invalid");
      });

      const req = createMockReq("Bearer bad.token");
      const res = createMockRes();
      const next = createNext();

      authenticate(req, res, next);

      expect(res.status as any).toHaveBeenCalledWith(401);
      expect(res.json as any).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("optionalAuth", () => {
    it("calls next and does nothing when no Authorization header is present", () => {
      const req = createMockReq() as any;
      const res = createMockRes();
      const next = createNext();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it("attaches user and calls next when token is valid", () => {
      const payload = { id: "optionalUser" };
      (verifyToken as unknown as vi.Mock).mockReturnValue(payload);

      const req = createMockReq("Bearer optional.token") as any;
      const res = createMockRes();
      const next = createNext();

      optionalAuth(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith("optional.token");
      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalled();
    });

    it("ignores invalid token and still calls next", () => {
      (verifyToken as unknown as vi.Mock).mockImplementation(() => {
        throw new Error("invalid");
      });

      const req = createMockReq("Bearer invalid.token") as any;
      const res = createMockRes();
      const next = createNext();

      optionalAuth(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith("invalid.token");
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
