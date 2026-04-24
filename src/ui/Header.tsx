import { Box, Text } from "ink";
import { basename } from "path";

type Props = {
  sessionPath: string;
  eventCount: number;
  totalTokens: { fixed: number; nonFixed: number };
};

export function Header({ sessionPath, eventCount, totalTokens }: Props) {
  const sessionId = basename(sessionPath, ".jsonl").slice(0, 8);
  const totalInput = totalTokens.fixed + totalTokens.nonFixed;
  return (
    <Box borderStyle="round" paddingX={1} marginBottom={0} gap={2}>
      <Text bold color="cyan">
        Claude Log Explorer
      </Text>
      <Text dimColor>session:</Text>
      <Text color="yellow">{sessionId}...</Text>
      <Text dimColor>events:</Text>
      <Text color="green">{eventCount}</Text>
      {totalInput > 0 && (
        <>
          <Text dimColor>tokens:</Text>
          <Text color="green">{totalTokens.fixed.toLocaleString()}</Text>
          <Text dimColor>+</Text>
          <Text color="yellow">{totalTokens.nonFixed.toLocaleString()}</Text>
        </>
      )}
    </Box>
  );
}
