import { useCart } from "@/context";
import type { CartItem as CartItemType } from "@/types";
import "./CartItem.css";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    updateQuantity(item.id, Math.max(1, value));
  };

  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-meta">{item.category}</div>
      </div>
      <div className="cart-item-actions">
        <div className="cart-qty-control">
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
            -
          </button>
          <input
            type="number"
            value={item.quantity}
            min={1}
            onChange={handleQuantityChange}
          />
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            +
          </button>
        </div>
        <button
          className="cart-item-remove"
          onClick={() => removeItem(item.id)}
          title="Remove"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  );
}
