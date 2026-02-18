import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/common";
import { useCart } from "@/context";
import type { InventoryItem, ColumnConfig } from "@/types";
import "./InventoryCard.css";

interface InventoryCardProps {
  item: InventoryItem;
  columnNames: ColumnConfig;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAddToCart: (item: InventoryItem) => void;
  index: number;
}

export function InventoryCard({
  item,
  columnNames,
  onEdit,
  onDelete,
  onAddToCart,
  index,
}: InventoryCardProps) {
  const { isInCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchOffset, setTouchOffset] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
  const isVerticalSwipeRef = useRef(false);
  const shouldHandleClickRef = useRef(true);

  const status = (item[columnNames.STOCK_STATUS] || "Unknown") as string;
  const statusClass =
    status === "Empty" ? "finished" : status.toLowerCase().replace(" ", "-");
  const lastUpdated = item[columnNames.LAST_UPDATED]
    ? new Date(item[columnNames.LAST_UPDATED] as string).toLocaleDateString()
    : "Never";
  const itemName = (item[columnNames.ITEM_NAME] || "N/A") as string;
  const isItemInCart = isInCart(itemName);
  const notes = (item[columnNames.NOTES] as string) || "";
  const isAlternate = index % 2 === 1;

  // Determine drag direction based on touch offset
  const dragDirection =
    touchOffset > 0 ? "right" : touchOffset < 0 ? "left" : null;
  const isDragging = touchOffset !== 0;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = false;
    isVerticalSwipeRef.current = false;
    shouldHandleClickRef.current = true; // Assume tap until proven otherwise
    setTouchOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null)
      return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = Math.abs(touchStartYRef.current - currentY);

    // Determine if this is a vertical scroll (should not be intercepted)
    if (diffY > 15 && diffY > Math.abs(diffX)) {
      isVerticalSwipeRef.current = true;
      shouldHandleClickRef.current = false;
      return; // Don't prevent default, allow scrolling
    }

    // Only consider it a horizontal swipe if horizontal movement is greater than vertical
    if (Math.abs(diffX) > 15 && diffY < 15) {
      isSwipingRef.current = true;
      shouldHandleClickRef.current = false;
    }

    if (isSwipingRef.current) {
      // Limit the swipe distance to 80px (width of action area)
      const limitedDiff = Math.max(-80, Math.min(80, diffX));
      setTouchOffset(limitedDiff);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return;

    const diffX = touchOffset;

    // Reset
    setTouchOffset(0);

    // Check if it's a swipe to the right (positive diffX)
    if (diffX > 60) {
      // Swipe right detected - add to cart
      onAddToCart(item);
      shouldHandleClickRef.current = false;
    }
    // Check if it's a swipe to the left (negative diffX)
    else if (diffX < -60) {
      // Swipe left detected - delete item
      onDelete(item);
      shouldHandleClickRef.current = false;
    }

    // Reset touch tracking
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isSwipingRef.current = false;
  };

  // Handle click for card - opens edit dialog on tap/click
  const handleCardClick = () => {
    // Only handle click if it was a tap (not a swipe or scroll)
    if (!shouldHandleClickRef.current) {
      shouldHandleClickRef.current = true; // Reset for next time
      return;
    }

    shouldHandleClickRef.current = true; // Reset for next time

    // It's a tap - open edit dialog
    onEdit(item);
  };

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(item);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(item);
  };

  const handleAddToCart = () => {
    setMenuOpen(false);
    onAddToCart(item);
  };

  return (
    <div className="swipe-card-container">
      {/* Wrapper for swipe actions to clip them properly */}
      <div className="swipe-actions-wrapper">
        {/* Left action (Add to Cart) - revealed when swiping right */}
        <div
          className={`swipe-action swipe-action-left ${dragDirection === "right" ? "visible" : ""}`}
        >
          <i className="fas fa-cart-plus"></i>
        </div>

        {/* Right action (Delete) - revealed when swiping left */}
        <div
          className={`swipe-action swipe-action-right ${dragDirection === "left" ? "visible" : ""}`}
        >
          <i className="fas fa-trash-alt"></i>
        </div>
      </div>

      {/* Main card content */}
      <div
        ref={menuRef}
        className={`item-card ${isAlternate ? "item-card-alt" : ""} ${isDragging ? "dragging" : ""} ${menuOpen ? "menu-open" : ""}`}
        onClick={handleCardClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ transform: `translateX(${touchOffset}px)` }}
      >
        <div className="card-main">
          <div className="card-info">
            <div className="card-title-line">
              <h3 className="card-title">{itemName}</h3>
              <span className={`status-badge ${statusClass}`}>{status}</span>
            </div>
            <div className="card-meta">
              <span className="card-category">
                {item[columnNames.CATEGORY] || "Uncategorized"}
              </span>
              <span className="card-dot">•</span>
              <span className="card-quantity">
                {item[columnNames.QUANTITY] || 0} {item[columnNames.UNIT] || ""}
              </span>
            </div>
          </div>
          <div className="card-menu">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              title="Actions"
            >
              <i className="fas fa-ellipsis-v"></i>
            </Button>
            {menuOpen && (
              <div className="card-menu-dropdown">
                <button
                  className="menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
                  <i className="fas fa-edit"></i>
                  <span>Edit</span>
                </button>
                <button
                  className="menu-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                >
                  <i
                    className={
                      isItemInCart ? "fas fa-check" : "fas fa-cart-plus"
                    }
                  ></i>
                  <span>
                    {isItemInCart ? "Remove from Cart" : "Add to Cart"}
                  </span>
                </button>
                <button
                  className="menu-item menu-item-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <i className="fas fa-trash-alt"></i>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card-footer">
          <span className="card-updated">{lastUpdated}</span>
          {isItemInCart && (
            <div className="cart-indicator">
              <i className="fas fa-shopping-cart"></i>
              <span>In Cart</span>
            </div>
          )}
        </div>

        {notes && (
          <div className="card-notes">
            <p>{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
