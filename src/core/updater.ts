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
