export type StockStatus = "Full" | "Half" | "Empty" | "Finished";

export interface InventoryItem {
  _rowIndex: number;
  "Item Name": string;
  Category?: string;
  "Stock Status": StockStatus;
  Quantity?: number;
  Unit?: string;
  "Last Updated"?: string;
  Notes?: string;
  [key: string]: string | number | undefined;
}

export interface ItemFormData {
  name: string;
  category: string;
  status: StockStatus | "";
  quantity: number;
  unit: string;
  notes: string;
}

export interface ColumnNames {
  ITEM_NAME: string;
  CATEGORY: string;
  STOCK_STATUS: string;
  QUANTITY: string;
  UNIT: string;
  LAST_UPDATED: string;
  NOTES: string;
}
