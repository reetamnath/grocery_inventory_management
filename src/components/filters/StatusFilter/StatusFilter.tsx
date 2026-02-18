import "./StatusFilter.css";

interface StatusFilterProps {
  statuses: string[];
  value: string;
  onChange: (value: string) => void;
}

export function StatusFilter({ statuses, value, onChange }: StatusFilterProps) {
  return (
    <div className="filter-group">
      <label>Stock Status</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All Status</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
