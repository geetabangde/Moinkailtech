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

  // S. No. — PHP: S. No.
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S. No.",
    cell: (info) => info.row.index + 1,
  }),

  // Product — PHP: product
  columnHelper.accessor("product", {
    id: "product",
    header: "Product",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Package — PHP: package
  columnHelper.accessor("package", {
    id: "package",
    header: "Package",
    cell: (info) => info.getValue() ?? "—",
  }),

  // LRN — PHP: lrn
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Grade/Size — PHP: grade/size
  columnHelper.accessor("grade_size", {
    id: "grade_size",
    header: "Grade/Size",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Customer Type — PHP: if(in_array(389, $permissions)) — perm 389
  columnHelper.accessor("customer_type", {
    id: "customer_type",
    header: "Customer Type",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Specific Purpose — PHP: if(in_array(390, $permissions)) — perm 390
  columnHelper.accessor("specific_purpose", {
    id: "specific_purpose",
    header: "Specific Purpose",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Action — PHP: Assign Chemist button
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];