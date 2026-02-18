const CART_STORAGE_KEY = "groceryCart";
const CONFIG_STORAGE_KEY = "scriptUrl";

export function loadCart<T>(): T[] {
  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as T[];
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
      return [];
    }
  }
  return [];
}

export function saveCart<T>(cart: T[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Error saving cart to localStorage:", e);
  }
}

export function loadScriptUrl(): string {
  return localStorage.getItem(CONFIG_STORAGE_KEY) || "";
}

export function saveScriptUrl(url: string): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, url);
  } catch (e) {
    console.error("Error saving URL to localStorage:", e);
  }
}
