import { useCart } from "@/context";
import { CartItem } from "../CartItem";
import { Button } from "@/components/common";
import { useToast } from "@/components/common";
import "./CartDropdown.css";

interface CartDropdownProps {
  onClose: () => void;
}

export function CartDropdown({ onClose }: CartDropdownProps) {
  const { items, clearCart } = useCart();
  const { showToast } = useToast();

  const handleCopyToClipboard = async () => {
    if (items.length === 0) {
      showToast("Cart is empty", "error");
      return;
    }

    const date = new Date().toLocaleDateString();
    let text = `Shopping List (${date})\n`;
    text += "=".repeat(30) + "\n\n";

    items.forEach((item, index) => {
      text += `${index + 1}. ${item.name} - ${item.quantity} ${item.unit || "pcs"}\n`;
    });

    text += "\n" + "=".repeat(30);
    text += `\nTotal items: ${items.length}`;

    try {
      await navigator.clipboard.writeText(text);
      showToast("Shopping list copied to clipboard", "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    if (confirm("Are you sure you want to clear your shopping cart?")) {
      clearCart();
    }
  };

  return (
    <div className="cart-dropdown">
      <div className="cart-header">
        <h3>
          <i className="fas fa-shopping-cart"></i> Shopping Cart
        </h3>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="cart-items">
        {items.length === 0 ? (
          <div className="cart-empty">
            <i className="fas fa-shopping-basket"></i>
            <p>Your cart is empty</p>
          </div>
        ) : (
          items.map((item) => <CartItem key={item.id} item={item} />)
        )}
      </div>
      <div className="cart-footer">
        <Button
          size="sm"
          onClick={handleClearCart}
          disabled={items.length === 0}
        >
          <i className="fas fa-trash-alt"></i> Clear
        </Button>
        <Button variant="primary" size="sm" onClick={handleCopyToClipboard}>
          <i className="fas fa-copy"></i> Copy List
        </Button>
      </div>
    </div>
  );
}
