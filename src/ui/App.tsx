import { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput, useApp, useStdout } from "ink";
import { Header } from "./Header";
import { TabBar } from "./TabBar";
import { classifyEvent, classifyUsage } from "../core/event-classifier";
import { parseJsonlLine } from "../core/jsonl-parser";
import { tailJsonlFile } from "../core/file-watcher";
import type { LogEvent } from "../events/types";
import { SkillsPanel } from "./panels/SkillsPanel";
import { HooksPanel } from "./panels/HooksPanel";
import { AgentsPanel } from "./panels/AgentsPanel";
import { TokensPanel } from "./panels/TokensPanel";
import { RulesPanel } from "./panels/RulesPanel";
import { PluginsPanel } from "./panels/PluginsPanel";

type Tab =
  | "timeline"
  | "skills"
  | "hooks"
  | "rules"
  | "plugins"
  | "agents"
  | "tokens";
const TABS: Tab[] = [
  "timeline",
  "skills",
  "hooks",
  "rules",
  "plugins",
  "agents",
  "tokens",
];

type Props = { sessionPath: string };

export function App({ sessionPath }: Props) {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("timeline");
  const [scrollOffset, setScrollOffset] = useState(0);
  const { stdout } = useStdout();
  const terminalRows = stdout?.rows ?? 24;

  useEffect(() => {
    let idCounter = 0;
    const stop = tailJsonlFile(sessionPath, (line) => {
      const raw = parseJsonlLine(line);
      if (!raw) return;
      const event = classifyEvent(raw, String(idCounter++));
      if (event) setEvents((prev) => [...prev, event]);
      const tokenEvent = classifyUsage(raw, String(idCounter++));
      if (tokenEvent) setEvents((prev) => [...prev, tokenEvent]);
    });
    return stop;
  }, [sessionPath]);

  const { exit } = useApp();

  useEffect(() => {
    if (!process.stdout.isTTY || !process.stdin.isTTY) return;
    process.stdout.write("\x1b[?1000h"); // basic mouse reporting
    process.stdout.write("\x1b[?1006h"); // SGR extended mouse

    const handleData = (data: Buffer) => {
      const str = data.toString("utf8");
      const m = str.match(/\x1b\[<(\d+);\d+;\d+M/);
      if (!m) return;
      const btn = parseInt(m[1]);
      if (btn === 64) setScrollOffset((o) => Math.max(0, o - 1));
      if (btn === 65) setScrollOffset((o) => o + 1);
    };

    process.stdin.on("data", handleData);
    return () => {
      process.stdout.write("\x1b[?1006l");
      process.stdout.write("\x1b[?1000l");
      process.stdin.off("data", handleData);
    };
  }, []);

  useInput((input, key) => {
    if (input === "q") exit();
    const idx = parseInt(input) - 1;
    if (idx >= 0 && idx < TABS.length) {
      setActiveTab(TABS[idx]);
      setScrollOffset(0);
    }
    if (key.leftArrow) {
      const i = TABS.indexOf(activeTab);
      setActiveTab(TABS[Math.max(0, i - 1)]);
      setScrollOffset(0);
    }
    if (key.rightArrow) {
      const i = TABS.indexOf(activeTab);
      setActiveTab(TABS[Math.min(TABS.length - 1, i + 1)]);
      setScrollOffset(0);
    }
    if (key.upArrow) setScrollOffset((o) => Math.max(0, o - 1));
    if (key.downArrow) setScrollOffset((o) => o + 1);
  });

  const totalTokens = useMemo(
    () =>
      events
        .filter((e) => e.category === "token")
        .reduce(
          (acc, e) => {
            const d = e.detail as {
              fixedTokens: number;
              nonFixedTokens: number;
            };
            return {
              fixed: acc.fixed + d.fixedTokens,
              nonFixed: acc.nonFixed + d.nonFixedTokens,
            };
          },
          { fixed: 0, nonFixed: 0 },
        ),
    [events],
  );

  const filtered =
    activeTab === "timeline"
      ? events
      : events.filter(
          (e) =>
            e.category === activeTab.replace("s", "") ||
            e.category === activeTab.slice(0, -1),
        );

  const contentHeight = terminalRows - 4; // header(1) + tabbar(1) + footer(2)

  return (
    <Box flexDirection="column" height={terminalRows}>
      <Header
        sessionPath={sessionPath}
        eventCount={events.length}
        totalTokens={totalTokens}
      />
      <TabBar tabs={TABS} active={activeTab} />
      <Box flexDirection="column" height={contentHeight} overflow="hidden">
        {activeTab === "skills" && (
          <SkillsPanel
            events={events}
            scrollOffset={scrollOffset}
            visibleHeight={contentHeight}
          />
        )}
        {activeTab === "hooks" && (
          <HooksPanel
            events={events}
            scrollOffset={scrollOffset}
            visibleHeight={contentHeight}
          />
        )}
        {activeTab === "agents" && (
          <AgentsPanel
            events={events}
            scrollOffset={scrollOffset}
            visibleHeight={contentHeight}
          />
        )}
        {activeTab === "tokens" && (
          <TokensPanel
            events={events}
            scrollOffset={scrollOffset}
            visibleHeight={contentHeight}
          />
        )}
        {activeTab === "rules" && (
          <RulesPanel
            events={events}
            scrollOffset={scrollOffset}
            visibleHeight={contentHeight}
          />
        )}
        {activeTab === "plugins" && (
          <PluginsPanel
            events={events}
            scrollOffset={scrollOffset}
            visibleHeight={contentHeight}
          />
        )}
        {activeTab === "timeline" && (
          <>
            {filtered
              .slice(-contentHeight)
              .slice(scrollOffset > 0 ? scrollOffset : 0)
              .map((event) => (
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
        <Text dimColor>1-7: 탭 전환 | ←→: 이동 | ↑↓: 스크롤 | q: 종료</Text>
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
