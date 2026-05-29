import { describe, it, expect } from "vitest";
import { detectInstallMethod } from "../../src/core/updater";

describe("detectInstallMethod", () => {
  it("detects homebrew from execPath", () => {
    expect(detectInstallMethod("/opt/homebrew/bin/clogex", "")).toBe(
      "homebrew",
    );
  });

  it("detects homebrew case-insensitive", () => {
    expect(
      detectInstallMethod("/usr/local/Homebrew/Cellar/clogex/bin/clogex", ""),
    ).toBe("homebrew");
  });

  it("detects npm from argv1 containing .npm", () => {
    expect(
      detectInstallMethod("/usr/local/bin/node", "/home/user/.npm/bin/clogex"),
    ).toBe("npm");
  });

  it("detects npm from argv1 containing node_modules", () => {
    expect(
      detectInstallMethod(
        "/usr/bin/node",
        "/usr/local/lib/node_modules/.bin/clogex",
      ),
    ).toBe("npm");
  });

  it("returns direct for plain binary path", () => {
    expect(detectInstallMethod("/home/user/.local/bin/clogex", "")).toBe(
      "direct",
    );
  });

  it("returns direct for /usr/local/bin without npm markers", () => {
    expect(detectInstallMethod("/usr/local/bin/clogex", "")).toBe("direct");
  });
});
