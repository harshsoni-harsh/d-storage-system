import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
// libraries
import { useState } from "react";

import HeaderSort from "@/components/react-table/HeaderSort";
// custom modules
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReactTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
}

const ReactTable = <T,>({ columns, data }: ReactTableProps<T>) => {
  const [sorting, setSorting] = useState([
    {
      id: "addr",
      desc: false,
    },
  ]);

  const table = useReactTable({
    data,
    debugTable: false,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={
                  header.column.getCanSort() ? "cursor-pointer select-none" : ""
                }
                onClick={header.column.getToggleSortingHandler()}
              >
                <div className="flex items-center space-x-2">
                  <span>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </span>
                  {header.column.getCanSort() && (
                    <HeaderSort column={header.column} />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="break-phrases">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export { ReactTable };
