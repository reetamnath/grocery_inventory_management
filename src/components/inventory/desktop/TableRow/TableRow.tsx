import { Button } from "@/components/common";
import { useCart } from "@/context";
import type { InventoryItem, ColumnConfig } from "@/types";
import "./TableRow.css";

interface TableRowProps {
  item: InventoryItem;
  columnNames: ColumnConfig;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAddToCart: (item: InventoryItem) => void;
}

export function TableRow({
  item,
  columnNames,
  onEdit,
  onDelete,
  onAddToCart,
}: TableRowProps) {
  const { isInCart } = useCart();

  const status = (item[columnNames.STOCK_STATUS] || "Unknown") as string;
  const statusClass =
    status === "Empty" ? "finished" : status.toLowerCase().replace(" ", "-");
  const lastUpdated = item[columnNames.LAST_UPDATED]
    ? new Date(item[columnNames.LAST_UPDATED] as string).toLocaleDateString()
    : "Never";
  const itemName = (item[columnNames.ITEM_NAME] || "N/A") as string;
  const isItemInCart = isInCart(itemName);

  return (
    <tr>
      <td>
        <strong>{itemName}</strong>
      </td>
      <td>
        {item[columnNames.CATEGORY] ? (
          <span className="category-tag">
            {String(item[columnNames.CATEGORY])}
          </span>
        ) : (
          "-"
        )}
      </td>
      <td>
        {item[columnNames.QUANTITY] || 0} {item[columnNames.UNIT] || ""}
      </td>
      <td>
        <span className={`status-badge ${statusClass}`}>{status}</span>
      </td>
      <td>{lastUpdated}</td>
      <td>{(item[columnNames.NOTES] as string) || "-"}</td>
      <td>
        <div className="actions">
          <Button size="icon" onClick={() => onEdit(item)} title="Edit">
            <i className="fas fa-edit"></i>
          </Button>
          <Button
            variant={isItemInCart ? "cart-active" : "cart"}
            size="icon"
            onClick={() => onAddToCart(item)}
            title={isItemInCart ? "Remove from Cart" : "Add to Cart"}
          >
            <i
              className={isItemInCart ? "fas fa-check" : "fas fa-cart-plus"}
            ></i>
          </Button>
          <Button
            variant="danger"
            size="icon"
            onClick={() => onDelete(item)}
            title="Delete"
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
        </div>
      </td>
    </tr>
  );
}
