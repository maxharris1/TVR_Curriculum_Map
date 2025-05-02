
import React, { useState, useMemo } from 'react';
import FileUploader from './FileUploader';
import DataTable from './DataTable';
import DataFilter from './DataFilter';
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/csvUtils";
import { Download } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleDataLoaded = (newData: Record<string, string>[], headers: string[]) => {
    setData(newData);
    setColumns(headers);
    setSearchTerm('');
    setFilters({});
    setSortConfig(null);
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (value === '') {
        delete newFilters[column];
      } else {
        newFilters[column] = value;
      }
      
      return newFilters;
    });
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleSort = (column: string) => {
    setSortConfig(currentSort => {
      if (!currentSort || currentSort.key !== column) {
        return { key: column, direction: 'asc' };
      }
      
      return {
        key: column,
        direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
      };
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    
    return data.filter(row => {
      // Apply column-specific filters
      const passesColumnFilters = Object.entries(filters).every(([column, filterValue]) => {
        const cellValue = String(row[column] || '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
      
      // Apply global search across all columns
      const passesSearch = !searchTerm || 
        columns.some(column => 
          String(row[column] || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      return passesColumnFilters && passesSearch;
    });
  }, [data, filters, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = String(a[sortConfig.key] || '').toLowerCase();
      const bValue = String(b[sortConfig.key] || '').toLowerCase();
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleExport = () => {
    if (sortedData.length > 0) {
      downloadCSV(sortedData, 'transfr_data_export.csv');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {data.length === 0 ? (
        <FileUploader onDataLoaded={handleDataLoaded} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-semibold">Data Explorer</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => handleDataLoaded([], [])}
              >
                Upload New File
              </Button>
              <Button 
                onClick={handleExport}
                disabled={sortedData.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              <DataFilter
                columns={columns}
                onSearchChange={handleSearchChange}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                searchValue={searchTerm}
                filters={filters}
              />
              
              <div className="text-sm text-muted-foreground mb-4">
                Showing {sortedData.length} of {data.length} records
              </div>
              
              <DataTable
                data={sortedData}
                columns={columns}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
