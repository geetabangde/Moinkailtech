// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

const TYPE_MAP = { 0: "Upload Report", 1: "Perform All Tests" };

export const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => (
      <span className="dark:text-dark-400 font-mono text-xs text-gray-500">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("package", {
    header: "Package Name",
    cell: (info) => (
      <span className="dark:text-dark-100 font-medium text-gray-800">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("pname", {
    header: "Product",
    cell: (info) => (
      <span className="dark:text-dark-300 text-sm text-gray-600">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("rate", {
    header: "Rate",
    cell: (info) => (
      <span className="dark:text-dark-100 font-semibold text-gray-800">
        ₹{parseFloat(info.getValue() || 0).toLocaleString("en-IN")}
      </span>
    ),
  }),

  columnHelper.accessor("type", {
    header: "Type",
    cell: (info) => {
      const val = info.getValue();
      return (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            val === 1
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          }`}
        >
          {TYPE_MAP[val] ?? "—"}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (props) => <RowActions row={props.row} table={props.table} />,
  }),
];
