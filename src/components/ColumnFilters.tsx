
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnFiltersProps {
  columns: string[];
  filters: Record<string, string>;
  onFilterChange: (column: string, value: string) => void;
}

const ColumnFilters: React.FC<ColumnFiltersProps> = ({
  columns,
  filters,
  onFilterChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 mt-4">
      {columns.map((column) => (
        <div key={column} className="relative">
          <Label htmlFor={`filter-${column}`} className="text-sm font-medium mb-1 block">
            {column}
          </Label>
          <div className="relative">
            <Input
              id={`filter-${column}`}
              placeholder={`is any value`}
              className="w-full pr-8 border-[#0072ce]/30 focus:border-[#0072ce] focus-visible:ring-[#0072ce]/20"
              value={filters[column] || ''}
              onChange={(e) => onFilterChange(column, e.target.value)}
            />
            {filters[column] && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onFilterChange(column, '')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColumnFilters;
