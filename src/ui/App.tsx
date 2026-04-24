import { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { Header } from "./Header";
import { TabBar } from "./TabBar";
import { classifyEvent } from "../core/event-classifier";
import { parseJsonlLine } from "../core/jsonl-parser";
import { tailJsonlFile } from "../core/file-watcher";
import type { LogEvent } from "../events/types";
import { SkillsPanel } from "./panels/SkillsPanel";
import { HooksPanel } from "./panels/HooksPanel";
import { AgentsPanel } from "./panels/AgentsPanel";

type Tab = "timeline" | "skills" | "hooks" | "rules" | "plugins" | "agents";
const TABS: Tab[] = [
  "timeline",
  "skills",
  "hooks",
  "rules",
  "plugins",
  "agents",
];

type Props = { sessionPath: string };

export function App({ sessionPath }: Props) {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("timeline");

  useEffect(() => {
    let idCounter = 0;
    const stop = tailJsonlFile(sessionPath, (line) => {
      const raw = parseJsonlLine(line);
      if (!raw) return;
      const event = classifyEvent(raw, String(idCounter++));
      if (event) setEvents((prev) => [...prev, event]);
    });
    return stop;
  }, [sessionPath]);

  useInput((input, key) => {
    const idx = parseInt(input) - 1;
    if (idx >= 0 && idx < TABS.length) setActiveTab(TABS[idx]);
    if (key.leftArrow) {
      const i = TABS.indexOf(activeTab);
      setActiveTab(TABS[Math.max(0, i - 1)]);
    }
    if (key.rightArrow) {
      const i = TABS.indexOf(activeTab);
      setActiveTab(TABS[Math.min(TABS.length - 1, i + 1)]);
    }
  });

  const filtered =
    activeTab === "timeline"
      ? events
      : events.filter(
          (e) =>
            e.category === activeTab.replace("s", "") ||
            e.category === activeTab.slice(0, -1),
        );

  return (
    <Box flexDirection="column" height="100%">
      <Header sessionPath={sessionPath} eventCount={events.length} />
      <TabBar tabs={TABS} active={activeTab} />
      <Box flexDirection="column" flexGrow={1} overflowY="hidden">
        {activeTab === "skills" && <SkillsPanel events={events} />}
        {activeTab === "hooks" && <HooksPanel events={events} />}
        {activeTab === "agents" && <AgentsPanel events={events} />}
        {(activeTab === "timeline" ||
          activeTab === "rules" ||
          activeTab === "plugins") && (
          <>
            {filtered.slice(-30).map((event) => (
              <Box key={event.id} gap={1}>
                <Text color="gray" dimColor>
                  {event.timestamp.toISOString().slice(11, 19)}
                </Text>
                <Text color={categoryColor(event.category)}>
                  [{event.category.toUpperCase()}]
                </Text>
                <Text>{event.summary}</Text>
              </Box>
            ))}
            {filtered.length === 0 && <Text dimColor>이벤트 없음...</Text>}
          </>
        )}
      </Box>
      <Box borderStyle="single" paddingX={1}>
        <Text dimColor>1-6: 탭 전환 | ←→: 이동 | q: 종료</Text>
      </Box>
    </Box>
  );
}

function categoryColor(category: string): string {
  const map: Record<string, string> = {
    skill: "cyan",
    hook: "yellow",
    rule: "green",
    plugin: "magenta",
    agent: "blue",
    tool: "white",
    message: "gray",
  };
  return map[category] ?? "white";
}
