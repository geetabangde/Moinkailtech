// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import { SelectCell, SelectHeader } from "components/shared/table/SelectCheckbox";

// PHP field mapping → API response fields:
// pname          → product_name
// customername   → customername        (perm 358)
// reportname     → reportname          (ID string — resolved by API or shown raw)
// lrn/brn/ulr    → lrn / brn / ulr
// grade+size     → grade_name / size_name
// department     → lab_name
// ctype name     → customer_type       (perm 389)
// specificpurpose→ specific_purpose    (perm 390)
// hodstatus      → hod_status
// hodid          → hod_id

const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),

  // Sr No
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "Sr No",
    enableSorting: false,
    cell: (info) => (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {info.row.index + 1}
      </span>
    ),
  }),

  // Product — API: product_name
  columnHelper.accessor("product_name", {
    id: "product",
    header: "Product",
    cell: (info) => (
      <span className="block max-w-[220px] text-sm font-medium text-gray-800 dark:text-gray-100">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Main Customer — API: customername (PHP: perm 358)
  columnHelper.accessor("customername", {
    id: "main_customer",
    header: "Main Customer",
    cell: (info) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Report Customer — API: reportname
  // PHP resolves comma-separated IDs to names via customers table.
  // Backend should return resolved name string; if numeric ID is returned, display as-is.
  columnHelper.accessor("reportname", {
    id: "report_customer",
    header: "Report Customer",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "—";
      // If API returns resolved names (comma-separated), split on comma → newline
      return (
        <span className="block whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
          {val.replace(/,/g, "\n")}
        </span>
      );
    },
  }),

  // LRN — API: lrn
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // BRN — API: brn
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ULR — API: ulr
  columnHelper.accessor("ulr", {
    id: "ulr",
    header: "ULR",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Grade/Size — API: grade_name + size_name  (PHP: grades.name + "/" + sizes.name)
  columnHelper.accessor(
    (row) => {
      const g = row.grade_name ?? "";
      const s = row.size_name  ?? "";
      if (!g && !s) return "—";
      return `${g}/${s}`;
    },
    {
      id: "grade_size",
      header: "Grade/Size",
      cell: (info) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {info.getValue()}
        </span>
      ),
    }
  ),

  // Department — API: lab_name  (PHP: labs.name where id=hodrequests.department)
  columnHelper.accessor("lab_name", {
    id: "department",
    header: "Department",
    cell: (info) => (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Customer Type — API: customer_type  (PHP: customertypes.name, perm 389)
  columnHelper.accessor("customer_type", {
    id: "customer_type",
    header: "Customer Type",
    cell: (info) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Specific Purpose — API: specific_purpose  (PHP: specificpurposes.name, perm 390)
  columnHelper.accessor("specific_purpose", {
    id: "specific_purpose",
    header: "Specific Purpose",
    cell: (info) => (
      <span className="text-xs text-gray-600 dark:text-gray-300">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Action — driven by hod_status (PHP logic reproduced in RowActions)
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];