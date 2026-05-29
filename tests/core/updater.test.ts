import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  detectInstallMethod,
  isUpToDate,
  fetchLatestVersion,
  performUpdate,
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

describe("performUpdate", () => {
  // biome-ignore lint: spy type widened intentionally for test assertions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stdoutSpy: any;

  beforeEach(() => {
    stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // homebrew / npm: vi.spyOn cannot redefine non-configurable native module
  // properties in Bun, so we verify the observable side-effect: stdout message.
  it("homebrew: writes Homebrew update message to stdout", async () => {
    // spawnSync will actually run; brew may not exist — catch the error and
    // only assert the stdout message which is emitted before the spawn call.
    try {
      await performUpdate({
        latestVersion: "0.2.0",
        method: "homebrew",
        execPath: "/opt/homebrew/bin/clogex",
      });
    } catch {
      // brew may fail in CI; that's acceptable for this assertion
    }
    expect(stdoutSpy).toHaveBeenCalledWith("Updating via Homebrew...\n");
  });

  it("npm: writes npm update message to stdout", async () => {
    try {
      await performUpdate({
        latestVersion: "0.2.0",
        method: "npm",
        execPath: "/home/user/.npm/bin/clogex",
      });
    } catch {
      // npm update may fail in CI; that's acceptable for this assertion
    }
    expect(stdoutSpy).toHaveBeenCalledWith("Updating via npm...\n");
  });

  it("direct: calls fetch with correct URL", async () => {
    const fakeBody = new Uint8Array([1, 2, 3]);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => fakeBody.buffer,
    });
    vi.stubGlobal("fetch", mockFetch);
    // fs operations (writeFileSync / chmodSync / renameSync) will actually run;
    // use a tmp execPath that is safe to write to.
    const execPath = `/tmp/clogex-test-target-${process.pid}`;
    await performUpdate({ latestVersion: "0.2.0", method: "direct", execPath });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://github.com/bd-makers/claude-log-ex/releases/download/v0.2.0/clogex-macos-arm64",
    );
  });

  it("direct: writes stdout messages for binary replacement", async () => {
    const fakeBody = new Uint8Array([1, 2, 3]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => fakeBody.buffer,
      }),
    );
    const execPath = `/tmp/clogex-test-target-${process.pid}`;
    await performUpdate({ latestVersion: "0.2.0", method: "direct", execPath });
    expect(stdoutSpy).toHaveBeenCalledWith(
      "Updating via direct binary replacement...\n",
    );
    expect(stdoutSpy).toHaveBeenCalledWith(
      "Downloading clogex-macos-arm64...\n",
    );
  });

  it("direct: throws on failed download", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    await expect(
      performUpdate({
        latestVersion: "0.2.0",
        method: "direct",
        execPath: "/tmp/clogex-test-noop",
      }),
    ).rejects.toThrow("Failed to download binary");
  });
});
