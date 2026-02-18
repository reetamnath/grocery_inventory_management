import { useCart } from "@/context";
import { usePriorityItems } from "@/hooks";
import type { InventoryItem, ColumnConfig } from "@/types";
import { Button } from "@/components/common";
import "./PrioritySection.css";

interface PriorityListItemProps {
  item: InventoryItem;
  columnNames: ColumnConfig;
}

function PriorityListItem({ item, columnNames }: PriorityListItemProps) {
  const { addItem, isInCart, removeItem } = useCart();
  const itemName = (item[columnNames.ITEM_NAME] || "N/A") as string;
  const isItemInCart = isInCart(itemName);

  const handleCartToggle = () => {
    if (isItemInCart) {
      removeItem(itemName);
    } else {
      addItem({
        id: itemName,
        name: itemName,
        category: (item[columnNames.CATEGORY] || "Uncategorized") as string,
        quantity: 1,
        unit: (item[columnNames.UNIT] || "") as string,
      });
    }
  };

  return (
    <div className="priority-item">
      <div>
        <div className="priority-item-name">{itemName}</div>
        <div className="priority-item-meta">
          {(item[columnNames.CATEGORY] as string) || "Uncategorized"}
        </div>
      </div>
      <div className="priority-item-cart">
        <div>
          {item[columnNames.QUANTITY] || 0} {item[columnNames.UNIT] || ""}
        </div>
        <Button
          variant={isItemInCart ? "cart-active" : "cart"}
          size="sm"
          onClick={handleCartToggle}
          title={isItemInCart ? "Remove from Cart" : "Add to Cart"}
        >
          <i className={isItemInCart ? "fas fa-minus" : "fas fa-cart-plus"}></i>
          <span className="btn-text">{isItemInCart ? "Remove" : "Add"}</span>
        </Button>
      </div>
    </div>
  );
}

interface PrioritySectionProps {
  items: InventoryItem[];
  columnNames: ColumnConfig;
}

export function PrioritySection({ items, columnNames }: PrioritySectionProps) {
  const { immediate, later } = usePriorityItems({ items, columnNames });

  return (
    <div className="priority-sections">
      {/* Immediate Buy */}
      <div className="priority-card">
        <div className="priority-header immediate">
          <h2>
            <i className="fas fa-shopping-cart"></i> Immediate Buy
          </h2>
          <span className="badge">{immediate.length}</span>
        </div>
        <div className="priority-list">
          {immediate.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-check-circle"></i>
              <p>No items need immediate purchase!</p>
            </div>
          ) : (
            immediate.map((item) => (
              <PriorityListItem
                key={item._rowIndex}
                item={item}
                columnNames={columnNames}
              />
            ))
          )}
        </div>
      </div>

      {/* Some Week Later */}
      <div className="priority-card">
        <div className="priority-header later">
          <h2>
            <i className="fas fa-calendar-week"></i> Some Week Later
          </h2>
          <span className="badge">{later.length}</span>
        </div>
        <div className="priority-list">
          {later.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open"></i>
              <p>No items running low yet!</p>
            </div>
          ) : (
            later.map((item) => (
              <PriorityListItem
                key={item._rowIndex}
                item={item}
                columnNames={columnNames}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
