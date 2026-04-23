import { describe, it, expect } from "vitest";
import { parseJsonlLine } from "../../src/core/jsonl-parser";
import { readFileSync } from "fs";
import { join } from "path";

describe("parseJsonlLine", () => {
  it("returns null for empty line", () => {
    expect(parseJsonlLine("")).toBeNull();
    expect(parseJsonlLine("  ")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parseJsonlLine("{invalid}")).toBeNull();
  });

  it("parses a valid hook_success attachment line", () => {
    const line = JSON.stringify({
      parentUuid: null,
      isSidechain: false,
      attachment: {
        type: "hook_success",
        hookName: "SessionStart:startup",
        hookEvent: "SessionStart",
        durationMs: 42,
        exitCode: 0,
        command: "startup.sh",
      },
      timestamp: "2026-04-23T05:12:12.100Z",
    });
    const result = parseJsonlLine(line);
    expect(result).not.toBeNull();
    expect(result!.attachment?.type).toBe("hook_success");
    expect(result!.attachment?.hookName).toBe("SessionStart:startup");
  });

  it("parses an assistant message with tool_use", () => {
    const line = JSON.stringify({
      parentUuid: "abc",
      isSidechain: false,
      type: "assistant",
      message: {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "tu_001",
            name: "Skill",
            input: { skill: "writing-plans" },
          },
        ],
      },
      timestamp: "2026-04-23T05:12:13.000Z",
    });
    const result = parseJsonlLine(line);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("assistant");
    const content = result!.message?.content as Array<{
      type: string;
      name: string;
    }>;
    expect(content[0].name).toBe("Skill");
  });
});

describe("parseJsonlFile", () => {
  it("parses all valid lines from fixture file", () => {
    const fixturePath = join(__dirname, "../fixtures/sample-session.jsonl");
    const lines = readFileSync(fixturePath, "utf-8").split("\n");
    const results = lines.map(parseJsonlLine).filter(Boolean);
    expect(results.length).toBe(6);
  });
});
