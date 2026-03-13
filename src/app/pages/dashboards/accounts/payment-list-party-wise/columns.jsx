// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";

// ----------------------------------------------------------------------

const columnHelper = createColumnHelper();

const fmt = (n) =>
  parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

export const columns = [
  columnHelper.accessor((_row, i) => i + 1, {
    id: "s_no",
    header: "Sr. No",
    cell: (info) => info.row.index + 1,
  }),

  columnHelper.accessor("custname", {
    id: "custname",
    header: "Customer Name",
    cell: (info) => (
      <span className="dark:text-dark-100 font-medium text-gray-800">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("debit", {
    id: "debit",
    header: "Total Billing",
    cell: (info) => (
      <span className="font-medium">₹{fmt(info.getValue())}</span>
    ),
  }),

  columnHelper.accessor("credit", {
    id: "credit",
    header: "Received Amount",
    cell: (info) => (
      <span className="font-medium text-green-700 dark:text-green-400">
        ₹{fmt(info.getValue())}
      </span>
    ),
  }),

  columnHelper.accessor("balance", {
    id: "balance",
    header: "Remaining Amount",
    cell: (info) => {
      const val = parseFloat(info.getValue() || 0);
      return (
        <span
          className={
            val > 0
              ? "font-semibold text-red-600 dark:text-red-400"
              : val < 0
                ? "font-semibold text-orange-500 dark:text-orange-400"
                : "font-semibold text-green-600 dark:text-green-400"
          }
        >
          ₹{fmt(val)}
        </span>
      );
    },
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (props) => <RowActions row={props.row} />,
  }),
];
