import type { ReactNode } from "react";
import { EmptyState } from "./empty-state";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
};

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  emptyTitle = "No rows to show",
  emptyDescription = "Demo data will appear here when Iter SyncCore has activity to display."
}: {
  rows: T[];
  columns: Column<T>[];
  getRowKey?: (row: T, index: number) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (!rows.length) {
    return (
      <div className="table-shell">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.align === "right" ? "is-right" : ""}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey?.(row, index) ?? index.toString()}>
              {columns.map((column) => (
                <td key={column.key} className={column.align === "right" ? "is-right" : ""}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
