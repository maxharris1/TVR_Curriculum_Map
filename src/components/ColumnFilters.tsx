
import React, { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { CheckIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColumnFiltersProps {
  columns: string[];
  filters: Record<string, string[]>;
  onFilterChange: (column: string, values: string[]) => void;
  data: Record<string, string>[];
}

const ColumnFilters: React.FC<ColumnFiltersProps> = ({
  columns,
  filters,
  onFilterChange,
  data
}) => {
  const [availableOptions, setAvailableOptions] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  // Extract all unique values for each column
  useEffect(() => {
    if (!data || !data.length || !columns || !columns.length) return;
    
    const options: Record<string, Set<string>> = {};
    
    columns.forEach(column => {
      options[column] = new Set<string>();
      
      data.forEach(row => {
        const value = row[column];
        if (value && value.trim()) {
          options[column].add(value);
        }
      });
    });
    
    // Convert Sets to sorted arrays
    const sortedOptions: Record<string, string[]> = {};
    Object.entries(options).forEach(([column, valueSet]) => {
      sortedOptions[column] = Array.from(valueSet).sort();
    });
    
    setAvailableOptions(sortedOptions);
  }, [data, columns]);

  // Handle popover open/close state
  const handleOpenChange = (column: string, isOpen: boolean) => {
    setOpen(prev => ({ ...prev, [column]: isOpen }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 mt-4">
      {columns && columns.map((column) => (
        <div key={column} className="space-y-1">
          <Label htmlFor={`filter-${column}`} className="text-sm font-medium mb-1 block">
            {column}
          </Label>
          
          <Popover open={open[column]} onOpenChange={(isOpen) => handleOpenChange(column, isOpen)}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between border-[#0072ce]/30 focus:border-[#0072ce] focus-visible:ring-[#0072ce]/20"
                id={`filter-${column}`}
              >
                {filters[column]?.length 
                  ? `${filters[column].length} selected` 
                  : "Select values..."}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command className="max-h-[300px]">
                <CommandInput placeholder={`Search ${column}...`} />
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup className="max-h-[250px] overflow-auto">
                  {availableOptions[column] && availableOptions[column].map((option) => {
                    const isSelected = filters[column]?.includes(option) || false;
                    
                    return (
                      <CommandItem
                        key={option}
                        onSelect={() => {
                          const currentValues = filters[column] || [];
                          const newValues = isSelected
                            ? currentValues.filter(value => value !== option)
                            : [...currentValues, option];
                          
                          onFilterChange(column, newValues);
                        }}
                        value={option}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50"
                          )}
                        >
                          {isSelected && <CheckIcon className="h-3 w-3" />}
                        </div>
                        {option}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Selected values display */}
          {filters[column]?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters[column].map((value) => (
                <Badge 
                  key={value}
                  variant="secondary" 
                  className="text-xs py-0 h-6"
                >
                  {value}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const newValues = filters[column].filter(v => v !== value);
                      onFilterChange(column, newValues);
                    }}
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters[column].length > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => onFilterChange(column, [])}
                  className="h-5 px-1 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ColumnFilters;
