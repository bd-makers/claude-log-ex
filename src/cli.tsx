import { version } from "../package.json";

const args = process.argv.slice(2);

if (args[0] === "--version" || args[0] === "-v") {
  process.stdout.write(version + "\n");
  process.exit(0);
}

if (args[0] === "--help" || args[0] === "-h") {
  process.stdout.write(
    [
      `clogex v${version} — Claude Code session log viewer`,
      "",
      "Usage:",
      "  clogex [options] [session.jsonl]",
      "",
      "Arguments:",
      "  session.jsonl    Path to a Claude session log file.",
      "                   Auto-detected from current project if omitted.",
      "",
      "Options:",
      "  -h, --help       Show this help message",
      "  -v, --version    Show version number",
      "  --ko             Use Korean UI",
      "  --en             Use English UI (default)",
      "  --update         Self-update to the latest release",
      "",
      "Key bindings (inside the TUI):",
      "  1-8              Switch tab",
      "  ← →              Navigate turns",
      "  ↑ ↓              Scroll",
      "  s                Toggle sort order (newest / oldest)",
      "  q                Quit",
      "",
    ].join("\n"),
  );
  process.exit(0);
}

if (args[0] === "--update") {
  const { detectInstallMethod, fetchLatestVersion, isUpToDate, performUpdate } =
    await import("./core/updater");

  let latestVersion = "";
  try {
    latestVersion = await fetchLatestVersion();
  } catch {
    process.stderr.write(
      `Error: Failed to fetch latest release.\n  → https://github.com/bd-makers/claude-log-ex/releases/latest\n`,
    );
    process.exit(1);
  }

  if (isUpToDate(version, latestVersion)) {
    process.stdout.write(`clogex v${version} is already up to date.\n`);
    process.exit(0);
  }

  process.stdout.write(
    `Checking for updates... v${version} → v${latestVersion}\n`,
  );

  const method = detectInstallMethod(process.execPath, process.argv[1] ?? "");

  try {
    await performUpdate({ latestVersion, method, execPath: process.execPath });
    process.stdout.write(`Updated to v${latestVersion}.\n`);
    process.exit(0);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("EACCES") || msg.includes("Permission denied")) {
      process.stderr.write(
        `Error: Permission denied. Try: sudo clogex --update\n`,
      );
    } else {
      process.stderr.write(`Error: ${msg}\n`);
    }
    process.exit(1);
  }
}

async function main() {
  const { render } = await import("ink");
  const { App } = await import("./ui/App");
  const { findCurrentSession, listProjectSessions } =
    await import("./core/session-finder");
  const { setLocale, t } = await import("./i18n");

  if (args.includes("--ko")) setLocale("ko");

  const filteredArgs = args.filter((a) => a !== "--ko" && a !== "--en");
  const targetPath = filteredArgs[0];

  let sessionPath: string | null = targetPath ?? null;

  if (!sessionPath) {
    sessionPath = findCurrentSession();
  }

  if (!sessionPath) {
    const sessions = listProjectSessions();
    if (sessions.length > 0) {
      sessionPath = sessions[0];
      process.stderr.write(t("sessionFallback")(sessionPath) + "\n");
    }
  }

  if (!sessionPath) {
    process.stderr.write(t("sessionNotFound") + "\n");
    process.stderr.write(t("usage") + "\n");
    process.exit(1);
  }

  render(<App sessionPath={sessionPath} />);
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
