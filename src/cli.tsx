import { version } from "../package.json";

const args = process.argv.slice(2);

if (args[0] === "--version" || args[0] === "-v") {
  console.log(version);
  process.exit(0);
}

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
    console.error(t("sessionFallback")(sessionPath));
  }
}

if (!sessionPath) {
  console.error(t("sessionNotFound"));
  console.error(t("usage"));
  process.exit(1);
}

render(<App sessionPath={sessionPath} />);
