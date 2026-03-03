// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import { SelectCell, SelectHeader } from "components/shared/table/SelectCheckbox";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),

  // ID
  columnHelper.accessor("id", {
    id: "id",
    header: "ID",
    enableSorting: true,
    cell: (info) => (
      <span className="font-medium text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Product
  columnHelper.accessor("product", {
    id: "product",
    header: "Product",
    enableSorting: true,
    cell: (info) => (
      <span className="text-gray-800 dark:text-dark-100">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Customer
  columnHelper.accessor("customer", {
    id: "customer",
    header: "Customer",
    enableSorting: true,
    cell: (info) => (
      <span className="text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // LRN
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    enableSorting: true,
    cell: (info) => (
      <span className="font-mono text-xs text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // BRN
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN",
    enableSorting: true,
    cell: (info) => (
      <span className="font-mono text-xs text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ULR
  columnHelper.accessor("ulr", {
    id: "ulr",
    header: "ULR",
    enableSorting: true,
    cell: (info) => (
      <span className="font-mono text-xs text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Grade/Size
  columnHelper.accessor("grade_size", {
    id: "grade_size",
    header: "Grade/Size",
    enableSorting: true,
    cell: (info) => (
      <span className="text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Action
  columnHelper.display({
    id: "actions",
    header: "Action",
    enableSorting: false,
    cell: RowActions,
  }),
];