// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import {
  SelectCell,
  SelectHeader,
} from "components/shared/table/SelectCheckbox";

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
    cell: (info) => (
      <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Product
  columnHelper.accessor("product", {
    id: "product",
    header: "Product",
    cell: (info) => (
      <span className="text-sm text-gray-800 dark:text-gray-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // LRN
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Action — View Draft Report button
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];