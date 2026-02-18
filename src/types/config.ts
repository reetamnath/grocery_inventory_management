export interface ColumnConfig {
  ITEM_NAME: string;
  CATEGORY: string;
  STOCK_STATUS: string;
  QUANTITY: string;
  UNIT: string;
  LAST_UPDATED: string;
  NOTES: string;
}

export interface GoogleScriptConfig {
  SHEET_NAME: string;
  COLUMNS: ColumnConfig;
  DEFAULT_CATEGORIES: string[];
  DEFAULT_UNITS: string[];
  DEFAULT_STOCK_STATUSES: string[];
}

export interface AppConfig {
  scriptUrl: string;
}

export interface DropdownData {
  categories: string[];
  units: string[];
  stockStatuses: string[];
  config?: {
    COLUMNS?: ColumnConfig;
  };
}
