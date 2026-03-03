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

  // Date — PHP: trfs.date, formatted d/m/Y
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

  // Products — PHP: group_concat product names from trfProducts → products
  columnHelper.accessor("products", {
    id: "products",
    header: "Products",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "—";
      // Backend may return newline- or comma-separated product names
      return (
        <div className="flex flex-col gap-0.5">
          {String(val)
            .split(/[\n,]/)
            .map((p, i) => (
              <span key={i}>{p.trim()}</span>
            ))}
        </div>
      );
    },
  }),

  // BRN Nos — PHP: group_concat(brn) from trfProducts
  columnHelper.accessor("brn_nos", {
    id: "brn_nos",
    header: "BRN Nos",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "—";
      return (
        <div className="flex flex-col gap-0.5 font-mono text-xs">
          {String(val)
            .split(/[\n,]/)
            .map((b, i) => (
              <span key={i}>{b.trim()}</span>
            ))}
        </div>
      );
    },
  }),

  // LRN Nos — PHP: group_concat(lrn) from trfProducts
  columnHelper.accessor("lrn_nos", {
    id: "lrn_nos",
    header: "LRN Nos",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "—";
      return (
        <div className="flex flex-col gap-0.5 font-mono text-xs">
          {String(val)
            .split(/[\n,]/)
            .map((l, i) => (
              <span key={i}>{l.trim()}</span>
            ))}
        </div>
      );
    },
  }),

  // Remarks — PHP: trfs.reviewremark
  columnHelper.accessor("reviewremark", {
    id: "reviewremark",
    header: "Remarks",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Action — Approve Priority Testing button (perm 175)
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];