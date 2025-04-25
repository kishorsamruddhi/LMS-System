import { useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';

const columns = [
  {
    accessorKey: 'user_id',
    header: 'Unique Id',
  },
  {
    id: 'user_details.username',
    header: 'Full Name',
  },
  {
    accessorKey: 'user_details.email',
    header: 'Email Address',
  },
  {
    accessorKey: 'user_details.phoneNumber',
    header: 'Phone Number',
  },
  {
    accessorKey: 'completedModules',
    header: 'Completed Modules',
  },
  {
    accessorKey: 'completedAssessments',
    header: 'Completed Assessments',
  },
  {
    accessorKey: 'learning_time.timeSpent',
    header: 'Learning Time',
  },
  {
    id: 'pack_details',
    header: 'Active Plans',
    cell: ({ row }) => row.original.subpack?.plan || 'NO ACTIVE PLAN',
  },
];

const DataTable = ({ data, pagination, setPagination }) => {
  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex: pagination.page,
        pageSize: pagination.rowsPerPage,
      },
    },
    onPaginationChange: (newPagination) => {
      setPagination({
        page: newPagination.pageIndex,
        rowsPerPage: newPagination.pageSize,
      });
    },
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : header.renderHeader()}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{cell.renderCell()}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination table={table} />
    </div>
  );
};

export default DataTable;



