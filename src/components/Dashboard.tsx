import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import DataFilter from './DataFilter';
import ColumnFilters from './ColumnFilters';
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/csvUtils";
import { Download, RefreshCw } from "lucide-react";
import { fetchCSVData } from "@/services/dataService";
import { useToast } from "@/components/ui/use-toast";
const Dashboard = () => {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const loadData = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCSVData();
    if (result.success) {
      setData(result.data);
      setColumns(result.headers);
      setSearchTerm('');
      setFilters({});
      setSortConfig(null);

      // Show success toast
      toast({
        title: "Data Loaded Successfully",
        description: `${result.data.length} rows loaded from data.csv`
      });
    } else {
      setError(result.error || 'Failed to load data');
      toast({
        variant: "destructive",
        title: "Error Loading Data",
        description: result.error || 'Failed to load data. Please check if data.csv is available.'
      });
    }
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => {
      const newFilters = {
        ...prev
      };
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
        return {
          key: column,
          direction: 'asc'
        };
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
      const passesSearch = !searchTerm || columns.some(column => String(row[column] || '').toLowerCase().includes(searchTerm.toLowerCase()));
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
      downloadCSV(sortedData, 'transfr_curricular_mapping.csv');
    }
  };
  return <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading} className="flex items-center gap-1">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button onClick={handleExport} disabled={sortedData.length === 0} className="flex items-center gap-2 bg-[#0072ce] hover:bg-[#005bab]">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      {loading ? <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-[#0072ce]" />
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </div> : error ? <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-destructive font-medium">
              Unable to load data.csv
            </div>
            <p className="text-muted-foreground">
              {error}
            </p>
            <Button onClick={loadData} className="bg-[#0072ce] hover:bg-[#005bab]">
              Try Again
            </Button>
          </div>
        </div> : <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4">
              <DataFilter columns={columns} onSearchChange={handleSearchChange} onFilterChange={handleFilterChange} onClearFilters={clearFilters} searchValue={searchTerm} filters={filters} />
              
              {/* Adding the new column-specific filters */}
              <ColumnFilters columns={columns} filters={filters} onFilterChange={handleFilterChange} />
              
              <div className="text-sm text-muted-foreground mb-4">
                Showing {sortedData.length} of {data.length} records
              </div>
              
              <DataTable data={sortedData} columns={columns} onSort={handleSort} sortConfig={sortConfig} />
            </div>
          </div>
        </>}
    </div>;
};
export default Dashboard;