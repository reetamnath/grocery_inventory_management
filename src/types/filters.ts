export interface FilterState {
  category: string;
  status: string;
  search: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface ActiveFilter {
  type: "category" | "status" | "search";
  label: string;
  value: string;
}
