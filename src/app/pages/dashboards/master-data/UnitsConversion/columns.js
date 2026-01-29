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
  // ✅ Select Checkbox
  columnHelper.display({
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  }),

  // ✅ ID
  columnHelper.accessor("id", {
    id: "id",
    header: "ID",
    cell: (info) => info.getValue(),
  }),

  // ✅ From Value
  columnHelper.accessor("fromValue", {
    id: "fromValue",
    header: "From Value",
    cell: (info) => info.getValue(),
  }),

  // ✅ From Unit
  columnHelper.accessor("from", {
    id: "from",
    header: "From Unit",
    cell: (info) => info.getValue(),
  }),

  // ✅ To Value
  columnHelper.accessor("toValue", {
    id: "toValue",
    header: "To Value",
    cell: (info) => info.getValue(),
  }),

  // ✅ To Unit
  columnHelper.accessor("to", {
    id: "to",
    header: "To Unit",
    cell: (info) => info.getValue(),
  }),

  // ✅ Actions
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: RowActions,
  }),
];