import { describe, it, expect } from "vitest";
import React from "react";
import { badgeVariants } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";
import { Input } from "../components/ui/input";

describe("UI Primitives Variant Classes", () => {
  it("renders all button variants correctly", () => {
    expect(buttonVariants({ variant: "default" })).toContain("bg-blue-600");
    expect(buttonVariants({ variant: "destructive" })).toContain("bg-red-600");
    expect(buttonVariants({ variant: "outline" })).toContain("border");
    expect(buttonVariants({ variant: "secondary" })).toContain("bg-neutral-200");
    expect(buttonVariants({ variant: "ghost" })).toContain("hover:bg-neutral-100");
    expect(buttonVariants({ variant: "link" })).toContain("underline-offset-4");
  });

  it("renders all button sizes correctly", () => {
    expect(buttonVariants({ size: "default" })).toContain("h-9");
    expect(buttonVariants({ size: "sm" })).toContain("h-8");
    expect(buttonVariants({ size: "lg" })).toContain("h-10");
    expect(buttonVariants({ size: "icon" })).toContain("w-9");
  });

  it("supports className overrides in buttonVariants", () => {
    const custom = buttonVariants({ variant: "default", className: "custom-class" });
    expect(custom).toContain("custom-class");
    expect(custom).toContain("bg-blue-600");
  });

  it("renders all badge variants correctly", () => {
    expect(badgeVariants({ variant: "default" })).toContain("bg-blue-600");
    expect(badgeVariants({ variant: "secondary" })).toContain("bg-neutral-100");
    expect(badgeVariants({ variant: "destructive" })).toContain("bg-red-600");
    expect(badgeVariants({ variant: "success" })).toContain("bg-emerald-600");
    expect(badgeVariants({ variant: "warning" })).toContain("bg-amber-500");
    expect(badgeVariants({ variant: "outline" })).toContain("border-neutral-300");
  });

  it("supports className overrides in badgeVariants", () => {
    const custom = badgeVariants({ variant: "success", className: "extra-badge" });
    expect(custom).toContain("extra-badge");
    expect(custom).toContain("bg-emerald-600");
  });

  it("exports Input component with correct displayName", () => {
    expect(Input.displayName).toBe("Input");
    expect(typeof Input).toBe("object");
  });
});
