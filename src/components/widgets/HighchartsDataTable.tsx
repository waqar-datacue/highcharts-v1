import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Download, Settings, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface Column {
  key: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
  format?: (value: any) => string;
}

interface HighchartsDataTableProps {
  data: any[];
  columns: Column[];
  allowColumnSelection?: boolean;
  allowSearch?: boolean;
  allowCSVExport?: boolean;
  allowAIInteraction?: boolean;
  isRTL?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

const HighchartsDataTable: React.FC<HighchartsDataTableProps> = ({
  data,
  columns: initialColumns,
  allowColumnSelection = true,
  allowSearch = true,
  allowCSVExport = true,
  isRTL = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [columns, setColumns] = useState(initialColumns);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        if (sortDirection === 'asc') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(aString);
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection]);

  const visibleColumns = columns.filter(col => col.visible);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setColumns(prev => prev.map(col => 
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    ));
  };

  const exportToCSV = () => {
    const headers = visibleColumns.map(col => col.label);
    const csvData = processedData.map(row => 
      visibleColumns.map(col => {
        const value = row[col.key];
        return col.format ? col.format(value) : value;
      })
    );

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skus-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        {allowSearch && (
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Column Selection */}
          {allowColumnSelection && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings size={16} className="mr-2" />
                  Columns
                  <Badge variant="secondary" className="ml-2">
                    {visibleColumns.length}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Show/Hide Columns</h4>
                  {columns.map(column => (
                    <label key={column.key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={column.visible}
                        onChange={() => toggleColumnVisibility(column.key)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{column.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* CSV Export */}
          {allowCSVExport && (
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download size={16} className="mr-2" />
              CSV
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {visibleColumns.map(column => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            size={12} 
                            className={`${
                              sortColumn === column.key && sortDirection === 'asc' 
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            }`} 
                          />
                          <ChevronDown 
                            size={12} 
                            className={`-mt-1 ${
                              sortColumn === column.key && sortDirection === 'desc' 
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedData.length > 0 ? (
                processedData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {visibleColumns.map(column => (
                      <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                        {column.format ? column.format(row[column.key]) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? `No results found for "${searchTerm}"` : 'No data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          Showing {processedData.length} of {data.length} items
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </span>
        {sortColumn && (
          <span>
            Sorted by {columns.find(col => col.key === sortColumn)?.label} ({sortDirection})
          </span>
        )}
      </div>
    </div>
  );
};

export default HighchartsDataTable; 