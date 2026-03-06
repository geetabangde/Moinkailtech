// Import Dependencies
import { createColumnHelper } from "@tanstack/react-table";

// Local Imports
import { RowActions } from "./RowActions";
import { SelectCell, SelectHeader } from "components/shared/table/SelectCheckbox";

const columnHelper = createColumnHelper();

// PHP: str_replace(",", "<br/>", group_concat(...)) → stacked spans
function MultiLine({ value }) {
  if (!value) return <span className="text-gray-400">—</span>;
  const parts = String(value).split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
  if (parts.length === 1) return <span>{parts[0]}</span>;
  return (
    <div className="flex flex-col gap-0.5">
      {parts.map((v, i) => (
        <span key={i}>{v}</span>
      ))}
    </div>
  );
}

export const columns = [
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),

  // PHP: $n[] = $row['id'];  (calibrationpaymentapprovalrequest.id)
  // DataTable order: [[0, "desc"]] → order by inwardentry.id desc
  columnHelper.accessor("id", {
    id: "id",
    header: "Inward Entry No",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // PHP: $n[] = changedateformatespecito($row['inwarddate'], "Y-m-d", "d/m/Y");
  columnHelper.accessor("inwarddate", {
    id: "inwarddate",
    header: "Date",
    cell: (info) => info.getValue() ?? "—",
  }),

  // PHP: $n[] = $row['customername'];
  columnHelper.accessor("customername", {
    id: "customername",
    header: "Customer",
    cell: (info) => info.getValue() ?? "—",
  }),

  // PHP: $n[] = concat(firstname,' ',lastname) from admin where id=inwardentry.bd
  columnHelper.accessor("bdName", {
    id: "bdName",
    header: "BD",
    cell: (info) => info.getValue() ?? "—",
  }),

  // PHP: $n[] = str_replace(",", "<br/>", group_concat(bookingrefno)) from crfinstrument{suffix}
  columnHelper.accessor("brn", {
    id: "brn",
    header: "BRN Nos",
    cell: (info) => (
      <div className="font-mono text-xs">
        <MultiLine value={info.getValue()} />
      </div>
    ),
  }),

  // PHP: $n[] = str_replace(",", "<br/>", group_concat(lrn)) from crfinstrument{suffix}
  columnHelper.accessor("lrn", {
    id: "lrn",
    header: "LRN Nos",
    cell: (info) => (
      <div className="font-mono text-xs">
        <MultiLine value={info.getValue()} />
      </div>
    ),
  }),

  // PHP: $n[] = $row['requestcomment'];
  columnHelper.accessor("requestcomment", {
    id: "requestcomment",
    header: "Request Comment",
    cell: (info) => (
      <span className="block max-w-xs truncate" title={info.getValue()}>
        {info.getValue() ?? "—"}
      </span>
    ),
  }),

  // PHP: $n[] = changedateformatespecito($row['requested_on'], "Y-m-d H:i:s", "d/m/Y H:i:s");
  columnHelper.accessor("requestedon", {
    id: "requestedon",
    header: "Requested On",
    cell: (info) => info.getValue() ?? "—",
  }),

  // PHP: $n[] = concat(firstname,' ',lastname) from admin where id=requested_by
  columnHelper.accessor("requestedBy", {
    id: "requestedBy",
    header: "Requested By",
    cell: (info) => info.getValue() ?? "—",
  }),

  // PHP: if (in_array(409, $permissions)) → show "Approve Non-Payment" button
  columnHelper.display({
    id: "actions",
    header: "Action",
    cell: RowActions,
  }),
];