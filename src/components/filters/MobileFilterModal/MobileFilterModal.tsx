import { Modal } from "@/components/common";
import {
  SearchInput,
  CategoryFilter,
  StatusFilter,
} from "@/components/filters";
import type { FilterState } from "@/types";
import "./MobileFilterModal.css";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setCategory: (category: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  categories: string[];
  statuses: string[];
  filteredItemsCount: number;
}

export function MobileFilterModal({
  isOpen,
  onClose,
  filters,
  setCategory,
  setStatus,
  setSearch,
  clearFilters,
  categories,
  statuses,
  filteredItemsCount,
}: MobileFilterModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Items" size="small">
      <div className="mobile-filter-content">
        <div className="mobile-filter-section">
          <h4 className="mobile-filter-label">
            <i className="fas fa-search"></i> Search
          </h4>
          <SearchInput value={filters.search} onChange={setSearch} />
        </div>

        <div className="mobile-filter-section">
          <h4 className="mobile-filter-label">
            <i className="fas fa-tags"></i> Category
          </h4>
          <CategoryFilter
            categories={categories}
            value={filters.category}
            onChange={setCategory}
          />
        </div>

        <div className="mobile-filter-section">
          <h4 className="mobile-filter-label">
            <i className="fas fa-box"></i> Stock Status
          </h4>
          <StatusFilter
            statuses={statuses}
            value={filters.status}
            onChange={setStatus}
          />
        </div>

        <div className="mobile-filter-footer">
          <div className="mobile-filter-count">
            {filteredItemsCount} items shown
          </div>
          <div className="mobile-filter-actions">
            <button className="btn btn-secondary" onClick={clearFilters}>
              <i className="fas fa-times"></i> Clear All
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              <i className="fas fa-check"></i> Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
