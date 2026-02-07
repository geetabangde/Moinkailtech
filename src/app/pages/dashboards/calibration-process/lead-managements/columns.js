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

  // ✅ Serial number column
  columnHelper.accessor((_row, index) => index + 1, {
    id: "serialNumber",
    header: "S.No.",
    cell: (info) => info.row.index + 1,
  }),

  // ✅ Customer Name (mapped from API's "customername")
  columnHelper.accessor("customerName", {
    id: "customerName",
    header: "Customer Name",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ LRN
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Booking Ref No
  columnHelper.accessor("bookingRefNo", {
    id: "bookingRefNo",
    header: "Booking Ref No",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Instrument Name
  columnHelper.accessor("name", {
    id: "instrumentName",
    header: "Instrument Name",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Make
  columnHelper.accessor("make", {
    id: "make",
    header: "Make",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Model
  columnHelper.accessor("model", {
    id: "model",
    header: "Model",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Serial Number
  columnHelper.accessor("serialNo", {
    id: "serialNo",
    header: "Serial No",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ ID Number
  columnHelper.accessor("idNo", {
    id: "idNo",
    header: "ID No",
    cell: (info) => info.getValue() || "-",
  }),

  // ✅ Due Date (mapped from API's "duedate")
  columnHelper.accessor("dueDate", {
    id: "dueDate",
    header: "Due Date",
    cell: (info) => {
      const value = info.getValue();
      if (!value) return "-";
      
      // Format date if needed (currently API returns YYYY-MM-DD)
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return value;
      }
    },
  }),

  // ✅ Added On
  columnHelper.accessor("addedOn", {
    id: "addedOn",
    header: "Added On",
    cell: (info) => {
      const value = info.getValue();
      if (!value) return "-";
      
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return value;
      }
    },
  }),

  // ✅ Invoice
  columnHelper.accessor("invoice", {
    id: "invoice",
    header: "Invoice",
    cell: (info) => {
      const value = info.getValue();
      return value && value !== 0 ? value : "-";
    },
  }),

  // ✅ Actions
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: RowActions,
  }),
];