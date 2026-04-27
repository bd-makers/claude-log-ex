import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";

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
    return <Text dimColor>토큰 데이터 없음. assistant 메시지 대기 중...</Text>;
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
        <Text bold>누적 합계</Text>
        <Box gap={2}>
          <Text color="green">캐시: {totals.fixed.toLocaleString()}</Text>
          <Text color="yellow">논캐시: {totals.nonFixed.toLocaleString()}</Text>
          <Text color="cyan">응답토큰: {totals.output.toLocaleString()}</Text>
        </Box>
        <Box gap={1}>
          <Text dimColor>캐시 히트율</Text>
          <Text color="red">{bar(fixedRatio)}</Text>
          <Text dimColor>{Math.round(fixedRatio * 100)}%</Text>
          <Text dimColor>(캐시 재사용/전체 입력)</Text>
        </Box>
      </Box>
      <Text bold>턴별 내역</Text>
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
              <Text color="green">캐시:{d.fixedTokens.toLocaleString()}</Text>
              <Text color="yellow">
                논캐시:{d.nonFixedTokens.toLocaleString()}
              </Text>
              <Text color="cyan">응답:{d.outputTokens.toLocaleString()}</Text>
              <Text dimColor>캐시 히트율</Text>
              <Text color="red">
                {bar(ratio, 12)} {Math.round(ratio * 100)}%
              </Text>
            </Box>
          );
        })}
    </Box>
  );
}
