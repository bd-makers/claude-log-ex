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
