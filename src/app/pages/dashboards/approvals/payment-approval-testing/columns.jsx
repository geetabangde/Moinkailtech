// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import { SelectCell, SelectHeader } from "components/shared/table/SelectCheckbox";

const columnHelper = createColumnHelper();

// Helper: split comma/newline-separated strings into stacked spans
function MultiLine({ value }) {
  if (!value) return "—";
  return (
    <div className="flex flex-col gap-0.5">
      {String(value)
        .split(/[\n,]/)
        .map((v, i) => <span key={i}>{v.trim()}</span>)}
    </div>
  );
}

export const columns = [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),

  // TRF Entry No — PHP: trfs.id, ordered desc
  columnHelper.accessor("id", {
    id: "id",
    header: "TRF Entry No",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Date — PHP: trfs.date formatted d/m/Y
  columnHelper.accessor("date", {
    id: "date",
    header: "Date",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Customer — PHP: trfs.customername
  columnHelper.accessor("customername", {
    id: "customername",
    header: "Customer",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Concern BD — API: bdName
  columnHelper.accessor("bdName", {
    id: "bdName",
    header: "Concern BD",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Products — API: products (single string)
  columnHelper.accessor("products", {
    id: "products",
    header: "Products",
    cell: (info) => <MultiLine value={info.getValue()} />,
  }),

  // BRN Nos — API: brn
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN Nos",
    cell: (info) => (
      <div className="font-mono text-xs">
        <MultiLine value={info.getValue()} />
      </div>
    ),
  }),

  // LRN Nos — API: lrn
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN Nos",
    cell: (info) => (
      <div className="font-mono text-xs">
        <MultiLine value={info.getValue()} />
      </div>
    ),
  }),

  // Remarks — PHP: trfs.reviewremark
  columnHelper.accessor("reviewremark", {
    id: "reviewremark",
    header: "Remarks",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Action — Approve Non-Payment button (perm 176+bd match OR perm 405)
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];