import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

type SessionInfo = {
  pid: number;
  sessionId: string;
  cwd: string;
  startedAt: number;
};

export function encodeProjectPath(cwd: string): string {
  return cwd.replace(/\//g, "-");
}

export function buildJsonlPath(
  claudeHome: string,
  cwd: string,
  sessionId: string,
): string {
  return join(
    claudeHome,
    "projects",
    encodeProjectPath(cwd),
    `${sessionId}.jsonl`,
  );
}

export function findCurrentSession(targetCwd?: string): string | null {
  const claudeHome = join(process.env.HOME ?? "~", ".claude");
  const sessionsDir = join(claudeHome, "sessions");
  const cwd = targetCwd ?? process.cwd();

  if (!existsSync(sessionsDir)) return null;

  const sessionFiles = readdirSync(sessionsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        const info = JSON.parse(
          readFileSync(join(sessionsDir, f), "utf-8"),
        ) as SessionInfo;
        return info;
      } catch {
        return null;
      }
    })
    .filter((s): s is SessionInfo => s !== null && s.cwd === cwd)
    .sort((a, b) => b.startedAt - a.startedAt);

  if (sessionFiles.length === 0) return null;

  const { sessionId } = sessionFiles[0];
  const jsonlPath = buildJsonlPath(claudeHome, cwd, sessionId);
  return existsSync(jsonlPath) ? jsonlPath : null;
}

export function listProjectSessions(cwd?: string): string[] {
  const claudeHome = join(process.env.HOME ?? "~", ".claude");
  const projectDir = join(
    claudeHome,
    "projects",
    encodeProjectPath(cwd ?? process.cwd()),
  );
  if (!existsSync(projectDir)) return [];
  return readdirSync(projectDir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => join(projectDir, f))
    .sort()
    .reverse();
}
