import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  InventoryItem,
  ItemFormData,
  StockStatus,
  ColumnConfig,
  ItemData,
} from "@/types";
import {
  fetchInventory,
  addItem,
  updateItem,
  deleteItem,
  ApiError,
} from "@/services/api/googleSheets";
import { useConfig } from "./ConfigContext";
import { useToast } from "@/components/common/Toast";

interface InventoryContextType {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  categories: string[];
  units: string[];
  stockStatuses: string[];
  columnNames: ColumnConfig;
  refreshData: () => Promise<void>;
  addInventoryItem: (item: ItemFormData) => Promise<boolean>;
  updateInventoryItem: (
    rowIndex: number,
    item: ItemFormData,
  ) => Promise<boolean>;
  deleteInventoryItem: (rowIndex: number) => Promise<boolean>;
  getItemByRowIndex: (rowIndex: number) => InventoryItem | undefined;
}

const defaultColumnNames: ColumnConfig = {
  ITEM_NAME: "Item Name",
  CATEGORY: "Category",
  STOCK_STATUS: "Stock Status",
  QUANTITY: "Quantity",
  UNIT: "Unit",
  LAST_UPDATED: "Last Updated",
  NOTES: "Notes",
};

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

const DEFAULT_CATEGORIES = [
  "Rice",
  "Lentils",
  "Dairy",
  "Nuts",
  "Vegetables",
  "Fruits",
  "Spices",
  "Other",
];
const DEFAULT_UNITS = [
  "kg",
  "g",
  "liter",
  "ml",
  "pieces",
  "packs",
  "bottles",
  "cans",
];
const DEFAULT_STOCK_STATUSES: StockStatus[] = ["Full", "Half", "Empty"];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { scriptUrl } = useConfig();
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [stockStatuses, setStockStatuses] = useState<string[]>([]);
  const [columnNames, setColumnNames] =
    useState<ColumnConfig>(defaultColumnNames);

  const refreshData = useCallback(async () => {
    if (!scriptUrl) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchInventory(scriptUrl);
      setItems(result.items);

      // Fetch dropdowns separately to get categories, units, statuses
      const { fetchDropdowns } = await import("@/services/api/googleSheets");
      const dropdowns = await fetchDropdowns(scriptUrl);

      if (dropdowns) {
        setCategories(dropdowns.categories || DEFAULT_CATEGORIES);
        setUnits(dropdowns.units || DEFAULT_UNITS);
        setStockStatuses(
          (dropdowns.stockStatuses || DEFAULT_STOCK_STATUSES).map((s) =>
            String(s),
          ),
        );

        const configColumns = dropdowns.config?.COLUMNS || result.columnConfig;

        if (configColumns) {
          setColumnNames((prev) => ({
            ...prev,
            ...configColumns,
          }));
        }
      }

      showToast("Data loaded successfully", "success");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load data";
      setError(message);
      showToast(`Error: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [scriptUrl, showToast]);

  const addInventoryItem = useCallback(
    async (item: ItemFormData): Promise<boolean> => {
      if (!scriptUrl) return false;

      setLoading(true);
      try {
        // Check for duplicate
        const normalizedName = item.name.toLowerCase();
        const duplicate = items.find(
          (i) =>
            String(i[columnNames.ITEM_NAME] || "").toLowerCase() ===
            normalizedName,
        );
        if (duplicate) {
          showToast(
            `Item "${item.name}" already exists. Please use a different name.`,
            "error",
          );
          return false;
        }

        const itemData = {
          [columnNames.ITEM_NAME]: item.name,
          [columnNames.CATEGORY]: item.category,
          [columnNames.STOCK_STATUS]: item.status,
          [columnNames.QUANTITY]: item.quantity || 0,
          [columnNames.UNIT]: item.unit,
          [columnNames.NOTES]: item.notes,
        } as ItemData;

        await addItem(scriptUrl, itemData);
        showToast("Item added successfully", "success");
        await refreshData();
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to add item";
        showToast(`Error: ${message}`, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [items, columnNames, scriptUrl, refreshData, showToast],
  );

  const updateInventoryItem = useCallback(
    async (rowIndex: number, item: ItemFormData): Promise<boolean> => {
      if (!scriptUrl) return false;

      setLoading(true);
      try {
        // Check for duplicate (excluding current item)
        const normalizedName = item.name.toLowerCase();
        const duplicate = items.find(
          (i) =>
            i._rowIndex !== rowIndex &&
            String(i[columnNames.ITEM_NAME] || "").toLowerCase() ===
              normalizedName,
        );
        if (duplicate) {
          showToast(
            `Item "${item.name}" already exists. Please use a different name.`,
            "error",
          );
          return false;
        }

        const itemData = {
          [columnNames.ITEM_NAME]: item.name,
          [columnNames.CATEGORY]: item.category,
          [columnNames.STOCK_STATUS]: item.status,
          [columnNames.QUANTITY]: item.quantity || 0,
          [columnNames.UNIT]: item.unit,
          [columnNames.NOTES]: item.notes,
          _rowIndex: rowIndex,
        } as ItemData;

        await updateItem(scriptUrl, itemData);
        showToast("Item updated successfully", "success");
        await refreshData();
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to update item";
        showToast(`Error: ${message}`, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [items, columnNames, scriptUrl, refreshData, showToast],
  );

  const deleteInventoryItem = useCallback(
    async (rowIndex: number): Promise<boolean> => {
      if (!scriptUrl) return false;

      setLoading(true);
      try {
        await deleteItem(scriptUrl, rowIndex);
        showToast("Item deleted successfully", "success");
        await refreshData();
        return true;
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Failed to delete item";
        showToast(`Error: ${message}`, "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [scriptUrl, refreshData, showToast],
  );

  const getItemByRowIndex = useCallback(
    (rowIndex: number) => items.find((i) => i._rowIndex === rowIndex),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      error,
      categories,
      units,
      stockStatuses,
      columnNames,
      refreshData,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      getItemByRowIndex,
    }),
    [
      items,
      loading,
      error,
      categories,
      units,
      stockStatuses,
      columnNames,
      refreshData,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      getItemByRowIndex,
    ],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
