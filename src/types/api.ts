import type { InventoryItem } from "./inventory";

export interface ApiResponse<T = unknown> {
  success?: boolean;
  items?: T;
  message?: string;
  error?: string;
  config?: {
    COLUMNS?: Record<string, string>;
  };
}

export interface GetDataResponse {
  items: InventoryItem[];
  headers: string[];
  config?: {
    COLUMNS?: Record<string, string>;
  };
}

export interface ItemData {
  "Item Name": string;
  Category?: string;
  "Stock Status"?: string;
  Quantity?: string | number;
  Unit?: string;
  Notes?: string;
  _rowIndex?: number;
  [key: string]: string | number | undefined;
}

export type ApiAction =
  | "getData"
  | "getDropdowns"
  | "getConfig"
  | "addItem"
  | "updateItem"
  | "deleteItem"
  | "setConfig";
