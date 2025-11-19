import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from "./auth";

// /home/alberto/game-backlog-app/backend/src/utils/auth.test.ts
process.env.JWT_SECRET = "test_secret";

describe("auth utils - password hashing", () => {
  it("hashes and verifies a password", async () => {
    const password = "S3cureP@ss!";
    const hashed = await hashPassword(password);

    expect(typeof hashed).toBe("string");
    expect(hashed).not.toBe(password);

    const matched = await comparePassword(password, hashed);
    expect(matched).toBe(true);

    const notMatched = await comparePassword("wrong-password", hashed);
    expect(notMatched).toBe(false);
  });

  it("generates different hashes for the same password (salted)", async () => {
    const p = "repeat-me";
    const h1 = await hashPassword(p);
    const h2 = await hashPassword(p);
    expect(h1).not.toBe(h2);
  });
});

describe("auth utils - JWT generation and verification", () => {
  it("generates a token and verifies it (roundtrip)", () => {
    const payload = { userId: "u123", username: "tester" } as any;
    const token = generateToken(payload);
    expect(typeof token).toBe("string");

    const verified = verifyToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.email).toBe(payload.email);
  });

  it("throws when verifying an obviously invalid token", () => {
    expect(() => verifyToken("not.a.valid.token")).toThrow();
  });

  it("throws when token is signed with a different secret", () => {
    const altToken = jwt.sign({ userId: "x" }, "other_secret", {
      expiresIn: "1d",
    });
    expect(() => verifyToken(altToken)).toThrow();
  });
});
