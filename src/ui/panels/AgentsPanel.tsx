import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";

type Props = {
  events: LogEvent[];
  scrollOffset: number;
  visibleHeight: number;
};

export function AgentsPanel({ events, scrollOffset, visibleHeight }: Props) {
  const agentEvents = events.filter((e) => e.category === "agent");
  const itemHeight = 2;
  const visible = agentEvents.slice(
    scrollOffset,
    scrollOffset + Math.floor(visibleHeight / itemHeight),
  );
  return (
    <Box flexDirection="column">
      <Text bold underline>
        Agents ({agentEvents.length})
      </Text>
      {visible.map((e) => {
        const d = e.detail as {
          subagentType?: string;
          prompt?: string;
          isSidechain: boolean;
        };
        return (
          <Box key={e.id} flexDirection="column" marginBottom={1}>
            <Box gap={1}>
              <Text color="gray">
                {e.timestamp.toISOString().slice(11, 19)}
              </Text>
              <Text color="blue">Agent</Text>
              <Text bold color="blue">
                {d.subagentType ?? "general-purpose"}
              </Text>
              {d.isSidechain && <Text color="yellow">[sidechain]</Text>}
            </Box>
            {d.prompt && (
              <Text dimColor wrap="truncate">
                {" "}
                {d.prompt}
              </Text>
            )}
          </Box>
        );
      })}
      {agentEvents.length === 0 && <Text dimColor>에이전트 호출 없음</Text>}
    </Box>
  );
}
