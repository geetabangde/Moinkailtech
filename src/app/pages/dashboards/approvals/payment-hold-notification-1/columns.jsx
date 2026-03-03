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

  // TRF Entry No — PHP: paymentapprovalrequest.trf (the trfs.id)
  columnHelper.accessor("trf", {
    id: "trf",
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

  // BD — PHP: concat(firstname,' ',lastname) from admin where id=trfs.bd
  columnHelper.accessor("bdName", {
    id: "bdName",
    header: "BD",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Products — PHP: group_concat product names via trfProducts → products
  columnHelper.accessor("products", {
    id: "products",
    header: "Products",
    cell: (info) => <MultiLine value={info.getValue()} />,
  }),

  // BRN Nos — PHP: group_concat(brn) from trfProducts where trf=trf
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN Nos",
    cell: (info) => (
      <div className="font-mono text-xs">
        <MultiLine value={info.getValue()} />
      </div>
    ),
  }),

  // LRN Nos — PHP: group_concat(lrn) from trfProducts where trf=trf
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN Nos",
    cell: (info) => (
      <div className="font-mono text-xs">
        <MultiLine value={info.getValue()} />
      </div>
    ),
  }),

  // Request Comment — PHP: paymentapprovalrequest.requestcomment
  columnHelper.accessor("requestcomment", {
    id: "requestcomment",
    header: "Request Comment",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Requested On — PHP: paymentapprovalrequest.added_on formatted d/m/Y H:i:s
  columnHelper.accessor("requestedon", {
    id: "requestedon",
    header: "Requested On",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Requested By — PHP: concat(firstname,' ',lastname) from admin where id=added_by
  columnHelper.accessor("requestedby", {
    id: "requestedby",
    header: "Requested By",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Action — Request For Non Payment Report modal (perm 404)
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];