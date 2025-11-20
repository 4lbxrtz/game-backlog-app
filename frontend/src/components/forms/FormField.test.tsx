import React from "react";
import { describe, it, expect } from "vitest";
import FormField from "./FormField";

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

describe("FormField", () => {
  it("renders string children and wraps them with the wrapper class", () => {
    const el = (FormField as any)({ children: "Label text" });

    const wrapper = find(el, (n) => {
      const cls = n?.props?.className;
      return typeof cls === "string" && cls.split(" ").includes("form-field-wrapper");
    });

    expect(wrapper).toBeDefined();
    const text = extractText(wrapper.props.children);
    expect(text).toBe("Label text");
  });

  it("renders element children and keeps the wrapper class", () => {
    const buttonEl = React.createElement("button", { type: "button" }, "Click me");
    const el = (FormField as any)({ children: buttonEl });

    const wrapper = find(el, (n) => {
      const cls = n?.props?.className;
      return typeof cls === "string" && cls.split(" ").includes("form-field-wrapper");
    });

    expect(wrapper).toBeDefined();

    const btn = find(wrapper, (n) => n && n.type === "button");
    expect(btn).toBeDefined();
    const btnText = extractText(btn.props.children);
    expect(btnText).toBe("Click me");
  });

  it("renders with no visible children (null) but still provides the wrapper element", () => {
    const el = (FormField as any)({ children: null });

    const wrapper = find(el, (n) => {
      const cls = n?.props?.className;
      return typeof cls === "string" && cls.split(" ").includes("form-field-wrapper");
    });

    expect(wrapper).toBeDefined();
    // when children are null there should be no text inside
    const text = extractText(wrapper.props.children);
    expect(text).toBe("");
  });
});