// Import Dependencies
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { useState } from "react";

// ----------------------------------------------------------------------
// PHP status=8: "Review By QA" → testreport.php?hakuna={tid}&what={hid}
// React:        navigate to /dashboards/action-items/qa-review/{id}?hid={hodid}
//
// Additional actions surfaced from API contracts:
//   POST /actionitem/approve-submit-ulr  { hid }   → approve the ULR submission
//   GET  /actionitem/request-reset/{id}            → request a reset on the item
// ----------------------------------------------------------------------

export function RowActions({ row, table }) {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(null); // "approve" | "reset" | null

  const original = row.original;
  const tid = original.id;          // trfProducts.id  (hakuna)
  const hid = original.hodid;       // hodrequests.id  (what)

  // ── Review By QA ──────────────────────────────────────────────────────────
  // PHP: href="testreport.php?hakuna={tid}&what={hid}"
  const handleReview = () => {
    navigate(`/dashboards/action-items/qa-review/${tid}?hid=${hid}`);
  };

  // ── Approve / Submit ULR ─────────────────────────────────────────────────
  // POST /actionitem/approve-submit-ulr  { hid }
  const handleApproveUlr = async () => {
    try {
      setLoading("approve");
      await axios.post("/actionitem/approve-submit-ulr", { hid });
      table?.options?.meta?.refreshData?.();
    } catch (err) {
      console.error("approve-submit-ulr failed:", err);
    } finally {
      setLoading(null);
    }
  };

  // ── Request Reset ─────────────────────────────────────────────────────────
  // GET /actionitem/request-reset/{id}   (id = trfProducts.id)
  const handleRequestReset = async () => {
    try {
      setLoading("reset");
      await axios.get(`/actionitem/request-reset/${tid}`);
      table?.options?.meta?.refreshData?.();
    } catch (err) {
      console.error("request-reset failed:", err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      {/* Primary CTA — Review By QA */}
      <button
        onClick={handleReview}
        className="rounded bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1 disabled:opacity-60"
      >
        Review By QA
      </button>

      {/* Approve / Submit ULR */}
      <button
        onClick={handleApproveUlr}
        disabled={loading === "approve"}
        className="rounded border border-green-500 px-4 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-60 dark:hover:bg-green-900/20"
      >
        {loading === "approve" ? "Submitting…" : "Approve ULR"}
      </button>

      {/* Request Reset */}
      <button
        onClick={handleRequestReset}
        disabled={loading === "reset"}
        className="rounded border border-amber-400 px-4 py-1.5 text-xs font-semibold text-amber-600 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-60 dark:hover:bg-amber-900/20"
      >
        {loading === "reset" ? "Requesting…" : "Request Reset"}
      </button>
    </div>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object.isRequired,
  table: PropTypes.object,
};