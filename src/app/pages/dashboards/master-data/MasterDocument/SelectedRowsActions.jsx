import { Button } from "components/ui";
import { HiTrash } from "react-icons/hi";
import clsx from "clsx";

export function SelectedRowsActions({ table }) {
  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const { deleteRows } = table.options.meta;

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    // Check if all selected rows can be deleted (status = -1, 0, or 1)
    const canDeleteAll = selectedRows.every((row) => {
      const status = Number(row.original.status);
      return status === -1 || status === 0 || status === 1;
    });

    if (!canDeleteAll) {
      alert(
        "Some selected documents cannot be deleted. Only documents in Saved, Pending Review, or Pending Approval status can be deleted."
      );
      return;
    }

    await deleteRows(selectedRows);
    table.resetRowSelection();
  };

  if (!hasSelection) return null;

  return (
    <div
      className={clsx(
        "flex items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-dark-600 dark:bg-dark-800",
        "transition-all duration-200 ease-in-out"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedRows.length} {selectedRows.length === 1 ? "document" : "documents"} selected
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => table.resetRowSelection()}
        >
          Clear Selection
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="flat"
          color="error"
          onClick={handleBulkDelete}
          className="flex items-center gap-2"
        >
          <HiTrash className="h-4 w-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
}