type Column<T> = {
  key: keyof T | "actions"
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  rows: T[]
  columns: Column<T>[]
  currentPage: number
  pageSize: number
}

export function DataTable<T>({
  rows,
  columns,
  currentPage,
  pageSize,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50 text-gray-700 text-sm font-semibold">
          <tr>
            <th className="px-4 py-3 text-left w-16">ID</th>
            {columns.map((col) => (
              <th
                key={col.key.toString()}
                className={`px-4 py-3 text-left ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-gray-900">
                {(currentPage - 1) * pageSize + index + 1}
              </td>
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-gray-500">
                  {col.render
                    ? col.render(row)
                    : col.key === "statusUser"
                      ? row[col.key as keyof T]
                        ? "Active"
                        : "Inactive"
                      : String(row[col.key as keyof T])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
