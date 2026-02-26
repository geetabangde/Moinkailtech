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
    cell: (info) => info.getValue() ?? "—",
  }),

  // Customer
  columnHelper.accessor("customer", {
    id: "customer",
    header: "Customer",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Product
  columnHelper.accessor("product", {
    id: "product",
    header: "Product",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Package
  columnHelper.accessor("package", {
    id: "package",
    header: "Package",
    cell: (info) => info.getValue() ?? "—",
  }),

  // LRN
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => info.getValue() ?? "—",
  }),

  // BRN
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Grade / Size
  columnHelper.accessor(
    (row) =>
      row.grade_size ??
      (row.grade && row.size ? `${row.grade}/${row.size}` : "NA/NA"),
    {
      id: "grade_size",
      header: "Grade/Size",
      cell: (info) => info.getValue(),
    }
  ),

  // Brand / Source
  columnHelper.accessor("brand", {
    id: "brand",
    header: "Brand/Source",
    cell: (info) => info.getValue() || "-",
  }),

  // Customer Type
  columnHelper.accessor("customer_type", {
    id: "customer_type",
    header: "Customer Type",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Specific Purpose
  columnHelper.accessor("specific_purpose", {
    id: "specific_purpose",
    header: "Specific Purpose",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Action — Allot Sample button
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];
