// src/core/file-watcher.ts
import { watch } from "chokidar";
import { createReadStream, openSync, readSync, closeSync, statSync } from "fs";
import { createInterface } from "readline";

type LineHandler = (line: string) => void;

export function tailJsonlFile(
  filePath: string,
  onLine: LineHandler,
): () => void {
  let lastOffset = 0;
  let watcher: ReturnType<typeof watch> | null = null;

  const startWatcher = () => {
    watcher = watch(filePath, { persistent: true, usePolling: false });
    watcher.on("change", () => {
      try {
        const currentSize = statSync(filePath).size;
        if (currentSize <= lastOffset) return;

        const newByteCount = currentSize - lastOffset;
        const buf = Buffer.alloc(newByteCount);
        const fd = openSync(filePath, "r");
        readSync(fd, buf, 0, newByteCount, lastOffset);
        closeSync(fd);
        lastOffset = currentSize;

        buf
          .toString("utf-8")
          .split("\n")
          .forEach((line) => {
            if (line.trim()) onLine(line);
          });
      } catch {
        // ignore read errors
      }
    });
  };

  const stream = createReadStream(filePath, { encoding: "utf-8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  rl.on("line", (line) => {
    if (line.trim()) onLine(line);
  });

  rl.on("close", () => {
    try {
      lastOffset = statSync(filePath).size;
    } catch {
      lastOffset = 0;
    }
    startWatcher();
  });

  rl.on("error", () => {
    startWatcher();
  });

  stream.on("error", () => {
    rl.close();
  });

  return () => {
    rl.close();
    watcher?.close();
  };
}
