import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";

type Props = { events: LogEvent[] };

export function HooksPanel({ events }: Props) {
  const hookEvents = events.filter((e) => e.category === "hook");
  return (
    <Box flexDirection="column">
      <Text bold underline>
        Hooks ({hookEvents.length})
      </Text>
      {hookEvents.slice(-20).map((e) => {
        const d = e.detail as {
          hookName: string;
          hookEvent: string;
          status: string;
          durationMs?: number;
          exitCode?: number;
        };
        return (
          <Box key={e.id} gap={1}>
            <Text color="gray">{e.timestamp.toISOString().slice(11, 19)}</Text>
            <Text color={d.status === "success" ? "green" : "red"}>
              {d.status === "success" ? "✓" : "✗"}
            </Text>
            <Text bold>{d.hookName}</Text>
            <Text dimColor>[{d.hookEvent}]</Text>
            {d.durationMs !== undefined && (
              <Text dimColor>{d.durationMs}ms</Text>
            )}
            {d.exitCode !== undefined && d.exitCode !== 0 && (
              <Text color="red">exit:{d.exitCode}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
