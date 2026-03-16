// columns.js — Unbilled Item Calibration
// PHP columns: Sr no, BRN, LRN, Inward No, Name, Id no, Serial no,
//              Calibration Method, Customer, Status

import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export const columns = [
  // Sr. No
  columnHelper.display({
    id: "s_no",
    header: "Sr No",
    cell: (info) => info.row.index + 1,
  }),

  // BRN — PHP: $rowitem['bookingrefno']
  columnHelper.accessor("bookingrefno", {
    id: "bookingrefno",
    header: "BRN",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // LRN — PHP: $rowitem['lrn']
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-400">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // Inward No — PHP: $rowitem['inwardid']
  columnHelper.accessor("inwardid", {
    id: "inwardid",
    header: "Inward No",
    cell: (info) => (
      <span className="dark:text-dark-300 font-mono text-xs text-gray-600">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // Name — PHP: $rowitem['name']
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (info) => info.getValue() || "—",
  }),

  // Id No — PHP: $rowitem['idno']
  columnHelper.accessor("idno", {
    id: "idno",
    header: "Id No",
    cell: (info) => info.getValue() || "—",
  }),

  // Serial No — PHP: $rowitem['serialno']
  columnHelper.accessor("serialno", {
    id: "serialno",
    header: "Serial No",
    cell: (info) => info.getValue() || "—",
  }),

  // Calibration Method — PHP: selectfield("calibrationmethods","name",'id',$rowitem['sop'])
  columnHelper.accessor("calibrationmethod", {
    id: "calibrationmethod",
    header: "Calibration Method",
    cell: (info) => (
      <span className="dark:text-dark-200 block max-w-xs text-sm leading-snug text-gray-700">
        {info.getValue() || "—"}
      </span>
    ),
  }),

  // Customer — PHP: selectfield("customers","name",'id',$row['customerid'])
  columnHelper.accessor("customername", {
    id: "customername",
    header: "Customer",
    cell: (info) => info.getValue() || "—",
  }),

  // Status — PHP: empty($rowitem['invoice']) → Pending | else Billed
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
