import React from "react";
import { describe, it, expect } from "vitest";
import FormError from "./FormError";

type ReactElementLike = any;

function traverse(node: ReactElementLike, cb: (n: ReactElementLike) => void) {
  if (node == null) return;
  if (Array.isArray(node)) {
    node.forEach((c) => traverse(c, cb));
    return;
  }
  if (typeof node === "object") {
    cb(node);
    const children = node.props && node.props.children;
    if (children != null) traverse(children, cb);
  }
}

function find(node: ReactElementLike, predicate: (n: ReactElementLike) => boolean) {
  let found: ReactElementLike | null = null;
  traverse(node, (n) => {
    if (!found && predicate(n)) found = n;
  });
  return found;
}

function extractText(node: ReactElementLike): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node.props && node.props.children) {
    return extractText(node.props.children);
  }
  return "";
}

describe("FormError", () => {
  it("renders the provided message", () => {
    const el = (FormError as any)({ message: "Something went wrong" });
    const alertNode = find(el, (n) => n && n.props && n.props.role === "alert");
    expect(alertNode).toBeDefined();
    expect(extractText(alertNode.props.children)).toBe("Something went wrong");
  });

  it("sets the id when provided", () => {
    const el = (FormError as any)({ id: "error-id", message: "Bad input" });
    const alertNode = find(el, (n) => n && n.props && n.props.role === "alert");
    expect(alertNode).toBeDefined();
    expect(alertNode.props.id).toBe("error-id");
  });

  it("does not set an id when none is provided", () => {
    const el = (FormError as any)({ message: "No id here" });
    const alertNode = find(el, (n) => n && n.props && n.props.role === "alert");
    expect(alertNode).toBeDefined();
    // absence of id prop should be undefined or empty string depending on implementation
    expect(alertNode.props.id === undefined || alertNode.props.id === "").toBe(true);
  });

  it("has the expected role and class", () => {
    const el = (FormError as any)({ message: "Role and class" });
    const alertNode = find(el, (n) => n && n.props && n.props.role === "alert");
    expect(alertNode).toBeDefined();
    expect(alertNode.props.role).toBe("alert");
    const cls = String(alertNode.props.className ?? "");
    expect(cls.split(" ").includes("form-error")).toBe(true);
  });

  it("updates when rerendered with a new message", () => {
    // "rerender" by calling component factory again with new props
    let el = (FormError as any)({ message: "First" });
    let alertNode = find(el, (n) => n && n.props && n.props.role === "alert");
    expect(extractText(alertNode.props.children)).toBe("First");

    el = (FormError as any)({ message: "Second" });
    alertNode = find(el, (n) => n && n.props && n.props.role === "alert");
    expect(extractText(alertNode.props.children)).toBe("Second");
  });
});