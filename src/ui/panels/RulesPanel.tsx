import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";
import { t } from "../../i18n";

type Props = {
  events: LogEvent[];
  scrollOffset: number;
  visibleHeight: number;
};

export function RulesPanel({ events, scrollOffset, visibleHeight }: Props) {
  const ruleEvents = events.filter((e) => e.category === "rule");
  const itemHeight = 3;
  const maxVisible = Math.floor(visibleHeight / itemHeight);
  const visible = ruleEvents.slice(scrollOffset, scrollOffset + maxVisible);
  return (
    <Box flexDirection="column" gap={1} width="100%">
      <Text bold underline>
        Rules / Context ({ruleEvents.length})
        {ruleEvents.length > maxVisible
          ? t("scrollHintInline")(
              scrollOffset + 1,
              Math.min(scrollOffset + maxVisible, ruleEvents.length),
              ruleEvents.length,
            )
          : ""}
      </Text>
      {ruleEvents.length === 0 && <Text dimColor>{t("noContextEvents")}</Text>}
      {visible.map((e) => {
        const d = e.detail as { source: string; content: string };
        return (
          <Box key={e.id} flexDirection="column" marginBottom={1} width="100%">
            <Box gap={1}>
              <Text color="gray">
                {e.timestamp.toISOString().slice(11, 19)}
              </Text>
              <Text color="green" bold>
                [{d.source}]
              </Text>
            </Box>
            <Box flexShrink={1}>
              <Text dimColor wrap="wrap">
                {d.content.slice(0, 200)}
                {d.content.length > 200 ? "..." : ""}
              </Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
