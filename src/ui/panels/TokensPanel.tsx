import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";
import { t } from "../../i18n";

type Props = {
  events: LogEvent[];
  scrollOffset: number;
  visibleHeight: number;
};

function bar(ratio: number, width = 20): string {
  const filled = Math.round(ratio * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

export function TokensPanel({ events, scrollOffset, visibleHeight }: Props) {
  const tokenEvents = events.filter((e) => e.category === "token");
  if (tokenEvents.length === 0) {
    return <Text dimColor>{t("noTokenData")}</Text>;
  }

  const totals = tokenEvents.reduce(
    (acc, e) => {
      const d = e.detail as {
        fixedTokens: number;
        nonFixedTokens: number;
        outputTokens: number;
      };
      return {
        fixed: acc.fixed + d.fixedTokens,
        nonFixed: acc.nonFixed + d.nonFixedTokens,
        output: acc.output + d.outputTokens,
      };
    },
    { fixed: 0, nonFixed: 0, output: 0 },
  );

  const totalInput = totals.fixed + totals.nonFixed;
  const fixedRatio = totalInput > 0 ? totals.fixed / totalInput : 0;

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold underline>
        Token Usage ({tokenEvents.length} turns)
      </Text>
      <Box flexDirection="column" borderStyle="single" paddingX={1}>
        <Text bold>{t("cumulative")}</Text>
        <Box gap={2}>
          <Text color="green">
            {t("cached")} {totals.fixed.toLocaleString()}
          </Text>
          <Text color="yellow">
            {t("nonCached")} {totals.nonFixed.toLocaleString()}
          </Text>
          <Text color="cyan">
            {t("outputTokens")} {totals.output.toLocaleString()}
          </Text>
        </Box>
        <Box gap={1}>
          <Text dimColor>{t("cacheHitRate")}</Text>
          <Text color="red">{bar(fixedRatio)}</Text>
          <Text dimColor>{Math.round(fixedRatio * 100)}%</Text>
          <Text dimColor>{t("cacheHitRateNote")}</Text>
        </Box>
      </Box>
      <Text bold>{t("perTurn")}</Text>
      {tokenEvents
        .slice(scrollOffset, scrollOffset + Math.max(5, visibleHeight - 8))
        .map((e) => {
          const d = e.detail as {
            fixedTokens: number;
            nonFixedTokens: number;
            outputTokens: number;
            totalInputTokens: number;
          };
          const ratio =
            d.totalInputTokens > 0 ? d.fixedTokens / d.totalInputTokens : 0;
          return (
            <Box key={e.id} gap={1}>
              <Text color="gray">
                {e.timestamp.toISOString().slice(11, 19)}
              </Text>
              <Text color="green">
                {t("cached")}
                {d.fixedTokens.toLocaleString()}
              </Text>
              <Text color="yellow">
                {t("nonCached")}
                {d.nonFixedTokens.toLocaleString()}
              </Text>
              <Text color="cyan">
                {t("outputTokens")}
                {d.outputTokens.toLocaleString()}
              </Text>
              <Text dimColor>{t("cacheHitRate")}</Text>
              <Text color="red">
                {bar(ratio, 12)} {Math.round(ratio * 100)}%
              </Text>
            </Box>
          );
        })}
    </Box>
  );
}
