import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem, CartAction } from "@/types";
import { loadCart, saveCart } from "@/services/storage/localStorage";
import { useToast } from "@/components/common/Toast";

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "timestamp">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  getItem: (id: string) => CartItem | undefined;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (existingIndex >= 0) {
        // Item already exists, remove it (toggle behavior)
        return state.filter((item) => item.id !== action.payload.id);
      }
      return [...state, action.payload];
    }
    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);
    case "UPDATE_QUANTITY":
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item,
      );
    case "CLEAR_CART":
      return [];
    case "LOAD_CART":
      return action.payload;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const { showToast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = loadCart<CartItem>();
    if (savedCart.length > 0) {
      dispatch({ type: "LOAD_CART", payload: savedCart });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "timestamp">) => {
      const existingItem = items.find((i) => i.id === item.id);
      const timestamp = Date.now();
      dispatch({ type: "ADD_ITEM", payload: { ...item, timestamp } });

      if (existingItem) {
        showToast(`${item.name} removed from cart`, "success");
      } else {
        showToast(`${item.name} added to cart`, "success");
      }
    },
    [items, showToast],
  );

  const removeItem = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_ITEM", payload: id });
    },
    [dispatch],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        dispatch({ type: "REMOVE_ITEM", payload: id });
      } else {
        dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
      }
    },
    [dispatch],
  );

  const clearCart = useCallback(() => {
    if (items.length === 0) return;
    dispatch({ type: "CLEAR_CART" });
    showToast("Cart cleared", "success");
  }, [items.length, showToast]);

  const isInCart = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  const getItem = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  );

  const totalItems = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItem,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
