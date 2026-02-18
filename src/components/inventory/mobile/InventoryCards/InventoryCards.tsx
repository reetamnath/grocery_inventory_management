import { InventoryCard } from "../InventoryCard";
import type { InventoryItem, ColumnConfig } from "@/types";
import "./InventoryCards.css";

interface InventoryCardsProps {
  items: InventoryItem[];
  columnNames: ColumnConfig;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAddToCart: (item: InventoryItem) => void;
}

export function InventoryCards({
  items,
  columnNames,
  onEdit,
  onDelete,
  onAddToCart,
}: InventoryCardsProps) {
  if (items.length === 0) {
    return (
      <div className="cards-container">
        <div className="empty-state">
          <i className="fas fa-search"></i>
          <p>No items match your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cards-container">
      {items.map((item, index) => (
        <InventoryCard
          key={item._rowIndex}
          item={item}
          columnNames={columnNames}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCart={onAddToCart}
          index={index}
        />
      ))}
    </div>
  );
}
