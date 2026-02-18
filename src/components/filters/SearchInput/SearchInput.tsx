import "./SearchInput.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className="filter-group">
      <label>Search</label>
      <input
        type="text"
        placeholder="Search by name or category..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
