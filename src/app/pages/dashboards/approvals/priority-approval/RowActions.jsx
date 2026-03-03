import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

export function RowActions({ row, table }) {
  const [loading, setLoading] = useState(false);

  // POST /approvals/approve-priority/{id}
  // PHP: sets approval=1, closes notification "Approve Priority"
  const handleApprove = useCallback(async () => {
    const id = row.original.id;
    setLoading(true);
    try {
      await axios.post(`/approvals/approve-priority/${id}`);
      toast.success("Priority approved successfully ✅");
      // Remove row from list after approval
      table.options.meta?.deleteRow(row);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to approve priority.";
      toast.error(msg + " ❌");
    } finally {
      setLoading(false);
    }
  }, [row, table]);

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className={`rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-700 ${
        loading ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      {loading ? "Approving…" : "Approve Priority Testing"}
    </button>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};