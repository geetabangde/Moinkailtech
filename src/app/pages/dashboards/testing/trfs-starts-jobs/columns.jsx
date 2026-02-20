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
  columnHelper.accessor((_row, index) => index + 1, {
    id: "s_no",
    header: "S No",
    cell: (info) => info.row.index + 1,
  }),

  // ✅ ID
  columnHelper.accessor("id", {
    id: "id",
    header: "TRF Inward Entry No",
    cell: (info) => info.getValue(),
  }),

  // ✅ TRF Entry No
  columnHelper.accessor("trf_entry_no", {
    id: "trf_entry_no",
    header: "TRF Entry No",
    cell: (info) => (
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {info.getValue()}
      </span>
    ),
  }),

  // ✅ Date
  columnHelper.accessor("date", {
    id: "date",
    header: "Date",
    cell: (info) => {
      const date = info.getValue();
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  }),

  // ✅ Customer
  columnHelper.accessor("customername", {  // यह field है JSON में
    id: "customer",
    header: "Customer",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  // ✅ Products
  columnHelper.accessor("products_display", {  // Processed field
    id: "products",
    header: "Products",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  // ✅ BRN Nos
  columnHelper.accessor("brn_nos_display", {  // Processed field
    id: "brn_nos",
    header: "BRN Nos",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  // ✅ LRN Nos
  columnHelper.accessor("lrn_nos_display", {  // Processed field
    id: "lrn_nos",
    header: "LRN Nos",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  // ✅ Grades
  columnHelper.accessor("grades_display", {  // Processed field
    id: "grades",
    header: "Grades",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  // ✅ Sizes
  columnHelper.accessor("sizes_display", {  // Processed field
    id: "sizes",
    header: "Sizes",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  // ✅ PO Number
  columnHelper.accessor("ponumber", {  // JSON में "ponumber" है
    id: "po_number",
    header: "PO Number",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Report Name
  columnHelper.accessor("reportname", {  // JSON में "reportname" है
    id: "report_name",
    header: "Report Name",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  
  columnHelper.accessor("customer_type_display", {  // Processed field
    id: "customer_type",
    header: "Customer Type",
    cell: (info) => (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {info.getValue() || "-"}
      </span>
    ),
  }),


  columnHelper.accessor("specific_purpose_display", {  // Processed field
    id: "specific_purpose",
    header: "Specific Purpose",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  // ✅ BD (Business Development)
  columnHelper.accessor("bd", {
    id: "bd",
    header: "BD",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Remarks
  columnHelper.accessor("reviewremark", { 
    id: "remarks",
    header: "Remarks",
    cell: (info) => (
      <div className="max-w-xs truncate" title={info.getValue()}>
        {info.getValue() || "-"}
      </div>
    ),
  }),

  // ✅ Status
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      let statusText = "Unknown";
      let bgColor = "bg-gray-100";
      let textColor = "text-gray-800";
      
      switch(status) {
        case 0:
          statusText = "Pending For Submit Review";
          bgColor = "bg-yellow-100";
          textColor = "text-yellow-800";
          break;
        case 1:
          statusText = "Pending For Review";
          bgColor = "bg-orange-100";
          textColor = "text-orange-800";
          break;
        case 4:
        case 5:
        case 9:
          statusText = "Completed";
          bgColor = "bg-green-100";
          textColor = "text-green-800";
          break;
        case 98:
          statusText = "Pending For Approvals";
          bgColor = "bg-blue-100";
          textColor = "text-blue-800";
          break;
        default:
          statusText = `Status ${status}`;
      }
      
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor} dark:${bgColor.replace('100', '900')} dark:${textColor.replace('800', '200')}`}>
          {statusText}
        </span>
      );
    },
  }),

  // ✅ Actions
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: RowActions,
  }),
];