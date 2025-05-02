
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DataFilterProps {
  columns: string[];
  onSearchChange: (search: string) => void;
  onFilterChange: (column: string, value: string) => void;
  onClearFilters: () => void;
  searchValue: string;
  filters: Record<string, string>;
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
      onFilterChange(selectedColumn, filterValue);
      setFilterValue(""); // Reset filter value after applying
    }
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="flex flex-col gap-4 w-full pb-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search all columns..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-full"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Filter Data</h4>
              <div className="grid gap-2">
                <Select 
                  value={selectedColumn} 
                  onValueChange={setSelectedColumn}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>{column}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter value..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={onClearFilters} disabled={activeFiltersCount === 0}>
                    Clear All
                  </Button>
                  <Button size="sm" onClick={handleFilterApply} disabled={!selectedColumn || !filterValue}>
                    Apply Filter
                  </Button>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="border-t pt-2 mt-2">
                  <h4 className="font-medium text-sm mb-2">Active Filters:</h4>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(filters).map(([column, value]) => (
                      <div key={column} className="bg-muted text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <span>
                          <strong>{column}:</strong> {value}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => onFilterChange(column, "")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};

export default DataFilter;
