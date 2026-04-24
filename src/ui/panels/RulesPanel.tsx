import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";

type Props = { events: LogEvent[] };

export function RulesPanel({ events }: Props) {
  const ruleEvents = events.filter((e) => e.category === "rule");
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold underline>
        Rules / Context ({ruleEvents.length})
      </Text>
      {ruleEvents.length === 0 && (
        <Text dimColor>hook_additional_context 이벤트 없음</Text>
      )}
      {ruleEvents.slice(-20).map((e) => {
        const d = e.detail as { source: string; content: string };
        return (
          <Box key={e.id} flexDirection="column" marginBottom={1}>
            <Box gap={1}>
              <Text color="gray">
                {e.timestamp.toISOString().slice(11, 19)}
              </Text>
              <Text color="green" bold>
                [{d.source}]
              </Text>
            </Box>
            <Text dimColor wrap="wrap">
              {d.content.slice(0, 200)}
              {d.content.length > 200 ? "..." : ""}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
