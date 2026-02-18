import { useState, useEffect, useCallback } from "react";
import { Header, StatsGrid } from "@/components/layout";
import { PrioritySection } from "@/components/priority";
import {
  FilterBar,
  SearchInput,
  CategoryFilter,
  StatusFilter,
  MobileFilterModal,
} from "@/components/filters";
import { InventoryTable, InventoryCards } from "@/components/inventory";
import { ItemModal, DeleteModal, ConfigModal } from "@/components/modals";
import { Button, LoadingOverlay } from "@/components/common";
import { useFilters, useResponsive } from "@/hooks";
import { useInventory, useConfig, useCart } from "@/context";
import type { InventoryItem } from "@/types";
import "./App.css";

// Dashboard Content Component
function DashboardContent({
  items,
  columnNames,
  hasItems,
}: {
  items: InventoryItem[];
  columnNames: any;
  hasItems: boolean;
}) {
  if (!hasItems) return null;

  return (
    <div className="dashboard-content">
      <div className="dashboard-section">
        <h2 className="dashboard-title">
          <i className="fas fa-chart-pie"></i> Overview
        </h2>
        <StatsGrid items={items} columnNames={columnNames} />
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-title">
          <i className="fas fa-shopping-basket"></i> Shopping Priorities
        </h2>
        <PrioritySection items={items} columnNames={columnNames} />
      </div>
    </div>
  );
}

// Mobile Tab Navigation Component
function MobileTabs({
  activeTab,
  onTabChange,
  dashboardCount,
}: {
  activeTab: "dashboard" | "inventory";
  onTabChange: (tab: "dashboard" | "inventory") => void;
  dashboardCount: number;
}) {
  return (
    <div className="mobile-tabs">
      <button
        className={`mobile-tab ${activeTab === "dashboard" ? "active" : ""}`}
        onClick={() => onTabChange("dashboard")}
      >
        <i className="fas fa-chart-pie"></i>
        <span>Dashboard</span>
        {dashboardCount > 0 && (
          <span className="tab-badge">{dashboardCount}</span>
        )}
      </button>
      <button
        className={`mobile-tab ${activeTab === "inventory" ? "active" : ""}`}
        onClick={() => onTabChange("inventory")}
      >
        <i className="fas fa-boxes"></i>
        <span>Inventory</span>
      </button>
    </div>
  );
}

