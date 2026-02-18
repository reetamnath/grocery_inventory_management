import { Button } from "@/components/common";
import { CartButton } from "@/components/cart";
import "./Header.css";

interface HeaderProps {
  onOpenConfig: () => void;
  onOpenAddItem: () => void;
}

export function Header({ onOpenConfig, onOpenAddItem }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1>
            <i className="fas fa-shopping-basket"></i> Grocery Inventory
          </h1>
          <div className="header-actions">
            <CartButton />
            <Button
              variant="default"
              size="icon"
              onClick={onOpenConfig}
              title="Configuration"
            >
              <i className="fas fa-cog"></i>
            </Button>
            <Button
              variant="primary"
              size="icon"
              onClick={onOpenAddItem}
              title="Add Item"
            >
              <i className="fas fa-plus"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
