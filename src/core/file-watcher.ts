// src/core/file-watcher.ts
import { watch } from "chokidar";
import { readFileSync, statSync } from "fs";

type LineHandler = (line: string) => void;

export function tailJsonlFile(
  filePath: string,
  onLine: LineHandler,
): () => void {
  let lastSize = 0;

  try {
    lastSize = statSync(filePath).size;
  } catch {
    lastSize = 0;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    content.split("\n").forEach((line) => {
      if (line.trim()) onLine(line);
    });
    lastSize = Buffer.byteLength(content, "utf-8");
  } catch {
    // file may not exist yet
  }

  const watcher = watch(filePath, { persistent: true, usePolling: false });

  watcher.on("change", () => {
    try {
      const content = readFileSync(filePath, "utf-8");
      const currentSize = Buffer.byteLength(content, "utf-8");
      if (currentSize <= lastSize) return;

      const newContent = content.slice(lastSize);
      lastSize = currentSize;
      newContent.split("\n").forEach((line) => {
        if (line.trim()) onLine(line);
      });
    } catch {
      // ignore read errors
    }
  });

  return () => watcher.close();
}
