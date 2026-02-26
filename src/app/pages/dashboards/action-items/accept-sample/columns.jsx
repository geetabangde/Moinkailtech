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

  // Sr. No
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "Sr. No",
    cell: (info) => info.row.index + 1,
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

  // Date
  columnHelper.accessor("date", {
    id: "date",
    header: "Date",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Product
  columnHelper.accessor("product", {
    id: "product",
    header: "Product",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Department — PHP: labs name
  columnHelper.accessor("department", {
    id: "department",
    header: "Department",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Package
  columnHelper.accessor("package", {
    id: "package",
    header: "Package",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Quantity
  columnHelper.accessor("quantity", {
    id: "quantity",
    header: "Quantity",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Customer Type — shown when perm 389
  columnHelper.accessor("customer_type", {
    id: "customer_type",
    header: "Customer Type",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Specific Purpose — shown when perm 390
  columnHelper.accessor("specific_purpose", {
    id: "specific_purpose",
    header: "Specific Purpose",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Action — Accept button
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];