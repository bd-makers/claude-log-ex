import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";
import { t } from "../../i18n";

const CONTEXT_LIMITS: Record<string, number> = {
  "claude-opus-4": 200000,
  "claude-sonnet-4": 200000,
  "claude-haiku-4": 200000,
  "claude-3-5-sonnet": 200000,
  "claude-3-5-haiku": 200000,
  "claude-3-opus": 200000,
  "claude-3-haiku": 200000,
};

function getContextLimit(model?: string): number {
  if (!model) return 200000;
  for (const key of Object.keys(CONTEXT_LIMITS)) {
    if (model.includes(key)) return CONTEXT_LIMITS[key];
  }
  return 200000;
}

function barColor(ratio: number): string {
  if (ratio >= 0.9) return "red";
  if (ratio >= 0.75) return "yellow";
  return "green";
}

type SegmentBarProps = {
  fixedRatio: number;
  nonFixedRatio: number;
  width?: number;
};

function SegmentBar({
  fixedRatio,
  nonFixedRatio,
  width = 30,
}: SegmentBarProps) {
  const fixed = Math.round(Math.min(fixedRatio, 1) * width);
  const nonFixed = Math.round(Math.min(nonFixedRatio, 1) * width);
  const clamped = Math.min(fixed + nonFixed, width);
  const nonFixedActual = Math.max(0, clamped - fixed);
  const empty = width - fixed - nonFixedActual;
  return (
    <Box>
      <Text color="gray">{"█".repeat(fixed)}</Text>
      <Text color="green">{"█".repeat(nonFixedActual)}</Text>
      <Text dimColor>{"░".repeat(Math.max(0, empty))}</Text>
    </Box>
  );
}

type Props = {
  events: LogEvent[];
  scrollOffset: number;
  visibleHeight: number;
};

export function ContextPanel({ events, scrollOffset, visibleHeight }: Props) {
  const tokenEvents = events.filter((e) => e.category === "token");
  if (tokenEvents.length === 0) {
    return <Text dimColor>{t("noTokenData")}</Text>;
  }

  const latest = tokenEvents[tokenEvents.length - 1];
  const latestDetail = latest.detail as {
    totalInputTokens: number;
    fixedTokens: number;
    nonFixedTokens: number;
    cacheCreationTokens: number;
    outputTokens: number;
    model?: string;
  };

  const model = tokenEvents
    .map((e) => (e.detail as { model?: string }).model)
    .filter(Boolean)
    .pop();

  const limit = getContextLimit(model);
  const latestRatio = latestDetail.totalInputTokens / limit;
  const color = barColor(latestRatio);

  const visibleTurns = Math.max(5, visibleHeight - 10);
  const turns = tokenEvents.slice(scrollOffset, scrollOffset + visibleTurns);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold underline>
        Context Window Usage
      </Text>
      <Box flexDirection="column" borderStyle="single" paddingX={1} gap={0}>
        <Box gap={2}>
          <Text bold>{t("model")}</Text>
          <Text color="cyan">{model ?? "unknown"}</Text>
          <Text bold>{t("limit")}</Text>
          <Text>{limit.toLocaleString()} tokens</Text>
        </Box>
        <Box gap={1}>
          <SegmentBar
            fixedRatio={latestDetail.fixedTokens / limit}
            nonFixedRatio={latestDetail.nonFixedTokens / limit}
          />
          <Text color={color} bold>
            {Math.round(latestRatio * 100)}%
          </Text>
          <Text dimColor>
            ({latestDetail.totalInputTokens.toLocaleString()} /{" "}
            {limit.toLocaleString()})
          </Text>
        </Box>
        <Box gap={2}>
          <Text color="gray">
            {t("systemPrompt")} {latestDetail.fixedTokens.toLocaleString()}
          </Text>
          <Text color="green">
            {t("nonFixed")} {latestDetail.nonFixedTokens.toLocaleString()}
          </Text>
          <Text color="yellow">
            {t("cacheCreation")}{" "}
            {latestDetail.cacheCreationTokens.toLocaleString()}
          </Text>
          <Text color="cyan">
            {t("output")} {latestDetail.outputTokens.toLocaleString()}
          </Text>
        </Box>
      </Box>

      <Text bold>{t("perTurnContext")(tokenEvents.length)}</Text>
      {turns.map((e, i) => {
        const d = e.detail as {
          totalInputTokens: number;
          fixedTokens: number;
          nonFixedTokens: number;
        };
        const ratio = d.totalInputTokens / limit;
        const c = barColor(ratio);
        const turnNum = scrollOffset + i + 1;
        return (
          <Box key={e.id} gap={1}>
            <Text color="gray" dimColor>
              #{String(turnNum).padStart(2, "0")}
            </Text>
            <Text color="gray" dimColor>
              {e.timestamp.toISOString().slice(11, 16)}
            </Text>
            <SegmentBar
              fixedRatio={d.fixedTokens / limit}
              nonFixedRatio={d.nonFixedTokens / limit}
              width={20}
            />
            <Text color={c}>{Math.round(ratio * 100)}%</Text>
            <Text dimColor>{d.totalInputTokens.toLocaleString()}</Text>
          </Box>
        );
      })}
      {tokenEvents.length > visibleTurns && (
        <Text dimColor>
          {t("scrollHint")(
            scrollOffset + 1,
            Math.min(scrollOffset + visibleTurns, tokenEvents.length),
            tokenEvents.length,
          )}
        </Text>
      )}
    </Box>
  );
}
