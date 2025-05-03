import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // For potentially large tables
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Download, Search } from 'lucide-react'; // Added icons

// Helper function to convert array of objects to CSV
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(fieldName =>
        JSON.stringify(row[fieldName], (_, value) => value === null ? '' : value) // handle nulls and quotes
      ).join(',')
    )
  ];
  return csvRows.join('\r\n');
}

// Helper function to trigger download
function downloadCSV(csvData: string, filename: string = 'export.csv') {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // Feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

const MAX_DISPLAY_ROWS = 500;

// Define the columns to display - USE EXACT KEYS FROM YOUR JSON DATA
const DISPLAY_COLUMNS: string[] = [
  "App > Industry/Discipline > Module", // Assuming this is the exact key
  "Simulation Name",
  "Duration (Min)",
  "Learning Objective",
  "Standards Body > Category", // Assuming this is the exact key
  "Standards"
];

// Define filter categories based on dropdowns
type FilterCategory = "Industry" | "Module" | "Simulation Name" | "Standards Body" | "Standards";

// Define the structure for the filter state using Sets for multi-select
interface Filters {
  Industry: Set<string>;
  Module: Set<string>;
  "Simulation Name": Set<string>; // Use quotes if key has spaces/special chars
  "Standards Body": Set<string>;
  Standards: Set<string>;
}

// Define structure for available filter options
interface FilterOptions {
  Industry: string[];
  Module: string[];
  "Simulation Name": string[];
  "Standards Body": string[];
  Standards: string[];
}

const DataExplorer: React.FC = () => {
  const [allData, setAllData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    Industry: new Set(),
    Module: new Set(),
    "Simulation Name": new Set(),
    "Standards Body": new Set(),
    Standards: new Set(),
  });

  // Add state for search terms within each dropdown
  const [searchTerms, setSearchTerms] = useState<{ [key in FilterCategory]: string }>({
    Industry: '',
    Module: '',
    "Simulation Name": '',
    "Standards Body": '',
    Standards: '',
  });
   // lalalala
  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Extract fetchData function to be able to call it from refresh button
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching /tvr_data.json...');
      const response = await fetch('/tvr_data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Fetched ${data.length} rows.`);
      setAllData(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Failed to fetch data:', e);
      setError(`Failed to load data: ${e.message}. Make sure the conversion script ran successfully (check console output when starting the app) and the JSON file exists in the /public folder.`);
      setAllData([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate unique filter options
  const filterOptions = useMemo<FilterOptions>(() => {
    console.log("Calculating filter options...");
    const options: FilterOptions = {
      Industry: [],
      Module: [],
      "Simulation Name": [],
      "Standards Body": [],
      Standards: [],
    };
    if (!allData || allData.length === 0) return options;

    const uniqueOptions: { [key in FilterCategory]: Set<string> } = {
        Industry: new Set(),
        Module: new Set(),
        "Simulation Name": new Set(),
        "Standards Body": new Set(),
        Standards: new Set(),
    };

    allData.forEach(row => {
        if (row.Industry && typeof row.Industry === 'string') uniqueOptions.Industry.add(row.Industry);
        if (row.Module && typeof row.Module === 'string') uniqueOptions.Module.add(row.Module);
        if (row['Simulation Name'] && typeof row['Simulation Name'] === 'string') uniqueOptions['Simulation Name'].add(row['Simulation Name']);
        if (row['Standards Body'] && typeof row['Standards Body'] === 'string') uniqueOptions['Standards Body'].add(row['Standards Body']);
        if (row.Standards && typeof row.Standards === 'string') {
             // Handle potential multiple standards in one cell if needed (e.g., split by ';')
             const standards = String(row.Standards).split(';').map(s => s.trim()).filter(s => s);
             standards.forEach(s => uniqueOptions.Standards.add(s));
        }
    });

    options.Industry = Array.from(uniqueOptions.Industry).sort();
    options.Module = Array.from(uniqueOptions.Module).sort();
    options["Simulation Name"] = Array.from(uniqueOptions["Simulation Name"]).sort();
    options["Standards Body"] = Array.from(uniqueOptions["Standards Body"]).sort();
    options.Standards = Array.from(uniqueOptions.Standards).sort();

    console.log("Filter options calculated:", options);
    return options;
  }, [allData]);

  // Filtered data
  const filteredData = useMemo(() => {
    console.log('Filtering data with:', filters);
    if (!allData || allData.length === 0) {
      return [];
    }

    let result = allData;

    // Apply filters sequentially (AND logic between categories)
    (Object.keys(filters) as FilterCategory[]).forEach(category => {
      const selectedValues = filters[category];
      if (selectedValues.size > 0) { // Only filter if options are selected for this category
        result = result.filter(row => {
          // *** IMPORTANT: Adjust row[category] if the key name differs from the FilterCategory string
          const rowValue = row[category];

          // Handle potential multi-value cells (like 'Standards') during filtering
          if (category === 'Standards' && typeof rowValue === 'string') {
             const rowStandards = new Set(String(rowValue).split(';').map(s => s.trim()).filter(s => s));
             // Check if any of the row's standards are in the selected set
             return Array.from(selectedValues).some(selectedValue => rowStandards.has(String(selectedValue)));
          }

          // Standard filtering for single-value cells
          return typeof rowValue === 'string' && selectedValues.has(rowValue);
        });
      }
    });

    console.log(`${result.length} rows after filtering.`);
    return result;
  }, [allData, filters]);

  // Memoized displayed data (sliced subset of filtered data)
  const displayedData = useMemo(() => {
    const sliced = filteredData.slice(0, MAX_DISPLAY_ROWS);
    console.log(`Displaying ${sliced.length} rows.`);
    return sliced;
  }, [filteredData]);

  const handleExport = () => {
    console.log(`Exporting ${filteredData.length} rows...`);
    if (filteredData.length === 0) {
      alert('No data to export.');
      return;
    }
    try {
      const csv = convertToCSV(filteredData);
      downloadCSV(csv, 'tvr_data_export.csv');
    } catch (e: any) {
      console.error('Error during export:', e);
      alert(`Failed to export data: ${e.message}`);
    }
  };

  // Generic handler for checkbox changes in dropdowns
  const handleFilterChange = (category: FilterCategory, value: string, checked: boolean) => {
    setFilters(prevFilters => {
      const newSet = new Set(prevFilters[category]);
      if (checked) {
        newSet.add(value);
      } else {
        newSet.delete(value);
      }
      return {
        ...prevFilters,
        [category]: newSet,
      };
    });
  };

  // --- Rendering ---

  if (isLoading) {
    return <div className="p-4">Loading data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (allData.length === 0) {
    return <div className="p-4">No data found. Check if the source file exists and the conversion was successful.</div>;
  }

  const headers = Object.keys(allData[0] || {});

  // Helper to render a filter dropdown with Popover, improved readability, and search
  const renderFilterDropdown = (category: FilterCategory) => {
    const options = filterOptions[category];
    const selected = filters[category];
    if (!options || options.length === 0) return null; // Don't render if no options
    
    const selectedCount = selected.size;
    const searchTerm = searchTerms[category];
    
    // Filter options based on search term
    const filteredOptions = searchTerm 
      ? options.filter(option => 
          option.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;
    
    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerms(prev => ({
        ...prev,
        [category]: e.target.value
      }));
    };
    
    return (
      <Popover key={category}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="ml-2 whitespace-nowrap">
            {category}
            {selectedCount > 0 && (
              <span className="ml-1.5 rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                {selectedCount}
              </span>
            )}
            <ChevronDown className="ml-1.5 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[300px] p-0">
          <div className="p-3 font-medium border-b">{category}</div>
          
          {/* Search input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search options..."
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[300px]">
            {filteredOptions.length > 0 ? (
              <div className="p-2">
                {filteredOptions.map(option => (
                  <div 
                    key={option} 
                    className="flex items-start space-x-2 py-2 px-1 hover:bg-secondary/20 rounded"
                  >
                    <Checkbox
                      id={`${category}-${option}`}
                      checked={selected.has(option)}
                      onCheckedChange={(checked) => {
                        handleFilterChange(category, option, !!checked);
                      }}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`${category}-${option}`}
                      className="text-sm leading-tight break-words cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No options match your search
              </div>
            )}
          </ScrollArea>
          
          {options.length > 10 && (
            <div className="p-2 border-t text-xs text-muted-foreground">
              {filteredOptions.length} of {options.length} options
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="w-full max-w-full p-0 space-y-4">
      {/* Header Bar - Make padding responsive */}
      <div className="w-full bg-blue-600 py-6 md:py-8 px-4 md:px-6 text-white mb-4">
        <h1 className="text-2xl md:text-4xl font-bold">Curricular Mapping</h1>
      </div>
      
      {/* Filter Controls Card - Adjust padding for small screens */}
      <Card className="mx-2 md:mx-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 pb-4">
            <span className="font-medium mr-2">Filters:</span>
            <div className="flex flex-wrap gap-2">
              {renderFilterDropdown("Industry")}
              {renderFilterDropdown("Module")}
              {renderFilterDropdown("Simulation Name")}
              {renderFilterDropdown("Standards Body")}
              {renderFilterDropdown("Standards")}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Showing {displayedData.length} of {filteredData.length} matching rows (max {MAX_DISPLAY_ROWS} displayed).
          </p>
        </CardFooter>
      </Card>

      {/* Data Table Card - Make responsive */}
      <Card className="mx-2 md:mx-6">
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Responsive hint for small screens */}
            <div className="md:hidden p-2 text-sm text-muted-foreground border-b">
              Scroll horizontally to see all data
            </div>

            {/* ----- Scrollable layout: horizontal scroll on outer wrapper, vertical scroll within body ----- */}
            <div className="overflow-x-auto"> {/* Horizontal scroll only here */}

              {/* Header Table (non-scrollable) */}
              <div className="border rounded-t-md overflow-hidden">
                <Table className="table-fixed w-full min-w-[1200px]">
                  <colgroup>
                    <col className="w-[250px]" />
                    <col className="w-[200px]" />
                    <col className="w-[120px]" />
                    <col className="w-[250px]" />
                    <col className="w-[250px]" />
                    <col className="w-[250px]" />
                  </colgroup>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="p-2 md:p-3 text-left font-semibold border-r">App &gt; Industry/Discipline &gt; Module</TableHead>
                      <TableHead className="p-2 md:p-3 text-left font-semibold border-r">Simulation Name</TableHead>
                      <TableHead className="p-2 md:p-3 text-left font-semibold border-r">Duration (Min)</TableHead>
                      <TableHead className="p-2 md:p-3 text-left font-semibold border-r">Learning Objective</TableHead>
                      <TableHead className="p-2 md:p-3 text-left font-semibold border-r">Standards Body &gt; Category</TableHead>
                      <TableHead className="p-2 md:p-3 text-left font-semibold">Standards</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              {/* Scrollable body table */}
              <div className="overflow-y-auto border-x border-b rounded-b-md max-h-[400px] md:max-h-[500px] lg:max-h-[600px]">
                <Table className="table-fixed w-full min-w-[1200px]">
                  <colgroup>
                    <col className="w-[250px]" />
                    <col className="w-[200px]" />
                    <col className="w-[120px]" />
                    <col className="w-[250px]" />
                    <col className="w-[250px]" />
                    <col className="w-[250px]" />
                  </colgroup>
                  <TableBody>
                    {displayedData.length > 0 ? (
                      displayedData.map((row, index) => (
                        <TableRow key={index} className="border-b last:border-b-0 hover:bg-muted/50">
                          {DISPLAY_COLUMNS.map((header, cellIndex) => {
                            const borderClass = cellIndex < DISPLAY_COLUMNS.length - 1 ? "border-r" : "";
                            const stickyClass = cellIndex === 0 ? "sticky left-0 bg-white z-[5]" : "";
                            const hoverBgClass = cellIndex === 0 ? "group-hover/row:bg-muted/50" : "";

                            return (
                              <TableCell
                                key={`${index}-${header}`}
                                className={`p-2 md:p-3 align-top ${borderClass} ${stickyClass} ${hoverBgClass}`}
                              >
                                {String(row[header] ?? '')}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={DISPLAY_COLUMNS.length} className="p-8 text-center h-32">
                          No results match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Message about displayed rows (moved outside scroll container) */}
              {filteredData.length > MAX_DISPLAY_ROWS && (
                <p className="mt-2 text-sm text-muted-foreground italic">
                  More than {MAX_DISPLAY_ROWS} rows matched the filters. Only the first {MAX_DISPLAY_ROWS} are displayed. Export to see all results.
                </p>
              )}
            </div> {/* End body scroll container */}

          </div> {/* End horizontal scroll wrapper */}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleExport} 
            className="bg-blue-600 text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DataExplorer; 