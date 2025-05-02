
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DataTableProps {
  data: Record<string, string>[];
  columns: string[];
  onSort: (column: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  onSort,
  sortConfig
}) => {
  const getSortIcon = (column: string) => {
    if (!sortConfig || sortConfig.key !== column) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => onSort(column)}
                    className="flex items-center p-0 h-auto font-semibold hover:bg-transparent hover:text-primary"
                  >
                    {column}
                    {getSortIcon(column)}
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center h-32 text-muted-foreground">
                  No data available. Please upload a CSV file.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`}>
                      {row[column] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
