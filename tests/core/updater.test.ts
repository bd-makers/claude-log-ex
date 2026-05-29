import { describe, it, expect, vi, afterEach } from "vitest";
import {
  detectInstallMethod,
  isUpToDate,
  fetchLatestVersion,
} from "../../src/core/updater";

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

describe("isUpToDate", () => {
  it("returns true when versions match", () => {
    expect(isUpToDate("0.1.9", "0.1.9")).toBe(true);
  });

  it("returns false when latest is newer", () => {
    expect(isUpToDate("0.1.9", "0.2.0")).toBe(false);
  });
});

describe("fetchLatestVersion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns version string without v prefix", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: "v0.2.0" }),
      }),
    );
    const version = await fetchLatestVersion();
    expect(version).toBe("0.2.0");
  });

  it("throws when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );
    await expect(fetchLatestVersion()).rejects.toThrow(
      "Failed to fetch latest release.",
    );
  });

  it("calls the correct GitHub API URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tag_name: "v0.2.0" }),
    });
    vi.stubGlobal("fetch", mockFetch);
    await fetchLatestVersion();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/bd-makers/claude-log-ex/releases/latest",
    );
  });
});
