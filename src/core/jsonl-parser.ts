import { RawJsonlLine } from "../events/types";
import { readFileSync } from "fs";

export function parseJsonlLine(line: string): RawJsonlLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as RawJsonlLine;
  } catch {
    return null;
  }
}

export function parseJsonlFile(filePath: string): RawJsonlLine[] {
  const content = readFileSync(filePath, "utf-8");
  return content
    .split("\n")
    .map(parseJsonlLine)
    .filter((line): line is RawJsonlLine => line !== null);
}
