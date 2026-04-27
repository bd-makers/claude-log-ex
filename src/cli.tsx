import { render } from "ink";
import { App } from "./ui/App";
import { findCurrentSession, listProjectSessions } from "./core/session-finder";
import { version } from "../package.json";

const args = process.argv.slice(2);

if (args[0] === "--version" || args[0] === "-v") {
  console.log(version);
  process.exit(0);
}

const targetPath = args[0];

let sessionPath: string | null = targetPath ?? null;

if (!sessionPath) {
  sessionPath = findCurrentSession();
}

if (!sessionPath) {
  const sessions = listProjectSessions();
  if (sessions.length > 0) {
    sessionPath = sessions[0];
    console.error(`세션 감지 실패. 최근 세션 사용: ${sessionPath}`);
  }
}

if (!sessionPath) {
  console.error("❌ Claude 세션을 찾을 수 없습니다.");
  console.error("사용법: cle [session.jsonl 경로]");
  process.exit(1);
}

render(<App sessionPath={sessionPath} />);
