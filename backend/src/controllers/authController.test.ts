import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response } from "express";
import * as userModel from "../models/userModel";
import * as authUtils from "../utils/auth";
import { register, login, getDashboard } from "./authController";

// Mock the modules used by the controller
vi.mock("../models/userModel", () => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  emailExists: vi.fn(),
  usernameExists: vi.fn(),
  findUserById: vi.fn(),
  getBacklogGames: vi.fn(),
  getCurrentlyPlayingGames: vi.fn(),
  getWishlistGames: vi.fn(),
  getCompletedGames: vi.fn(),
  getUserLists: vi.fn(),
  getUserStats: vi.fn(),
}));

vi.mock("../utils/auth", () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  generateToken: vi.fn(),
}));

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = (code: number) => {
    (res as any).statusCode = code;
    return res as Response;
  };
  res.json = (payload: any) => {
    (res as any).body = payload;
    return res as Response;
  };
  return res as Response & { statusCode?: number; body?: any };
}

function mockRequest(body = {}, user?: any) {
  return { body, user } as unknown as Request;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authController - register", () => {
  it("returns 400 when required fields missing", async () => {
    const req = mockRequest({ username: "u" }); // missing email & password
    const res = mockResponse();
    await register(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for invalid email format", async () => {
    const req = mockRequest({
      username: "user",
      email: "bademail",
      password: "secret",
    });
    const res = mockResponse();
    await register(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid email format");
  });

  it("returns 400 for short password", async () => {
    const req = mockRequest({
      username: "user",
      email: "a@b.com",
      password: "123",
    });
    const res = mockResponse();
    await register(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Password must be at least 6 characters"
    );
  });

  it("returns 400 for username too short", async () => {
    const req = mockRequest({
      username: "ab",
      email: "a@b.com",
      password: "123456",
    });
    const res = mockResponse();
    await register(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Username must be 3-50 characters"
    );
  });

  it("returns 409 when email already registered", async () => {
    (userModel.emailExists as any).mockResolvedValue(true);
    const req = mockRequest({
      username: "user",
      email: "a@b.com",
      password: "123456",
    });
    const res = mockResponse();
    await register(req, res);
    expect(userModel.emailExists).toHaveBeenCalledWith("a@b.com");
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("error", "Email already registered");
  });

  it("returns 409 when username already taken", async () => {
    (userModel.emailExists as any).mockResolvedValue(false);
    (userModel.usernameExists as any).mockResolvedValue(true);
    const req = mockRequest({
      username: "user",
      email: "a@b.com",
      password: "123456",
    });
    const res = mockResponse();
    await register(req, res);
    expect(userModel.usernameExists).toHaveBeenCalledWith("user");
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("error", "Username already taken");
  });

  it("registers successfully and returns token and user", async () => {
    (userModel.emailExists as any).mockResolvedValue(false);
    (userModel.usernameExists as any).mockResolvedValue(false);
    (authUtils.hashPassword as any).mockResolvedValue("hashedpw");
    (userModel.createUser as any).mockResolvedValue(42);
    (authUtils.generateToken as any).mockReturnValue("tkn");
    const req = mockRequest({
      username: "user",
      email: "a@b.com",
      password: "123456",
    });
    const res = mockResponse();
    await register(req, res);
    expect(authUtils.hashPassword).toHaveBeenCalledWith("123456");
    expect(userModel.createUser).toHaveBeenCalledWith(
      "user",
      "a@b.com",
      "hashedpw"
    );
    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject({
      message: "User registered successfully",
      token: "tkn",
      user: { id: 42, username: "user", email: "a@b.com" },
    });
  });
});

describe("authController - login", () => {
  it("returns 400 when email or password missing", async () => {
    const req = mockRequest({ email: "a@b.com" }); // missing password
    const res = mockResponse();
    await login(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Email and password are required");
  });

  it("returns 401 when user not found", async () => {
    (userModel.findUserByEmail as any).mockResolvedValue(null);
    const req = mockRequest({ email: "a@b.com", password: "pw" });
    const res = mockResponse();
    await login(req, res);
    expect(userModel.findUserByEmail).toHaveBeenCalledWith("a@b.com");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid email or password");
  });

  it("returns 401 when password invalid", async () => {
    (userModel.findUserByEmail as any).mockResolvedValue({
      id: 1,
      email: "a@b.com",
      password_hash: "h",
    });
    (authUtils.comparePassword as any).mockResolvedValue(false);
    const req = mockRequest({ email: "a@b.com", password: "wrong" });
    const res = mockResponse();
    await login(req, res);
    expect(authUtils.comparePassword).toHaveBeenCalledWith("wrong", "h");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid email or password");
  });

  it("logs in successfully and returns token and user", async () => {
    const user = { id: 5, email: "a@b.com", username: "u", password_hash: "h" };
    (userModel.findUserByEmail as any).mockResolvedValue(user);
    (authUtils.comparePassword as any).mockResolvedValue(true);
    (authUtils.generateToken as any).mockReturnValue("tok-login");
    const req = mockRequest({ email: "a@b.com", password: "right" });
    const res = mockResponse();
    await login(req, res);
    expect(authUtils.generateToken).toHaveBeenCalledWith({
      userId: 5,
      email: "a@b.com",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      message: "Login successful",
      token: "tok-login",
      user: { id: 5, username: "u", email: "a@b.com" },
    });
  });
});

describe("authController - getDashboard", () => {
  it("returns 404 when user not found", async () => {
    (userModel.findUserById as any).mockResolvedValue(null);
    const req = mockRequest({}, { userId: 99 });
    const res = mockResponse();
    await getDashboard(req, res);
    expect(userModel.findUserById).toHaveBeenCalledWith(99);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });

  it("returns dashboard data when user exists", async () => {
    const user = {
      id: 2,
      username: "bob",
      email: "b@b.com",
      created_at: "2020-01-01",
    };
    (userModel.findUserById as any).mockResolvedValue(user);
    (userModel.getUserStats as any).mockResolvedValue({ games: 10 });
    (userModel.getCurrentlyPlayingGames as any).mockResolvedValue([{ id: 1 }]);
    (userModel.getBacklogGames as any).mockResolvedValue([{ id: 2 }]);
    (userModel.getUserLists as any).mockResolvedValue([{ id: 3 }]);
    (userModel.getWishlistGames as any).mockResolvedValue([{ id: 4 }]);
    (userModel.getCompletedGames as any).mockResolvedValue([{ id: 5 }]);

    const req = mockRequest({}, { userId: 2 });
    const res = mockResponse();
    await getDashboard(req, res);

    expect(userModel.getUserStats).toHaveBeenCalledWith(2);
    // Code calls getCurrentlyPlayingGames(userId, 4)
    expect(userModel.getCurrentlyPlayingGames).toHaveBeenCalledWith(2, 4);

    // Code calls getBacklogGames(userId, 12)
    expect(userModel.getBacklogGames).toHaveBeenCalledWith(2, 12);

    expect(userModel.getUserLists).toHaveBeenCalledWith(2);

    // FIX: Code calls getWishlistGames(userId, 12), not 8
    expect(userModel.getWishlistGames).toHaveBeenCalledWith(2, 12);

    // FIX: Code calls getCompletedGames(userId, 4), make sure this matches too
    // In your controller you wrote: getCompletedGames(userId, 4)
    expect(userModel.getCompletedGames).toHaveBeenCalledWith(2, 4);

    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toMatchObject({
      id: 2,
      username: "bob",
      email: "b@b.com",
      created_at: "2020-01-01",
    });
    expect(res.body).toHaveProperty("stats", { games: 10 });
    expect(res.body).toHaveProperty("currentlyPlaying");
    expect(res.body).toHaveProperty("backlog");
    expect(res.body).toHaveProperty("lists");
    expect(res.body).toHaveProperty("wishlist");
    expect(res.body).toHaveProperty("completed");
  });
});