function App() {
  const { isConfigured, scriptUrl } = useConfig();
  const {
    items,
    loading,
    columnNames,
    refreshData,
    categories,
    stockStatuses,
  } = useInventory();
  const {
    filters,
    setCategory,
    setStatus,
    setSearch,
    clearFilters,
    clearFilter,
    filteredItems,
    activeFilters,
    hasActiveFilters,
  } = useFilters({ items, columnNames });
  const { isMobile } = useResponsive();
  const { addItem } = useCart();

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [mobileTab, setMobileTab] = useState<"dashboard" | "inventory">(
    "dashboard",
  );
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Load data when scriptUrl is configured (only once)
  useEffect(() => {
    if (scriptUrl && !hasLoadedData) {
      setHasLoadedData(true);
      refreshData();
    }
  }, [scriptUrl]);

  const handleOpenAdd = useCallback(() => {
    setSelectedItem(null);
    setItemModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setItemModalOpen(true);
  }, []);

  const handleOpenDelete = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  }, []);

  const handleAddToCart = useCallback(
    (item: InventoryItem) => {
      const itemName = (item[columnNames.ITEM_NAME] || "") as string;
      if (!itemName) return;

      addItem({
        id: itemName,
        name: itemName,
        category: (item[columnNames.CATEGORY] || "Uncategorized") as string,
        quantity: 1,
        unit: (item[columnNames.UNIT] || "") as string,
      });
    },
    [columnNames, addItem],
  );

  return (
    <div className="app">
      <Header
        onOpenConfig={() => setConfigModalOpen(true)}
        onOpenAddItem={handleOpenAdd}
      />

      <main className="container">
        {!isConfigured ? (
          <div className="welcome-message">
            <i className="fas fa-cog"></i>
            <h2>Welcome to Grocery Inventory</h2>
            <p>Please configure your Google Apps Script URL to get started.</p>
            <Button variant="primary" onClick={() => setConfigModalOpen(true)}>
              <i className="fas fa-cog"></i> Configure
            </Button>
          </div>
        ) : (
          <div className="app-layout">
            {/* Desktop: Sidebar always visible */}
            {!isMobile && (
              <aside className="dashboard-sidebar">
                <DashboardContent
                  items={items}
                  columnNames={columnNames}
                  hasItems={items.length > 0}
                />
              </aside>
            )}

            {/* Mobile: Tab Navigation */}
            {isMobile && (
              <MobileTabs
                activeTab={mobileTab}
                onTabChange={setMobileTab}
                dashboardCount={0}
              />
            )}

            {/* Mobile Dashboard View */}
            {isMobile && mobileTab === "dashboard" && (
              <div className="mobile-dashboard-view">
                <DashboardContent
                  items={items}
                  columnNames={columnNames}
                  hasItems={items.length > 0}
                />
              </div>
            )}

            {/* Inventory Panel - Always visible on desktop, tab-controlled on mobile */}
            {(!isMobile || mobileTab === "inventory") && (
              <section className="inventory-panel">
                <div className="inventory-header">
                  <h2 className="inventory-title">
                    <i className="fas fa-boxes"></i> Inventory Items
                    <span className="inventory-count">
                      {filteredItems.length} items
                    </span>
                  </h2>
                  <div className="inventory-actions">
                    {/* Mobile filter button */}
                    {isMobile && (
                      <button
                        className={`filter-icon-btn ${hasActiveFilters ? "active" : ""}`}
                        onClick={() => setMobileFilterOpen(true)}
                        title="Filter items"
                      >
                        <i className="fas fa-filter"></i>
                      </button>
                    )}
                    <Button
                      onClick={refreshData}
                      disabled={loading}
                      size="sm"
                      className="refresh-btn"
                    >
                      <i className="fas fa-sync-alt"></i>
                      <span className="refresh-text">Refresh</span>
                    </Button>
                  </div>
                </div>

                {/* Desktop: Show inline FilterBar */}
                {!isMobile && (
                  <FilterBar
                    onClearFilters={clearFilters}
                    activeFilters={activeFilters}
                    onClearFilter={clearFilter}
                  >
                    <SearchInput value={filters.search} onChange={setSearch} />
                    <CategoryFilter
                      categories={categories}
                      value={filters.category}
                      onChange={setCategory}
                    />
                    <StatusFilter
                      statuses={stockStatuses}
                      value={filters.status}
                      onChange={setStatus}
                    />
                  </FilterBar>
                )}

                <div className="inventory-content">
                  {/* Desktop table view */}
                  {!isMobile && (
                    <InventoryTable
                      items={filteredItems}
                      columnNames={columnNames}
                      onEdit={handleOpenEdit}
                      onDelete={handleOpenDelete}
                      onAddToCart={handleAddToCart}
                    />
                  )}

                  {/* Mobile card view */}
                  {isMobile && (
                    <InventoryCards
                      items={filteredItems}
                      columnNames={columnNames}
                      onEdit={handleOpenEdit}
                      onDelete={handleOpenDelete}
                      onAddToCart={handleAddToCart}
                    />
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <ItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        item={selectedItem}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        item={selectedItem}
      />
      <ConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filters={filters}
        setCategory={setCategory}
        setStatus={setStatus}
        setSearch={setSearch}
        clearFilters={clearFilters}
        categories={categories}
        statuses={stockStatuses}
        filteredItemsCount={filteredItems.length}
      />

      {/* Loading overlay */}
      <LoadingOverlay isLoading={loading} />
    </div>
  );
}

export default App;
