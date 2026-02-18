import { useState, useCallback, useMemo } from "react";
import type { FilterState, ActiveFilter } from "@/types";
import type { InventoryItem } from "@/types";
import type { ColumnConfig } from "@/types";

interface UseFiltersOptions {
  items: InventoryItem[];
  columnNames: ColumnConfig;
}

interface UseFiltersReturn {
  filters: FilterState;
  setCategory: (category: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  clearFilter: (type: "category" | "status" | "search") => void;
  filteredItems: InventoryItem[];
  activeFilters: ActiveFilter[];
  hasActiveFilters: boolean;
}

export function useFilters({
  items,
  columnNames,
}: UseFiltersOptions): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    status: "",
    search: "",
  });

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search.toLowerCase() }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ category: "", status: "", search: "" });
  }, []);

  const clearFilter = useCallback((type: "category" | "status" | "search") => {
    setFilters((prev) => ({ ...prev, [type]: "" }));
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        !filters.category || item[columnNames.CATEGORY] === filters.category;
      const matchesStatus =
        !filters.status || item[columnNames.STOCK_STATUS] === filters.status;
      const matchesSearch =
        !filters.search ||
        String(item[columnNames.ITEM_NAME] || "")
          .toLowerCase()
          .includes(filters.search) ||
        String(item[columnNames.CATEGORY] || "")
          .toLowerCase()
          .includes(filters.search) ||
        String(item[columnNames.NOTES] || "")
          .toLowerCase()
          .includes(filters.search);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [items, filters, columnNames]);

  const activeFilters = useMemo(() => {
    const result: ActiveFilter[] = [];
    if (filters.search) {
      result.push({
        type: "search",
        label: `Search: "${filters.search}"`,
        value: filters.search,
      });
    }
    if (filters.category) {
      result.push({
        type: "category",
        label: `Category: ${filters.category}`,
        value: filters.category,
      });
    }
    if (filters.status) {
      result.push({
        type: "status",
        label: `Status: ${filters.status}`,
        value: filters.status,
      });
    }
    return result;
  }, [filters]);

  const hasActiveFilters = activeFilters.length > 0;

  return {
    filters,
    setCategory,
    setStatus,
    setSearch,
    clearFilters,
    clearFilter,
    filteredItems,
    activeFilters,
    hasActiveFilters,
  };
}
