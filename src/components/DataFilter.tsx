import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface DataFilterProps {
  columns: string[];
  onSearchChange: (search: string) => void;
  onFilterChange: (column: string, values: string[]) => void; // Updated to string[] from string
  onClearFilters: () => void;
  searchValue: string;
  filters: Record<string, string[]>; // Updated to string[] from string
}
const DataFilter: React.FC<DataFilterProps> = ({
  columns,
  onSearchChange,
  onFilterChange,
  onClearFilters,
  searchValue,
  filters
}) => {
  const [selectedColumn, setSelectedColumn] = React.useState<string>("");
  const [filterValue, setFilterValue] = React.useState<string>("");
  const handleFilterApply = () => {
    if (selectedColumn && filterValue) {
      // Update to pass an array containing the single value
      onFilterChange(selectedColumn, [filterValue]);
      setFilterValue(""); // Reset filter value after applying
    }
  };
  const activeFiltersCount = Object.keys(filters).length;
  return;
};
export default DataFilter;