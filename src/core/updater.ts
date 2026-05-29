import { spawnSync } from "child_process";
import { writeFileSync, chmodSync, renameSync } from "fs";

export type InstallMethod = "homebrew" | "npm" | "direct";

export function detectInstallMethod(
  execPath: string,
  argv1: string,
): InstallMethod {
  const combined = execPath + argv1;
  if (/homebrew/i.test(combined)) return "homebrew";
  if (combined.includes("/.npm/") || combined.includes("/node_modules/"))
    return "npm";
  return "direct";
}

export function isUpToDate(current: string, latest: string): boolean {
  return current === latest;
}

export async function fetchLatestVersion(): Promise<string> {
  const res = await fetch(
    "https://api.github.com/repos/bd-makers/claude-log-ex/releases/latest",
  );
  if (!res.ok) throw new Error("Failed to fetch latest release.");
  const data = (await res.json()) as { tag_name: string };
  return data.tag_name.replace(/^v/, "");
}

export async function performUpdate(opts: {
  latestVersion: string;
  method: InstallMethod;
  execPath: string;
}): Promise<void> {
  const { latestVersion, method, execPath } = opts;

  if (method === "homebrew") {
    process.stdout.write("Updating via Homebrew...\n");
    const result = spawnSync("brew", ["upgrade", "clogex"], {
      stdio: "inherit",
    });
    if (result.status !== 0) throw new Error("brew upgrade failed.");
  } else if (method === "npm") {
    process.stdout.write("Updating via npm...\n");
    const result = spawnSync(
      "npm",
      ["update", "-g", "@bdmakers/claude-log-ex"],
      { stdio: "inherit" },
    );
    if (result.status !== 0) throw new Error("npm update failed.");
  } else {
    process.stdout.write("Updating via direct binary replacement...\n");
    process.stdout.write("Downloading clogex-macos-arm64...\n");
    const url = `https://github.com/bd-makers/claude-log-ex/releases/download/v${latestVersion}/clogex-macos-arm64`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download binary: ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const tmpPath = `/tmp/clogex-update-${process.pid}`;
    writeFileSync(tmpPath, buf);
    chmodSync(tmpPath, 0o755);
    renameSync(tmpPath, execPath);
  }
}
