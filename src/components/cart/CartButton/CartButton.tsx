import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context";
import { CartDropdown } from "../CartDropdown";
import "./CartButton.css";

export function CartButton() {
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleCart = () => setIsOpen((prev) => !prev);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  // Close cart on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div className="cart-container" ref={containerRef}>
      <button
        className="btn btn-icon cart-btn"
        onClick={toggleCart}
        title="Shopping Cart"
      >
        <i className="fas fa-shopping-cart"></i>
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </button>
      {isOpen && <CartDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
}
