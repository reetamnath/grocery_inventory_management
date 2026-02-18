export const API_ACTIONS = {
  GET_DATA: "getData",
  GET_DROPDOWNS: "getDropdowns",
  GET_CONFIG: "getConfig",
  ADD_ITEM: "addItem",
  UPDATE_ITEM: "updateItem",
  DELETE_ITEM: "deleteItem",
  SET_CONFIG: "setConfig",
} as const;

export type ApiAction = (typeof API_ACTIONS)[keyof typeof API_ACTIONS];

export function buildUrl(scriptUrl: string, action: ApiAction): string {
  return `${scriptUrl}?action=${action}`;
}
