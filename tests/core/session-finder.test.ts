import { describe, it, expect } from "vitest";
import {
  encodeProjectPath,
  buildJsonlPath,
} from "../../src/core/session-finder";

describe("encodeProjectPath", () => {
  it("encodes unix path by replacing slashes with hyphens", () => {
    expect(encodeProjectPath("/Users/chad/Projects/workspace/my-app")).toBe(
      "-Users-chad-Projects-workspace-my-app",
    );
  });

  it("encodes root path", () => {
    expect(encodeProjectPath("/foo")).toBe("-foo");
  });

  it("encodes underscores in username", () => {
    expect(encodeProjectPath("/Users/logan_d/Project/bodoc4")).toBe(
      "-Users-logan-d-Project-bodoc4",
    );
  });
});

describe("buildJsonlPath", () => {
  it("builds correct path from cwd and session id", () => {
    const claudeHome = "/Users/chad/.claude";
    const cwd = "/Users/chad/Projects/my-app";
    const sessionId = "abc-123";
    expect(buildJsonlPath(claudeHome, cwd, sessionId)).toBe(
      "/Users/chad/.claude/projects/-Users-chad-Projects-my-app/abc-123.jsonl",
    );
  });
});
