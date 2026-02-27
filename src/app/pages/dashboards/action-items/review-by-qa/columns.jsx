// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import {
  SelectCell,
  SelectHeader,
} from "components/shared/table/SelectCheckbox";

// PHP: permissions checked at render time — columns gated by perm 358/389/390
// are handled via columnVisibility + meta.permissions in RowActions
const columnHelper = createColumnHelper();

export const columns = [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),

  // Sr No — PHP: $i++
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

  // Product — PHP: $row['pname']
  columnHelper.accessor("pname", {
    id: "product",
    header: "Product",
    cell: (info) => (
      <span className="max-w-[200px] text-sm font-medium text-gray-800 dark:text-gray-100">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Main Customer — PHP: if(in_array(358, $permissions)) $n[] = $row['customername']
  columnHelper.accessor("customername", {
    id: "main_customer",
    header: "Main Customer",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Report Customer — PHP: $row['reportname'] comma→<br/>
  columnHelper.accessor("reportname", {
    id: "report_customer",
    header: "Report Customer",
    cell: (info) => {
      const val = info.getValue();
      if (!val) return "—";
      // API returns pre-resolved name string (comma-separated)
      return (
        <span className="whitespace-pre-line text-sm">
          {val.replace(/,/g, "\n")}
        </span>
      );
    },
  }),

  // LRN — PHP: $row['lrn']
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // BRN — PHP: $row['brn']
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // ULR — PHP: $row['ulr']
  columnHelper.accessor("ulr", {
    id: "ulr",
    header: "ULR",
    cell: (info) => (
      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Grade/Size — PHP: grades.name + "/" + sizes.name
  columnHelper.accessor("grade_size", {
    id: "grade_size",
    header: "Grade/Size",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Department — PHP: labs.name where id=hodrequests.department
  columnHelper.accessor("department_name", {
    id: "department",
    header: "Department",
    cell: (info) => (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Customer Type — PHP: if(in_array(389, $permissions)) customertypes.name
  columnHelper.accessor("customer_type", {
    id: "customer_type",
    header: "Customer Type",
    cell: (info) => info.getValue() ?? "—",
  }),

  // Specific Purpose — PHP: if(in_array(390, $permissions)) specificpurposes.name
  columnHelper.accessor("specific_purpose", {
    id: "specific_purpose",
    header: "Specific Purpose",
    cell: (info) => (
      <span className="text-xs text-gray-600 dark:text-gray-300">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // Action — PHP status=8: "Review By QA" → testreport.php?hakuna={tid}&what={hid}
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];