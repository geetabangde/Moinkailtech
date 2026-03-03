// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import { SelectCell, SelectHeader } from "components/shared/table/SelectCheckbox";

const columnHelper = createColumnHelper();

// Helper: split comma/newline values into stacked spans
function MultiLine({ value }) {
  if (!value) return <span className="text-gray-400">—</span>;
  const parts = String(value).split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
  if (parts.length === 1) return <span>{parts[0]}</span>;
  return (
    <div className="flex flex-col gap-0.5">
      {parts.map((v, i) => <span key={i}>{v}</span>)}
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

  // Products — PHP: group_concat product names via trfProducts → products
  columnHelper.accessor("products", {
    id: "products",
    header: "Products",
    cell: (info) => <MultiLine value={info.getValue()} />,
  }),

  // BRN Nos — PHP: group_concat(brn) from trfProducts
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN Nos",
    cell: (info) => (
      <div className="font-mono text-xs">
        <MultiLine value={info.getValue()} />
      </div>
    ),
  }),

  // LRN Nos — PHP: group_concat(lrn) from trfProducts
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

  // Action — Approve Witness + Cancel Witness buttons (perm 177)
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];