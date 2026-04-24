import { Box, Text } from "ink";
import type { LogEvent } from "../../events/types";

type Props = { events: LogEvent[] };

export function SkillsPanel({ events }: Props) {
  const skillEvents = events.filter((e) => e.category === "skill");
  const invocations = skillEvents.filter(
    (e) => (e.detail as { phase: string }).phase === "invoked",
  );
  const listings = skillEvents.filter(
    (e) => (e.detail as { phase: string }).phase === "listed",
  );

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold underline>
        Skills
      </Text>
      {listings.length > 0 && (
        <Box flexDirection="column">
          <Text color="cyan">
            사용 가능한 스킬:{" "}
            {(listings[0].detail as { skillCount?: number }).skillCount ?? "?"}
            개
          </Text>
        </Box>
      )}
      <Text bold>호출된 스킬 ({invocations.length})</Text>
      {invocations.map((e) => {
        const d = e.detail as { skillName: string };
        return (
          <Box key={e.id} gap={1}>
            <Text color="gray">{e.timestamp.toISOString().slice(11, 19)}</Text>
            <Text color="cyan">▶</Text>
            <Text bold>{d.skillName}</Text>
          </Box>
        );
      })}
      {invocations.length === 0 && (
        <Text dimColor>이 세션에서 스킬 호출 없음</Text>
      )}
    </Box>
  );
}
