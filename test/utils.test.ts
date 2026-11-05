import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("Class merging utility (cn)", () => {
  it("merges regular and conditional class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
    expect(cn("px-2", false && "py-1", "text-sm")).toBe("px-2 text-sm");
    expect(cn("px-2", undefined, null, "text-sm")).toBe("px-2 text-sm");
  });

  it("handles Tailwind conflicts by taking the latter class", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });
});
