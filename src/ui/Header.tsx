import React from "react";
import { Box, Text } from "ink";
import { basename } from "path";

type Props = { sessionPath: string; eventCount: number };

export function Header({ sessionPath, eventCount }: Props) {
  const sessionId = basename(sessionPath, ".jsonl").slice(0, 8);
  return (
    <Box borderStyle="round" paddingX={1} marginBottom={0}>
      <Text bold color="cyan">
        Claude Log Explorer{" "}
      </Text>
      <Text dimColor>session: </Text>
      <Text color="yellow">{sessionId}...</Text>
      <Text dimColor> events: </Text>
      <Text color="green">{eventCount}</Text>
    </Box>
  );
}
