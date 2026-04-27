import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";
import { t } from "../../i18n";

type Props = {
  events: LogEvent[];
  scrollOffset: number;
  visibleHeight: number;
};

export function SkillsPanel({ events, scrollOffset, visibleHeight }: Props) {
  const skillEvents = events.filter((e) => e.category === "skill");
  const invocations = skillEvents.filter(
    (e) => (e.detail as { phase: string }).phase === "invoked",
  );
  const listings = skillEvents.filter(
    (e) => (e.detail as { phase: string }).phase === "listed",
  );
  const visibleInvocations = invocations.slice(
    scrollOffset,
    scrollOffset + visibleHeight - 3,
  );

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold underline>
        Skills
      </Text>
      {listings.length > 0 && (
        <Box flexDirection="column">
          <Text color="cyan">
            {t("availableSkills")(
              (listings[0].detail as { skillCount?: number }).skillCount ?? 0,
            )}
          </Text>
        </Box>
      )}
      <Text bold>{t("invokedSkills")(invocations.length)}</Text>
      {visibleInvocations.map((e) => {
        const d = e.detail as { skillName: string };
        return (
          <Box key={e.id} gap={1}>
            <Text color="gray">{e.timestamp.toISOString().slice(11, 19)}</Text>
            <Text color="cyan">▶</Text>
            <Text bold>{d.skillName}</Text>
          </Box>
        );
      })}
      {invocations.length === 0 && <Text dimColor>{t("noSkillsInvoked")}</Text>}
    </Box>
  );
}
