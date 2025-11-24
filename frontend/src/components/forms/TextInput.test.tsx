/* ...existing code... */
import { describe, it, expect, vi } from "vitest";
import TextInput from "./TextInput";

/**
 * Helpers to inspect the React element tree returned by the component
 * without rendering to a DOM (suitable for Node environment tests).
 */
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

/* Helper to extract text content from a React element's children (handles strings, arrays, nested elements) */
function extractText(node: ReactElementLike): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (typeof node === "object" && node.props && node.props.children) {
    return extractText(node.props.children);
  }
  return "";
}

describe("TextInput", () => {
  it("renders label and input with correct id and name", () => {
    const el = TextInput({
      id: "username",
      label: "Username",
      value: "",
      onChange: () => {},
    });

    const label = find(el, (n) => n && n.type === "label");
    const input = find(el, (n) => n && n.type === "input");

    expect(label).toBeDefined();
    expect(input).toBeDefined();

    expect(label.props.htmlFor).toBe("username");
    expect(input.props.id).toBe("username");
    // name may be provided; if component sets it to id, assert that
    expect(input.props.name ?? input.props.id).toBe("username");
  });

  it("passes placeholder and autoComplete props to the input", () => {
    const el = TextInput({
      id: "email",
      label: "Email",
      value: "",
      onChange: () => {},
      placeholder: "you@example.com",
      autoComplete: "email",
    });

    const input = find(el, (n) => n && n.type === "input");
    expect(input).toBeDefined();
    expect(input.props.placeholder).toBe("you@example.com");
    expect(input.props.autoComplete).toBe("email");
  });

  it('defaults to type="text" and respects explicit type prop', () => {
    let el = TextInput({ id: "t", label: "T", value: "", onChange: () => {} });
    let input = find(el, (n) => n && n.type === "input");
    expect(input).toBeDefined();
    expect((input.props.type ?? "text")).toBe("text");

    el = TextInput({
      id: "pw",
      label: "Password",
      value: "",
      onChange: () => {},
      type: "password",
    });
    input = find(el, (n) => n && n.type === "input");
    expect(input.props.type).toBe("password");
  });

  it("calls onChange when the input value changes", () => {
    const handleChange = vi.fn();
    const el = TextInput({
      id: "search",
      label: "Search",
      value: "",
      onChange: handleChange,
    });

    const input = find(el, (n) => n && n.type === "input");
    expect(input).toBeDefined();

    // simulate event by calling the onChange prop directly
    input.props.onChange?.({ target: { value: "a" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("renders error state and accessibility attributes when error is provided", () => {
    const el = TextInput({
      id: "title",
      label: "Title",
      value: "",
      onChange: () => {},
      error: "Title is required",
    });

    const input = find(el, (n) => n && n.type === "input");
    expect(input).toBeDefined();

    // className may be a string containing an error class
    expect((input.props.className ?? "")).toContain("error");

    expect(String(input.props["aria-invalid"])).toBe("true");
    expect(input.props["aria-describedby"]).toBe("title-error");

    const errorEl = find(el, (n) => n && n.props && n.props.id === "title-error");
    expect(errorEl).toBeDefined();

    // robustly extract text from the error element's children; some implementations
    // render the error text as a child, others may place it in a prop/attribute.
    const errorText = extractText(errorEl.props.children);
    if (errorText && errorText.trim().length > 0) {
      expect(errorText).toBe("Title is required");
    } else {
      // fallback: check common props/attributes for the error string
      const propsStr = (() => {
        try {
          return JSON.stringify(errorEl.props);
        } catch {
          return String(errorEl.props);
        }
      })();
      expect(propsStr.includes("Title is required")).toBe(true);
    }
  });

  it("does not set error-related attributes when there is no error", () => {
    const el = TextInput({
      id: "note",
      label: "Note",
      value: "",
      onChange: () => {},
      error: null,
    });

    const input = find(el, (n) => n && n.type === "input");
    expect(input).toBeDefined();

    const className = input.props.className ?? "";
    expect(className).not.toContain("error");
    // aria-invalid should be explicitly false or absent; coerce to string for check
    expect(String(input.props["aria-invalid"] ?? "false")).toBe("false");
    expect(input.props["aria-describedby"]).toBeUndefined();

    const maybeErr = find(el, (n) => n && n.props && n.props.id === "note-error");
    expect(maybeErr).toBeNull();
  });
});
/* ...existing code... */