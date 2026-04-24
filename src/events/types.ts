export type EventCategory =
  | "skill"
  | "hook"
  | "rule"
  | "plugin"
  | "agent"
  | "tool"
  | "message"
  | "token";

export type RawJsonlLine = {
  type: string;
  timestamp?: string;
  parentUuid?: string | null;
  isSidechain?: boolean;
  message?: {
    role?: string;
    content?: RawContent[] | string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    };
  };
  attachment?: RawAttachment;
};

export type RawContent =
  | {
      type: "tool_use";
      id: string;
      name: string;
      input: Record<string, unknown>;
    }
  | { type: "tool_result"; tool_use_id: string; content: unknown }
  | { type: "text"; text: string };

export type RawAttachment = {
  type: string;
  hookName?: string;
  hookEvent?: string;
  toolUseID?: string;
  content?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  command?: string;
  durationMs?: number;
  addedNames?: string[];
  removedNames?: string[];
  addedBlocks?: string[];
  skillCount?: number;
};

export type LogEvent = {
  id: string;
  timestamp: Date;
  category: EventCategory;
  summary: string;
  detail: Record<string, unknown>;
};

export type SkillEvent = LogEvent & {
  category: "skill";
  detail: {
    skillName: string;
    phase: "listed" | "invoked";
    skillCount?: number;
  };
};

export type HookEvent = LogEvent & {
  category: "hook";
  detail: {
    hookName: string;
    hookEvent: string;
    status: "success" | "error";
    durationMs?: number;
    exitCode?: number;
    command?: string;
  };
};

export type RuleEvent = LogEvent & {
  category: "rule";
  detail: {
    source: "claude_md" | "system_reminder" | "hook_context";
    content: string;
  };
};

export type PluginEvent = LogEvent & {
  category: "plugin";
  detail: {
    pluginType: "mcp" | "skill" | "tool";
    names: string[];
    action: "added" | "removed";
  };
};

export type TokenEvent = LogEvent & {
  category: "token";
  detail: {
    fixedTokens: number;
    nonFixedTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    totalInputTokens: number;
  };
};

export type AgentEvent = LogEvent & {
  category: "agent";
  detail: {
    agentType?: string;
    subagentType?: string;
    prompt?: string;
    isSidechain: boolean;
    parentUuid?: string | null;
  };
};
