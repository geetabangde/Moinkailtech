import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

export function RowActions({ row, table }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const id     = row.original.id;         // pendingsignatures.id
  const trfpid = row.original.trfproduct; // trfProducts.id

  // POST /approvals/approve-signatures { id }
  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post("/approvals/approve-signatures", { id });
      toast.success("Signature Approved Successfully ✅");
      table.options.meta?.deleteRow(row);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to approve signature. ❌");
    } finally {
      setLoading(false);
    }
  }, [id, row, table]);

  // Navigate to report detail page
  const handleViewReport = useCallback(() => {
    navigate(
      `/dashboards/approvals/ApproveSignatureReport/${trfpid}?sid=${id}`
    );
  }, [navigate, trfpid, id]);

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleApprove}
        disabled={loading}
        className={`rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-700 ${
          loading ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        {loading ? "Approving…" : "Approve"}
      </button>

      <button
        onClick={handleViewReport}
        className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-blue-700"
      >
        View Report
      </button>
    </div>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};