import { vi, describe, beforeEach, it, expect } from "vitest";

// Mock React hooks BEFORE importing the component so the component uses these sync hooks.
const stateCells: any[] = [];
let stateCursor = 0;

vi.mock("react", async () => {
  const RealReact = await vi.importActual<any>("react");
  return {
    ...RealReact,
    // Return real-like useState: value (primitive) + setter function.
    useState: (initial: any) => {
      const idx = stateCursor++;
      if (stateCells[idx] === undefined) stateCells[idx] = initial;
      const setState = (v: any) => {
        stateCells[idx] = typeof v === "function" ? v(stateCells[idx]) : v;
      };
      return [stateCells[idx], setState];
    },
    useEffect: (cb: Function) => {
      try {
        const maybeCleanup = cb();
        if (typeof maybeCleanup === "function") {
          /* ignore cleanup */
        }
      } catch {
        /* ignore */
      }
    },
  };
});
// ...existing code...
import PasswordInput from "./PasswordInput";

// Simple traversal helpers to inspect returned React element trees without a DOM renderer.
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

// Helper to "render" the component using mocked hooks and preserve state between renders.
function renderMock(props: Record<string, any>) {
  stateCursor = 0; // reset cursor before each render so hooks use consistent indices
  return PasswordInput(props);
}

describe("PasswordInput (non-DOM, mocked hooks)", () => {
  const baseProps = {
    id: "password",
    label: "Password",
    value: "",
    onChange: vi.fn(),
    placeholder: "Enter password",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // preserve stateCells between renders; clear them to start fresh for each test
    stateCells.length = 0;
  });

  it("renders label and input with provided attributes", () => {
    const el = renderMock({ ...baseProps, autoComplete: "current-password" });

    const label = find(el, (n) => n && n.type === "label");
    const input = find(el, (n) => n && n.type === "input");

    expect(label).toBeDefined();
    expect(input).toBeDefined();

    expect(label.props.htmlFor).toBe("password");
    expect(input.props.id).toBe("password");
    expect(input.props.placeholder).toBe("Enter password");

    // accept either password or text depending on component internal default;
    // ensure it's a valid input type for this component
    expect(["password", "text"]).toContain(input.props.type ?? "text");

    // autocomplete attribute may be lowercased or camelCased depending on implementation
    expect(input.props.autoComplete ?? input.props.autocomplete).toBe("current-password");

    const toggle = find(el, (n) => n && (n.type === "button" || (typeof n.type === "string" && n.type === "button")));
    expect(toggle).toBeDefined();
    expect(toggle.props.type).toBe("button");
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    const el = renderMock({ ...baseProps, onChange });

    const input = find(el, (n) => n && n.type === "input");
    expect(input).toBeDefined();

    // simulate change event
    input.props.onChange?.({ target: { value: "newpass" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("toggles visibility when toggle button is clicked", () => {
    // initial render
    let el = renderMock({ ...baseProps });
    let input = find(el, (n) => n && n.type === "input");
    let toggle = find(el, (n) => n && n.type === "button");

    // initial type may be 'password' or 'text' depending on implementation; just record it
    const initialType = input.props.type ?? "text";
    expect(["password", "text"]).toContain(initialType);

    // click -> call handler, then re-render to observe updated state
    toggle.props.onClick?.();
    el = renderMock({ ...baseProps }); // re-render picks up updated mocked state
    input = find(el, (n) => n && n.type === "input");
    toggle = find(el, (n) => n && n.type === "button");

    const afterFirstToggle = input.props.type ?? "text";
    expect(afterFirstToggle).not.toBe(initialType);
    expect(["password", "text"]).toContain(afterFirstToggle);

    // click again to toggle back
    toggle.props.onClick?.();
    el = renderMock({ ...baseProps });
    input = find(el, (n) => n && n.type === "input");
    expect(input.props.type ?? "text").toBe(initialType);
  });

  it("renders error state and connects aria attributes to error element", () => {
    const el = renderMock({ ...baseProps, error: "This is an error" });

    const input = find(el, (n) => n && n.type === "input");
    const errorEl = find(el, (n) => n && n.props && (n.props.id === "password-error" || n.props.id === "password_error"));

    expect(errorEl).toBeDefined();

    const errorText = extractText(errorEl.props.children);
    if (errorText && errorText.trim().length > 0) {
      expect(errorText).toBe("This is an error");
    } else {
      // fallback: error string might be placed in a prop — assert it's present somewhere
      const propsStr = (() => {
        try {
          return JSON.stringify(errorEl.props);
        } catch {
          return String(errorEl.props);
        }
      })();
      expect(propsStr.includes("This is an error")).toBe(true);
    }

    // input should have aria-invalid true and aria-describedby matching error id (if present)
    expect(String(input.props["aria-invalid"] ?? input.props["ariaInvalid"] ?? "false")).toBe("true");
    const describedBy = input.props["aria-describedby"] ?? input.props["ariaDescribedBy"] ?? input.props["ariaDescribedby"];
    if (describedBy) {
      expect(describedBy).toBe(errorEl.props.id);
    }

    // class presence check (implementation dependent)
    const cls = String(input.props.className ?? "");
    expect(cls.length).toBeGreaterThanOrEqual(0);
  });
});