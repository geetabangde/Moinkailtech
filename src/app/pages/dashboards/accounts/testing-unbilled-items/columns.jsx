// columns.js — Unbilled Testing Items
// Pattern: same as payment-list columns (createColumnHelper from @tanstack/react-table)

import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export const columns = [
  // Sr. No
  columnHelper.display({
    id: "s_no",
    header: "Sr No",
    cell: (info) => info.row.index + 1,
  }),

  // BRN
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // LRN
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-400">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // TRF No
  columnHelper.accessor("trf", {
    id: "trf",
    header: "TRF No",
    cell: (info) => (
      <span className="dark:text-dark-300 font-mono text-xs text-gray-600">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // Product
  columnHelper.accessor("productname", {
    id: "productname",
    header: "Product",
    cell: (info) => info.getValue() || "—",
  }),

  // Package
  columnHelper.accessor("packagename", {
    id: "packagename",
    header: "Package",
    cell: (info) => (
      <span className="block max-w-xs leading-snug">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // Customer
  columnHelper.accessor("customername", {
    id: "customername",
    header: "Customer",
    cell: (info) => info.getValue() || "—",
  }),

  // Status — PHP: empty($rowitem['invoice']) → Pending else Billed
  columnHelper.accessor("invoice", {
    id: "invoice",
    header: "Status",
    cell: (info) => {
      const val = info.getValue();
      const isPending = !val || val === "" || val === "0" || val === 0;
      return isPending ? (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
          Pending
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Billed
        </span>
      );
    },
  }),
];
