import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Settings, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import SaudiRiyalSymbol from "../SaudiRiyalSymbol";
import { cn } from "../../lib/utils";

interface Column {
  key: string;
  label: string;
  visible?: boolean;
  isCurrency?: boolean;
  format?: (value: any) => string;
  sortable?: boolean;
}

interface DataTableWidgetProps {
  id: string;
  title: string;
  data: Array<Record<string, any>>;
  columns: Column[];
  allowColumnSelection?: boolean;
  allowSearch?: boolean;
  allowCSVExport?: boolean;
  allowAIInteraction?: boolean;
  className?: string;
}

// Create a default formatter function for various value types
const defaultFormatter = (value: any, isCurrency = false) => {
  if (value === null || value === undefined) {
    return "-";
  }
  
  if (typeof value === "number") {
    if (isCurrency) {
      return new Intl.NumberFormat("en-SA", {
        style: "currency",
        currency: "SAR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    
    return new Intl.NumberFormat("en").format(value);
  }
  
  return String(value);
};

const DataTableWidget: React.FC<DataTableWidgetProps> = ({
  id,
  title,
  data,
  columns,
  allowColumnSelection = false,
  allowSearch = true,
  allowCSVExport = false,
  allowAIInteraction = false,
  className
}) => {
  // Initialize visible columns from props
  const initialVisibleColumns = columns.map((col) => ({
    ...col,
    visible: col.visible !== false, // Default to true if not specified
    sortable: col.sortable !== false, // Default to true if not specified
  }));
  
  const [visibleColumns, setVisibleColumns] = useState<Column[]>(initialVisibleColumns);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  
  // Filter data based on search term
  const filteredData = data.filter((row) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return Object.values(row).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchLower);
    });
  });
  
  // Sort data based on sortConfig
  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] === b[sortConfig.key]) {
          return 0;
        }
        
        if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        
        if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" 
            ? aValue - bValue 
            : bValue - aValue;
        }
        
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        return sortConfig.direction === "asc" 
          ? aString.localeCompare(bString) 
          : bString.localeCompare(aString);
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);
  
  // Toggle a column's visibility
  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };
  
  // Request sort by column
  const requestSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === "asc"
          ? { key, direction: "desc" }
          : null;
      }
      return { key, direction: "asc" };
    });
  };
  
  // Get sort indicator for column header
  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    }
    return sortConfig.direction === "asc" 
      ? <ArrowUp size={14} className="ml-1 text-datacue-primary" />
      : <ArrowDown size={14} className="ml-1 text-datacue-primary" />;
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      {/* Table Controls */}
      {(allowSearch || allowColumnSelection) && (
        <div className="flex items-center justify-between mb-3 space-x-2">
          {allowSearch && (
            <Input
              className="max-w-xs"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          )}
          
          {allowColumnSelection && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto flex-shrink-0">
                  <Settings size={16} className="mr-2" /> Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 max-h-72 overflow-y-auto">
                {columns.map((column) => {
                  const isVisible = visibleColumns.find(
                    (col) => col.key === column.key
                  )?.visible;
                  
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={isVisible}
                      onCheckedChange={() => toggleColumnVisibility(column.key)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
      
      {/* Data Table */}
      <div className="overflow-auto flex-1 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                column.visible && (
                  <TableHead 
                    key={column.key}
                    className={cn(
                      "font-semibold transition-colors",
                      column.sortable !== false && "cursor-pointer hover:bg-gray-50"
                    )}
                    onClick={() => column.sortable !== false && requestSort(column.key)}
                  >
                    <div className="flex items-center">
                      <span>{column.label}</span>
                      {column.sortable !== false && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                )
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.filter(col => col.visible).length}
                  className="text-center h-24 text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={`${id}-row-${index}`} className={index % 2 === 0 ? "bg-gray-50/50" : ""}>
                  {visibleColumns.map((column) => (
                    column.visible && (
                      <TableCell key={`${id}-cell-${column.key}-${index}`} className="py-2 px-3">
                        {column.format
                          ? column.format(row[column.key])
                          : column.isCurrency 
                            ? (
                              <div className="flex items-center">
                                <SaudiRiyalSymbol className="mr-1" size={12} />
                                {defaultFormatter(row[column.key])}
                              </div>
                            )
                            : defaultFormatter(row[column.key])
                        }
                      </TableCell>
                    )
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Table footer with row count and sort info */}
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-500">
          {sortedData.length} {sortedData.length === 1 ? "row" : "rows"}
        </div>
        {sortConfig && (
          <div className="text-xs text-gray-500">
            Sorted by {columns.find(col => col.key === sortConfig.key)?.label} ({sortConfig.direction === "asc" ? "ascending" : "descending"})
            <button 
              onClick={() => setSortConfig(null)} 
              className="ml-1 text-datacue-primary hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTableWidget;
