// src/core/event-classifier.ts
import type { RawJsonlLine, RawContent, LogEvent } from "../events/types";
import { t } from "../i18n";

export function classifyEvent(
  raw: Partial<RawJsonlLine>,
  id: string,
): LogEvent | null {
  const timestamp = raw.timestamp ? new Date(raw.timestamp) : new Date();
  const att = raw.attachment;

  if (att) {
    if (att.type === "hook_success" || att.type === "hook_non_blocking_error") {
      return {
        id,
        timestamp,
        category: "hook",
        summary: `${att.hookEvent} → ${att.hookName}`,
        detail: {
          hookName: att.hookName ?? "",
          hookEvent: att.hookEvent ?? "",
          status: att.type === "hook_success" ? "success" : "error",
          durationMs: att.durationMs,
          exitCode: att.exitCode,
          command: att.command,
        },
      };
    }

    if (att.type === "hook_additional_context") {
      return {
        id,
        timestamp,
        category: "rule",
        summary: `Rule context: ${att.hookName}`,
        detail: {
          source: "hook_context" as const,
          content: att.content ?? "",
        },
      };
    }

    if (att.type === "skill_listing") {
      return {
        id,
        timestamp,
        category: "skill",
        summary: `Skills listed (${att.skillCount ?? 0})`,
        detail: {
          skillName: "",
          phase: "listed" as const,
          skillCount: att.skillCount,
        },
      };
    }

    if (att.type === "mcp_instructions_delta") {
      const names = [...(att.addedNames ?? [])];
      if (names.length === 0 && (att.removedNames?.length ?? 0) === 0)
        return null;
      return {
        id,
        timestamp,
        category: "plugin",
        summary: `MCP plugins: +${att.addedNames?.length ?? 0} -${att.removedNames?.length ?? 0}`,
        detail: {
          pluginType: "mcp" as const,
          names: att.addedNames?.length
            ? att.addedNames
            : (att.removedNames ?? []),
          action: att.addedNames?.length ? "added" : "removed",
        },
      };
    }

    if (att.type === "deferred_tools_delta") {
      const names = [...(att.addedNames ?? [])];
      if (names.length === 0) return null;
      return {
        id,
        timestamp,
        category: "plugin",
        summary: `Tools added: ${names.slice(0, 3).join(", ")}${names.length > 3 ? "..." : ""}`,
        detail: {
          pluginType: "tool" as const,
          names,
          action: "added" as const,
        },
      };
    }
  }

  if (raw.type === "human" && raw.message?.content) {
    const content = raw.message.content;
    let text = "";
    if (typeof content === "string") {
      text = content;
    } else if (Array.isArray(content)) {
      const textItem = (content as RawContent[]).find((c) => c.type === "text");
      if (textItem && textItem.type === "text") text = textItem.text;
    }
    if (!text.trim()) return null;
    const firstLine = text.split("\n")[0].slice(0, 100);
    const hasMore = text.includes("\n") || text.length > 100;
    return {
      id,
      timestamp,
      category: "message",
      summary: hasMore ? firstLine + "…" : firstLine,
      detail: { role: "user", text },
    };
  }

  if (raw.type === "assistant" && raw.message?.content) {
    const content = raw.message.content;
    if (!Array.isArray(content)) return null;

    for (const item of content as RawContent[]) {
      if (item.type !== "tool_use") continue;

      if (item.name === "Skill") {
        const skillName = (item.input as { skill?: string }).skill ?? "";
        return {
          id,
          timestamp,
          category: "skill",
          summary: `Skill invoked: ${skillName}`,
          detail: { skillName, phase: "invoked" as const },
        };
      }

      if (item.name === "Agent") {
        const input = item.input as {
          subagent_type?: string;
          description?: string;
          prompt?: string;
        };
        return {
          id,
          timestamp,
          category: "agent",
          summary: `Agent dispatched: ${input.subagent_type ?? "general-purpose"}`,
          detail: {
            subagentType: input.subagent_type,
            prompt: input.prompt?.slice(0, 100),
            isSidechain: raw.isSidechain ?? false,
            parentUuid: raw.parentUuid,
          },
        };
      }
    }
  }

  return null;
}

export function classifyUsage(
  raw: Partial<RawJsonlLine>,
  id: string,
): LogEvent | null {
  if (raw.type !== "assistant" || !raw.message?.usage) return null;
  const u = raw.message.usage;
  const cacheRead = u.cache_read_input_tokens ?? 0;
  const cacheCreate = u.cache_creation_input_tokens ?? 0;
  const inputTokens = u.input_tokens ?? 0;
  const outputTokens = u.output_tokens ?? 0;
  if (cacheRead + cacheCreate + inputTokens + outputTokens === 0) return null;
  const timestamp = raw.timestamp ? new Date(raw.timestamp) : new Date();
  return {
    id,
    timestamp,
    category: "token",
    summary: t("tokenSummary")(
      cacheRead.toLocaleString(),
      inputTokens.toLocaleString(),
      outputTokens.toLocaleString(),
    ),
    detail: {
      fixedTokens: cacheRead,
      nonFixedTokens: inputTokens,
      outputTokens,
      cacheCreationTokens: cacheCreate,
      totalInputTokens: cacheRead + inputTokens,
      model: raw.message?.model,
    },
  };
}
