// tests/core/event-classifier.test.ts
import { describe, it, expect } from "vitest";
import { classifyEvent, classifyUsage } from "../../src/core/event-classifier";

describe("classifyEvent", () => {
  it("classifies hook_success as hook", () => {
    const raw = {
      timestamp: "2026-04-23T05:12:12.100Z",
      attachment: {
        type: "hook_success",
        hookName: "PostToolUse:Bash",
        hookEvent: "PostToolUse",
        durationMs: 10,
        exitCode: 0,
        command: "echo hi",
      },
    };
    const event = classifyEvent(raw, "test-id");
    expect(event?.category).toBe("hook");
    expect(event?.detail.hookName).toBe("PostToolUse:Bash");
    expect(event?.detail.status).toBe("success");
  });

  it("classifies hook_non_blocking_error as hook with error status", () => {
    const raw = {
      timestamp: "2026-04-23T05:12:12.100Z",
      attachment: {
        type: "hook_non_blocking_error",
        hookName: "UserPromptSubmit",
        hookEvent: "UserPromptSubmit",
        exitCode: 1,
        command: "validate.sh",
      },
    };
    const event = classifyEvent(raw, "test-id");
    expect(event?.category).toBe("hook");
    expect(event?.detail.status).toBe("error");
  });

  it("classifies Skill tool_use as skill invocation", () => {
    const raw = {
      type: "assistant",
      timestamp: "2026-04-23T05:12:13.000Z",
      message: {
        content: [
          {
            type: "tool_use" as const,
            id: "tu_001",
            name: "Skill",
            input: { skill: "writing-plans" },
          },
        ],
      },
    };
    const event = classifyEvent(raw, "test-id");
    expect(event?.category).toBe("skill");
    expect(event?.detail.phase).toBe("invoked");
    expect(event?.detail.skillName).toBe("writing-plans");
  });

  it("classifies skill_listing as skill event", () => {
    const raw = {
      timestamp: "2026-04-23T05:12:14.000Z",
      attachment: {
        type: "skill_listing",
        skillCount: 2,
        content: "- update-config\n- find-skills",
      },
    };
    const event = classifyEvent(raw, "test-id");
    expect(event?.category).toBe("skill");
    expect(event?.detail.phase).toBe("listed");
    expect(event?.detail.skillCount).toBe(2);
  });

  it("classifies mcp_instructions_delta as plugin event", () => {
    const raw = {
      timestamp: "2026-04-23T05:12:15.000Z",
      attachment: {
        type: "mcp_instructions_delta",
        addedNames: ["gemini", "figma"],
        removedNames: [],
      },
    };
    const event = classifyEvent(raw, "test-id");
    expect(event?.category).toBe("plugin");
    expect(event?.detail.names).toEqual(["gemini", "figma"]);
    expect(event?.detail.pluginType).toBe("mcp");
  });

  it("classifies Agent tool_use as agent event", () => {
    const raw = {
      type: "assistant",
      timestamp: "2026-04-23T05:12:16.000Z",
      isSidechain: false,
      message: {
        content: [
          {
            type: "tool_use" as const,
            id: "tu_002",
            name: "Agent",
            input: {
              subagent_type: "Explore",
              description: "Explore codebase",
              prompt: "Find files",
            },
          },
        ],
      },
    };
    const event = classifyEvent(raw, "test-id");
    expect(event?.category).toBe("agent");
    expect(event?.detail.subagentType).toBe("Explore");
  });

  it("returns null for unclassifiable events", () => {
    const raw = { type: "queue-operation", operation: "enqueue" };
    expect(classifyEvent(raw, "test-id")).toBeNull();
  });
});

describe("classifyUsage", () => {
  it("classifies assistant usage as token event", () => {
    const raw = {
      type: "assistant",
      timestamp: "2026-04-23T05:12:17.000Z",
      message: {
        usage: {
          input_tokens: 500,
          output_tokens: 120,
          cache_creation_input_tokens: 200,
          cache_read_input_tokens: 8000,
        },
      },
    };
    const event = classifyUsage(raw, "test-id");
    expect(event?.category).toBe("token");
    expect(event?.detail.fixedTokens).toBe(8000);
    expect(event?.detail.nonFixedTokens).toBe(700);
    expect(event?.detail.outputTokens).toBe(120);
  });

  it("returns null when no usage data", () => {
    const raw = {
      type: "assistant",
      timestamp: "2026-04-23T05:12:17.000Z",
      message: {},
    };
    expect(classifyUsage(raw, "test-id")).toBeNull();
  });
});
