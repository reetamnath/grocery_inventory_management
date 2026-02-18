import { TableRow } from "../TableRow";
import type { InventoryItem, ColumnConfig } from "@/types";
import "./InventoryTable.css";

interface InventoryTableProps {
  items: InventoryItem[];
  columnNames: ColumnConfig;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAddToCart: (item: InventoryItem) => void;
}

export function InventoryTable({
  items,
  columnNames,
  onEdit,
  onDelete,
  onAddToCart,
}: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Stock Status</th>
              <th>Last Updated</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="no-results">
                <i className="fas fa-search"></i>
                <p>No items match your filters</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Stock Status</th>
            <th>Last Updated</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <TableRow
              key={item._rowIndex}
              item={item}
              columnNames={columnNames}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddToCart={onAddToCart}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
