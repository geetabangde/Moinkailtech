// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import {
  SelectCell,
  SelectHeader,
} from "components/shared/table/SelectCheckbox";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

export const columns = [
  // ── Select ──────────────────────────────────────────────────────────────
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),

  // ── ID ──────────────────────────────────────────────────────────────────
  columnHelper.accessor("id", {
    id: "id",
    header: "ID",
    cell: (info) => (
      <span className="font-medium text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ── Product ─────────────────────────────────────────────────────────────
  columnHelper.accessor("product", {
    id: "product",
    header: "Product",
    cell: (info) => (
      <span className="text-gray-800 dark:text-dark-100">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ── Main Customer (permission 358) ───────────────────────────────────────
  columnHelper.accessor("main_customer", {
    id: "main_customer",
    header: "Main Customer",
    cell: (info) => (
      <span className="text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ── Report Customer ──────────────────────────────────────────────────────
  columnHelper.accessor("report_customer", {
    id: "report_customer",
    header: "Report Customer",
    cell: (info) => {
      const value = info.getValue();
      if (Array.isArray(value)) {
        return (
          <span className="text-gray-700 dark:text-dark-200">
            {value.length ? value.join(", ") : "—"}
          </span>
        );
      }
      return (
        <span className="text-gray-700 dark:text-dark-200">
          {value ?? "—"}
        </span>
      );
    },
  }),

  // ── LRN ─────────────────────────────────────────────────────────────────
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ── BRN ─────────────────────────────────────────────────────────────────
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ── ULR ─────────────────────────────────────────────────────────────────
  columnHelper.accessor("ulr", {
    id: "ulr",
    header: "ULR",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ── Report Date ──────────────────────────────────────────────────────────
  columnHelper.accessor("reportdate", {
    id: "reportdate",
    header: "Report date",
    cell: (info) => (
      <span className="whitespace-nowrap text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ── Grade / Size ─────────────────────────────────────────────────────────
  columnHelper.accessor("grade_size", {
    id: "grade_size",
    header: "Grade/Size",
    cell: (info) => (
      <span className="text-gray-700 dark:text-dark-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ── Action ───────────────────────────────────────────────────────────────
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];