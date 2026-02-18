import { Modal, Button } from "@/components/common";
import { useInventory } from "@/context";
import type { InventoryItem } from "@/types";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export function DeleteModal({ isOpen, onClose, item }: DeleteModalProps) {
  const { deleteInventoryItem, columnNames } = useInventory();

  const handleConfirm = async () => {
    if (!item) return;
    const success = await deleteInventoryItem(item._rowIndex);
    if (success) {
      onClose();
    }
  };

  const itemName = item
    ? (item[columnNames.ITEM_NAME] as string) || "this item"
    : "";

  const footer = (
    <>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={handleConfirm}>
        <i className="fas fa-trash-alt"></i> Delete
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <i className="fas fa-exclamation-triangle"></i> Confirm Delete
        </>
      }
      footer={footer}
      size="small"
    >
      <p>
        Are you sure you want to delete <strong>{itemName}</strong>?
      </p>
      <p
        style={{
          color: "var(--text-light)",
          fontSize: "12px",
          marginTop: "10px",
        }}
      >
        This action cannot be undone.
      </p>
    </Modal>
  );
}
