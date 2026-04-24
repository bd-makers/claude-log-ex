import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";

type Props = {
  events: LogEvent[];
  scrollOffset: number;
  visibleHeight: number;
};

export function PluginsPanel({
  events,
  scrollOffset: _scrollOffset,
  visibleHeight: _visibleHeight,
}: Props) {
  const pluginEvents = events.filter((e) => e.category === "plugin");
  const mcpEvents = pluginEvents.filter(
    (e) => (e.detail as { pluginType: string }).pluginType === "mcp",
  );
  const toolEvents = pluginEvents.filter(
    (e) => (e.detail as { pluginType: string }).pluginType === "tool",
  );

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold underline>
        Plugins ({pluginEvents.length})
      </Text>

      {mcpEvents.length > 0 && (
        <Box flexDirection="column">
          <Text bold color="magenta">
            MCP 서버 ({mcpEvents.length})
          </Text>
          {mcpEvents.map((e) => {
            const d = e.detail as { names: string[]; action: string };
            return (
              <Box key={e.id} gap={1}>
                <Text color="gray">
                  {e.timestamp.toISOString().slice(11, 19)}
                </Text>
                <Text color={d.action === "added" ? "green" : "red"}>
                  {d.action === "added" ? "+" : "-"}
                </Text>
                <Text>{d.names.join(", ")}</Text>
              </Box>
            );
          })}
        </Box>
      )}

      {toolEvents.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan">
            Deferred Tools ({toolEvents.length})
          </Text>
          {toolEvents.map((e) => {
            const d = e.detail as { names: string[] };
            return (
              <Box key={e.id} flexDirection="column">
                <Box gap={1}>
                  <Text color="gray">
                    {e.timestamp.toISOString().slice(11, 19)}
                  </Text>
                  <Text color="cyan">+{d.names.length}개</Text>
                </Box>
                <Text dimColor>
                  {d.names.slice(0, 5).join(", ")}
                  {d.names.length > 5 ? ` 외 ${d.names.length - 5}개` : ""}
                </Text>
              </Box>
            );
          })}
        </Box>
      )}

      {pluginEvents.length === 0 && <Text dimColor>플러그인 이벤트 없음</Text>}
    </Box>
  );
}
