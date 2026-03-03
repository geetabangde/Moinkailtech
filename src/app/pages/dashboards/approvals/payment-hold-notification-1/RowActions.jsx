import { useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

// PHP: button shown only if perm 404
function usePermissions() {
  return localStorage.getItem("userPermissions")?.split(",").map(Number) || [];
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function RequestModal({ row, onClose, onSuccess }) {
  const [comment,     setComment]     = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const inputRef = useRef(null);

  const requestId   = row.original.request_id;  // paymentapprovalrequest.id
  const trfId       = row.original.trf ?? row.original.id;
  const customerName = row.original.customername ?? "—";

  // POST /approvals/submit-bd-payment-request
  // PHP: insertbdrequest.php — receives requestid + requestcomment
  const handleSubmit = useCallback(async () => {
    if (!comment.trim()) {
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/approvals/submit-bd-payment-request", {
        id:             requestId,
        trf:            trfId,
        requestcomment: comment.trim(),
      });
      toast.success("Request submitted successfully ✅");
      onSuccess();
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to submit request.";
      toast.error(msg + " ❌");
    } finally {
      setSubmitting(false);
    }
  }, [comment, requestId, trfId, onSuccess]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-dark-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-600">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-100">
            Request Without Payment Report
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-700"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-800 dark:text-dark-100">
              {customerName}
            </span>{" "}
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
              ({trfId})
            </span>
          </p>

          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Comment for Request <span className="text-red-500">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter comment…"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-dark-600 dark:bg-dark-900 dark:text-dark-100 dark:focus:ring-blue-900"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-dark-600">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-dark-600 dark:text-gray-400 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !comment.trim()}
            className={`rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-700 ${
              submitting || !comment.trim() ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RowActions ────────────────────────────────────────────────────────────────
export function RowActions({ row, table }) {
  const [modalOpen, setModalOpen] = useState(false);
  const permissions = usePermissions();

  // PHP: if (in_array(404, $permissions))
  if (!permissions.includes(404)) return null;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-700"
      >
        Request For Non Payment Report
      </button>

      {modalOpen && (
        <RequestModal
          row={row}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            table.options.meta?.deleteRow(row);
          }}
        />
      )}
    </>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};

RequestModal.propTypes = {
  row:       PropTypes.object,
  onClose:   PropTypes.func,
  onSuccess: PropTypes.func,
};