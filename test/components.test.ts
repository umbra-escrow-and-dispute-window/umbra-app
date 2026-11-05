import { describe, it, expect } from "vitest";
import { badgeVariants } from "../components/ui/badge";
import { buttonVariants } from "../components/ui/button";

describe("UI Primitives Variant Classes", () => {
  it("renders expected button variant classes", () => {
    const defaultBtn = buttonVariants({ variant: "default", size: "default" });
    expect(defaultBtn).toContain("bg-blue-600");
    expect(defaultBtn).toContain("h-9");

    const outlineBtn = buttonVariants({ variant: "outline", size: "sm" });
    expect(outlineBtn).toContain("border");
    expect(outlineBtn).toContain("h-8");

    const destructiveBtn = buttonVariants({ variant: "destructive" });
    expect(destructiveBtn).toContain("bg-red-600");
  });

  it("renders expected badge variant classes", () => {
    const defaultBadge = badgeVariants({ variant: "default" });
    expect(defaultBadge).toContain("bg-blue-600");

    const successBadge = badgeVariants({ variant: "success" });
    expect(successBadge).toContain("bg-emerald-600");

    const warningBadge = badgeVariants({ variant: "warning" });
    expect(warningBadge).toContain("bg-amber-500");

    const destructiveBadge = badgeVariants({ variant: "destructive" });
    expect(destructiveBadge).toContain("bg-red-600");
  });
});
