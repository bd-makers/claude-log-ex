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
