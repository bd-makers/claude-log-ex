import { Box, Text } from "ink";

type Props = { tabs: string[]; active: string };

export function TabBar({ tabs, active }: Props) {
  return (
    <Box gap={0} marginBottom={0}>
      {tabs.map((tab, i) => (
        <Box
          key={tab}
          paddingX={1}
          borderStyle={active === tab ? "bold" : undefined}
        >
          <Text
            bold={active === tab}
            color={active === tab ? "cyan" : "gray"}
            dimColor={active !== tab}
          >
            {i + 1}:{tab}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
