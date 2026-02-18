import { useStats } from "@/hooks";
import type { ColumnConfig } from "@/types";
import type { InventoryItem } from "@/types";
import "./StatsGrid.css";

interface StatsGridProps {
  items: InventoryItem[];
  columnNames: ColumnConfig;
}

interface StatCardProps {
  value: number;
  label: string;
  type: "total" | "finished" | "half" | "full";
}

function StatCard({ value, label, type }: StatCardProps) {
  return (
    <div className={`stat-card ${type}`}>
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );
}

export function StatsGrid({ items, columnNames }: StatsGridProps) {
  const stats = useStats({ items, columnNames });

  return (
    <div className="stats-grid">
      <StatCard value={stats.total} label="Total Items" type="total" />
      <StatCard value={stats.finished} label="Finished" type="finished" />
      <StatCard value={stats.half} label="Running Low" type="half" />
      <StatCard value={stats.full} label="Full Stock" type="full" />
    </div>
  );
}
