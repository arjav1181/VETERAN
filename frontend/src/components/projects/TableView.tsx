import { useState, useMemo } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, createColumnHelper, type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectCard } from '@/types';

interface TableViewProps {
  cards: ProjectCard[];
  columns: { id: string; name: string; field: string }[];
  onCellEdit?: (cardId: string, field: string, value: string) => void;
  className?: string;
}

export function TableView({ cards, columns: configColumns, onCellEdit, className }: TableViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const data = useMemo(() => cards.map(card => ({
    id: card.id,
    title: card.note || 'Untitled',
    status: card.contentType || 'note',
    assignee: card.creatorUsername,
    position: card.position,
    createdAt: card.createdAt,
  })), [cards]);

  const columnHelper = createColumnHelper<typeof data[number]>();

  const tableColumns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => (
        <span className="text-sm text-text-primary font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className="px-2 py-0.5 text-2xs font-medium rounded-full bg-info/20 text-info capitalize">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('assignee', {
      header: 'Assignee',
      cell: info => (
        <span className="text-sm text-text-secondary">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: info => (
        <span className="text-sm text-text-muted">{new Date(info.getValue()).toLocaleDateString()}</span>
      ),
    }),
  ], []);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={cn('border border-border rounded-lg bg-primary-dark overflow-hidden', className)}>
      <div className="p-3 border-b border-border">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter table..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp size={14} />,
                        desc: <ChevronDown size={14} />,
                      }[header.column.getIsSorted() as string] ?? <ChevronsUpDown size={14} className="opacity-30" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="text-center py-12 text-sm text-text-muted">
                  No items found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-surface/20 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2 bg-surface border-t border-border text-xs text-text-muted">
        {data.length} items
      </div>
    </div>
  );
}
