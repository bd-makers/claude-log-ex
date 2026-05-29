import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";

type SessionInfo = {
  pid: number;
  sessionId: string;
  cwd: string;
  startedAt: number;
};

export function encodeProjectPath(cwd: string): string {
  return cwd.replace(/[^a-zA-Z0-9]/g, "-");
}

function resolveMainWorktreePath(cwd: string): string | null {
  const gitPath = join(cwd, ".git");
  if (!existsSync(gitPath)) return null;
  try {
    if (statSync(gitPath).isDirectory()) return null;
    // worktree: .git is a file with "gitdir: /main/.git/worktrees/name"
    const content = readFileSync(gitPath, "utf-8").trim();
    const match = content.match(/^gitdir:\s*(.+)$/);
    if (!match) return null;
    // /main/.git/worktrees/name → /main
    const worktreesDir = match[1]; // e.g. /main/.git/worktrees/name
    const dotGitDir = dirname(dirname(worktreesDir)); // /main/.git
    return dirname(dotGitDir); // /main
  } catch {
    return null;
  }
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

  const candidates = [cwd];
  const mainPath = resolveMainWorktreePath(cwd);
  if (mainPath) candidates.push(mainPath);

  const allSessions = readdirSync(sessionsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(
          readFileSync(join(sessionsDir, f), "utf-8"),
        ) as SessionInfo;
      } catch {
        return null;
      }
    })
    .filter((s): s is SessionInfo => s !== null && candidates.includes(s.cwd))
    .sort((a, b) => b.startedAt - a.startedAt);

  if (allSessions.length === 0) return null;

  const { sessionId, cwd: sessionCwd } = allSessions[0];
  const jsonlPath = buildJsonlPath(claudeHome, sessionCwd, sessionId);
  return existsSync(jsonlPath) ? jsonlPath : null;
}

export function listProjectSessions(cwd?: string): string[] {
  const claudeHome = join(process.env.HOME ?? "~", ".claude");
  const effectiveCwd = cwd ?? process.cwd();

  const candidates = [effectiveCwd];
  const mainPath = resolveMainWorktreePath(effectiveCwd);
  if (mainPath) candidates.push(mainPath);

  const results = new Set<string>();
  for (const candidate of candidates) {
    const projectDir = join(
      claudeHome,
      "projects",
      encodeProjectPath(candidate),
    );
    if (!existsSync(projectDir)) continue;
    readdirSync(projectDir)
      .filter((f) => f.endsWith(".jsonl"))
      .forEach((f) => results.add(join(projectDir, f)));
  }
  return [...results].sort().reverse();
}
