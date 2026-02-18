import { useState, useEffect } from "react";
import { Modal, Button } from "@/components/common";
import { useInventory } from "@/context";
import type { InventoryItem, ItemFormData, StockStatus } from "@/types";
import "./ItemModal.css";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

const INITIAL_FORM_DATA: ItemFormData = {
  name: "",
  category: "",
  status: "",
  quantity: 0,
  unit: "",
  notes: "",
};

export function ItemModal({ isOpen, onClose, item }: ItemModalProps) {
  const {
    categories,
    stockStatuses,
    units,
    addInventoryItem,
    updateInventoryItem,
    columnNames,
  } = useInventory();
  const [formData, setFormData] = useState<ItemFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(item);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          name: (item[columnNames.ITEM_NAME] || "") as string,
          category: (item[columnNames.CATEGORY] || "") as string,
          status: (item[columnNames.STOCK_STATUS] || "") as StockStatus,
          quantity: Number(item[columnNames.QUANTITY] || 0),
          unit: (item[columnNames.UNIT] || "") as string,
          notes: (item[columnNames.NOTES] || "") as string,
        });
      } else {
        setFormData(INITIAL_FORM_DATA);
      }
      setErrors({});
    }
  }, [isOpen, item, columnNames]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseFloat(value) || 0 : value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }
    if (!formData.status) {
      newErrors.status = "Stock status is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let success: boolean;
    if (isEdit && item) {
      success = await updateInventoryItem(item._rowIndex, formData);
    } else {
      success = await addInventoryItem(formData);
    }

    if (success) {
      onClose();
    }
  };

  const footer = (
    <>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit}>
        <i className="fas fa-save"></i> Save Item
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <i className={isEdit ? "fas fa-edit" : "fas fa-plus"}></i>{" "}
          {isEdit ? "Edit Item" : "Add New Item"}
        </>
      }
      footer={footer}
    >
      <form id="item-form" onSubmit={handleSubmit}>
        <div className={`form-group ${errors.name ? "error" : ""}`}>
          <label>
            Item Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Basmati Rice"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className={`form-group ${errors.status ? "error" : ""}`}>
            <label>
              Stock Status <span className="required">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">Select Status</option>
              {stockStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status && (
              <span className="error-message">{errors.status}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity || ""}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <select name="unit" value={formData.unit} onChange={handleChange}>
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes..."
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
