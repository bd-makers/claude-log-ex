export type Locale = "en" | "ko";

let locale: Locale = "en";
export const setLocale = (l: Locale) => {
  locale = l;
};
export const getLocale = () => locale;

const strings = {
  en: {
    sessionFallback: (path: string) =>
      `Session detection failed. Using recent session: ${path}`,
    sessionNotFound: "❌ Claude session not found.",
    usage: "Usage: clogex [session.jsonl path]",
    noEvents: "No events...",
    footerHint: "1-8: switch tab | ←→: navigate | ↑↓: scroll | q: quit",
    availableSkills: (n: number) => `Available skills: ${n}`,
    invokedSkills: (n: number) => `Invoked Skills (${n})`,
    noSkillsInvoked: "No skills invoked in this session",
    noAgents: "No agent calls",
    noTokenData: "No token data. Waiting for assistant message...",
    cumulative: "Cumulative",
    cached: "cached:",
    nonCached: "non-cached:",
    outputTokens: "output:",
    cacheHitRate: "Cache hit rate",
    cacheHitRateNote: "(cache reuse/total input)",
    perTurn: "Per-turn breakdown",
    model: "Model:",
    limit: "Limit:",
    systemPrompt: "■ System prompt:",
    nonFixed: "■ Non-fixed:",
    cacheCreation: "Cache creation:",
    output: "Output:",
    perTurnContext: (n: number) => `Context usage per turn (${n} turns)`,
    scrollHint: (from: number, to: number, total: number) =>
      `↑↓ scroll (${from}-${to}/${total})`,
    scrollHintInline: (from: number, to: number, total: number) =>
      ` [↑↓ scroll: ${from}-${to}/${total}]`,
    noContextEvents: "No hook_additional_context events",
    noPluginEvents: "No plugin events",
    mcpServers: (n: number) => `MCP Servers (${n})`,
    pluginCount: (n: number) => `+${n}`,
    moreItems: (n: number) => ` and ${n} more`,
    tokenSummary: (fixed: string, nonFixed: string, output: string) =>
      `fixed ${fixed} / non-fixed ${nonFixed} / output ${output}`,
  },
  ko: {
    sessionFallback: (path: string) =>
      `세션 감지 실패. 최근 세션 사용: ${path}`,
    sessionNotFound: "❌ Claude 세션을 찾을 수 없습니다.",
    usage: "사용법: clogex [session.jsonl 경로]",
    noEvents: "이벤트 없음...",
    footerHint: "1-8: 탭 전환 | ←→: 이동 | ↑↓: 스크롤 | q: 종료",
    availableSkills: (n: number) => `사용 가능한 스킬: ${n}개`,
    invokedSkills: (n: number) => `호출된 스킬 (${n})`,
    noSkillsInvoked: "이 세션에서 스킬 호출 없음",
    noAgents: "에이전트 호출 없음",
    noTokenData: "토큰 데이터 없음. assistant 메시지 대기 중...",
    cumulative: "누적 합계",
    cached: "캐시:",
    nonCached: "논캐시:",
    outputTokens: "응답토큰:",
    cacheHitRate: "캐시 히트율",
    cacheHitRateNote: "(캐시 재사용/전체 입력)",
    perTurn: "턴별 내역",
    model: "모델:",
    limit: "한도:",
    systemPrompt: "■ 시스템프롬프트:",
    nonFixed: "■ 비고정:",
    cacheCreation: "캐시 생성:",
    output: "출력:",
    perTurnContext: (n: number) => `턴별 컨텍스트 사용 (${n} turns)`,
    scrollHint: (from: number, to: number, total: number) =>
      `↑↓ 스크롤 (${from}-${to}/${total})`,
    scrollHintInline: (from: number, to: number, total: number) =>
      ` [↑↓ 스크롤: ${from}-${to}/${total}]`,
    noContextEvents: "hook_additional_context 이벤트 없음",
    noPluginEvents: "플러그인 이벤트 없음",
    mcpServers: (n: number) => `MCP 서버 (${n})`,
    pluginCount: (n: number) => `+${n}개`,
    moreItems: (n: number) => ` 외 ${n}개`,
    tokenSummary: (fixed: string, nonFixed: string, output: string) =>
      `고정 ${fixed} / 비고정 ${nonFixed} / 출력 ${output}`,
  },
};

export function t<K extends keyof typeof strings.en>(
  key: K,
): (typeof strings.en)[K] {
  return (locale === "ko" ? strings.ko : strings.en)[
    key
  ] as (typeof strings.en)[K];
}
