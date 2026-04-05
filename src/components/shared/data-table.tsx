import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { TableSkeleton } from "./loading-skeleton";

export interface Column<T> {
  key:        string;
  header:     string;
  width?:     string;
  render:     (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns:     Column<T>[];
  data:        T[];
  keyField:    keyof T;
  isLoading?:  boolean;
  emptyTitle?: string;
  emptyDesc?:  string;
  className?:  string;
  onRowClick?: (row: T) => void;
}

/**
 * Generic data table used across admin pages.
 *
 * Usage:
 *   <DataTable
 *     columns={[
 *       { key: "name", header: "Name", render: (r) => r.name },
 *       { key: "status", header: "Status", render: (r) => <Badge>{r.status}</Badge> },
 *     ]}
 *     data={voters}
 *     keyField="id"
 *   />
 */
export function DataTable<T>({
  columns,
  data,
  keyField,
  isLoading  = false,
  emptyTitle = "No data found",
  emptyDesc,
  className,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) return <TableSkeleton rows={5} cols={columns.length} />;

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDesc} className={className} />;
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row) => (
            <TableRow
              key={String(row[keyField])}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-border/50 transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/30",
              )}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className="text-sm text-foreground">
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}