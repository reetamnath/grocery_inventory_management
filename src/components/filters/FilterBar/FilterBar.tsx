import { Button } from "@/components/common";
import type { ActiveFilter } from "@/types";
import "./FilterBar.css";

interface FilterBarProps {
  children: React.ReactNode;
  onClearFilters: () => void;
  activeFilters: ActiveFilter[];
  onClearFilter: (type: "category" | "status" | "search") => void;
}

export function FilterBar({
  children,
  onClearFilters,
  activeFilters,
  onClearFilter,
}: FilterBarProps) {
  return (
    <div className="filters">
      <div className="filters-header">
        <h3>
          <i className="fas fa-filter"></i> Filter Items
        </h3>
        <Button size="sm" onClick={onClearFilters}>
          <i className="fas fa-times"></i> Clear All
        </Button>
      </div>
      <div className="filters-grid">{children}</div>
      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map((filter) => (
            <span key={filter.type} className="filter-tag">
              {filter.label}
              <button onClick={() => onClearFilter(filter.type)}>
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
