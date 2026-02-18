import type {
  ApiResponse,
  GetDataResponse,
  DropdownData,
  InventoryItem,
  ItemData,
} from "@/types";
import type { ColumnConfig } from "@/types";
import { API_ACTIONS, buildUrl } from "./endpoints";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchData(scriptUrl: string): Promise<GetDataResponse> {
  const response = await fetch(buildUrl(scriptUrl, API_ACTIONS.GET_DATA));
  const data: GetDataResponse = await response.json();

  const apiData = data as ApiResponse;
  if (apiData.error) {
    throw new ApiError(apiData.error);
  }

  return data;
}

export async function fetchDropdowns(scriptUrl: string): Promise<DropdownData> {
  const response = await fetch(buildUrl(scriptUrl, API_ACTIONS.GET_DROPDOWNS));
  const data: DropdownData = await response.json();

  return data;
}

export async function addItem(
  scriptUrl: string,
  itemData: ItemData,
): Promise<ApiResponse> {
  const response = await fetch(buildUrl(scriptUrl, API_ACTIONS.ADD_ITEM), {
    method: "POST",
    body: JSON.stringify(itemData),
  });
  const data: ApiResponse = await response.json();

  if (data.error) {
    throw new ApiError(data.error);
  }

  return data;
}

export async function updateItem(
  scriptUrl: string,
  itemData: ItemData,
): Promise<ApiResponse> {
  const response = await fetch(buildUrl(scriptUrl, API_ACTIONS.UPDATE_ITEM), {
    method: "POST",
    body: JSON.stringify(itemData),
  });
  const data: ApiResponse = await response.json();

  if (data.error) {
    throw new ApiError(data.error);
  }

  return data;
}

export async function deleteItem(
  scriptUrl: string,
  rowIndex: number,
): Promise<ApiResponse> {
  const response = await fetch(buildUrl(scriptUrl, API_ACTIONS.DELETE_ITEM), {
    method: "POST",
    body: JSON.stringify({ rowIndex }),
  });
  const data: ApiResponse = await response.json();

  if (data.error) {
    throw new ApiError(data.error);
  }

  return data;
}

export async function fetchInventory(
  scriptUrl: string,
): Promise<{ items: InventoryItem[]; columnConfig?: ColumnConfig }> {
  const [dropdownsResponse, dataResponse] = await Promise.all([
    fetchDropdowns(scriptUrl),
    fetchData(scriptUrl),
  ]);

  const columnConfig =
    (dropdownsResponse.config?.COLUMNS as unknown as ColumnConfig) ||
    (dataResponse.config?.COLUMNS as unknown as ColumnConfig) ||
    undefined;

  const items = dataResponse.items || [];

  return {
    items,
    columnConfig,
  };
}
