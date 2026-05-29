import { describe, it, expect } from "vitest";
import { applySort } from "../../src/core/sort";

describe("applySort", () => {
  it("keeps ascending order unchanged", () => {
    const input = [1, 2, 3];
    expect(applySort(input, "asc")).toEqual([1, 2, 3]);
  });

  it("reverses for descending order", () => {
    expect(applySort([1, 2, 3], "desc")).toEqual([3, 2, 1]);
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    applySort(input, "desc");
    expect(input).toEqual([1, 2, 3]);
  });

  it("handles empty arrays", () => {
    expect(applySort([], "desc")).toEqual([]);
    expect(applySort([], "asc")).toEqual([]);
  });

  it("preserves chronological turn numbers when paired before reversing", () => {
    const turns = [{ id: "a" }, { id: "b" }, { id: "c" }].map((e, i) => ({
      e,
      turnNum: i + 1,
    }));
    const desc = applySort(turns, "desc");
    expect(desc.map((turn) => turn.turnNum)).toEqual([3, 2, 1]);
    expect(desc[0].e.id).toBe("c");
  });
});
