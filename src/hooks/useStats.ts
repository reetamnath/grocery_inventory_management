import { useMemo } from "react";
import type { InventoryItem, ColumnConfig } from "@/types";

interface Stats {
  total: number;
  finished: number;
  half: number;
  full: number;
}

interface UseStatsOptions {
  items: InventoryItem[];
  columnNames: ColumnConfig;
}

export function useStats({ items, columnNames }: UseStatsOptions): Stats {
  return useMemo(() => {
    const total = items.length;
    const finished = items.filter(
      (item) =>
        item[columnNames.STOCK_STATUS] === "Empty" ||
        item[columnNames.STOCK_STATUS] === "Finished",
    ).length;
    const half = items.filter(
      (item) => item[columnNames.STOCK_STATUS] === "Half",
    ).length;
    const full = items.filter(
      (item) => item[columnNames.STOCK_STATUS] === "Full",
    ).length;

    return { total, finished, half, full };
  }, [items, columnNames]);
}

export function usePriorityItems({ items, columnNames }: UseStatsOptions) {
  return useMemo(() => {
    const immediate = items.filter(
      (item) =>
        item[columnNames.STOCK_STATUS] === "Empty" ||
        item[columnNames.STOCK_STATUS] === "Finished",
    );
    const later = items.filter(
      (item) => item[columnNames.STOCK_STATUS] === "Half",
    );
    return { immediate, later };
  }, [items, columnNames]);
}
