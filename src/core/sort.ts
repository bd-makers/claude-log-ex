import type { SortDir } from "../events/types";

export function applySort<T>(list: T[], dir: SortDir): T[] {
  return dir === "desc" ? [...list].reverse() : list;
}
