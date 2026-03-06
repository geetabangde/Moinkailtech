import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

// PHP: if (in_array(404, $permissions)) → show button
function usePermissions() {
  return localStorage.getItem("userPermissions")?.split(",").map(Number) || [];
}

// ── Modal Component ────────────────────────────────────────────────────────────
// PHP: requestcalibpaymentapproval.php
//   - Fetches calibrationpaymentapprovalrequest by id
//   - Form: hidden inwardid + requestcomment input
//   - Submit → insertPaymentRequestCalib.php (sendForm)
// React: GET /approvals/get-request-for-nonPayment-report/{id} to prefill,
//        POST /approvals/send-request-nonpayment to submit
function NonPaymentReportModal({ requestId, inwardId, customerName, onClose, onSuccess }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // PHP: sendForm → insertPaymentRequestCalib.php
  // API: POST /approvals/send-request-nonpayment
  const handleSubmit = useCallback(async () => {
    if (!comment.trim()) {
      toast.warning("Please enter a comment.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/approvals/send-request-nonpayment", {
        id:             requestId,   // calibrationpaymentapprovalrequest.id
        inwardid:       inwardId,    // hidden field in PHP form
        requestcomment: comment,
      });
      toast.success("Request sent successfully ✅");
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to send request.";
      toast.error(msg + " ❌");
    } finally {
      setLoading(false);
    }
  }, [requestId, inwardId, comment, onClose, onSuccess]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-dark-800">
        {/* Header — PHP: <legend>{customername} ({inwardid})</legend> */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-600">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-100">
              Request Without Payment Report
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-400">
              {customerName} ({inwardId})
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — PHP form fields */}
        <div className="px-5 py-4">
          {/* PHP: <input type="hidden" name="inwardid" value="..."/> — handled in state */}

          {/* PHP: Comment for Request → <input type="text" name="requestcomment" required /> */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700 dark:text-dark-200">
              Comment for Request <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter request comment…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>

        {/* Footer — PHP: id="modalsubmit" */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-dark-600">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
          {/* PHP: onclick="sendForm(..., 'insertPaymentRequestCalib.php', ...)" */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700 ${
              loading ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {loading ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

NonPaymentReportModal.propTypes = {
  requestId:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  inwardId:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  customerName: PropTypes.string,
  onClose:      PropTypes.func,
  onSuccess:    PropTypes.func,
};

// ── RowActions ─────────────────────────────────────────────────────────────────
export function RowActions({ row, table }) {
  const [modalOpen, setModalOpen] = useState(false);
  const permissions = usePermissions();

  const requestId   = row.original.id;           // calibrationpaymentapprovalrequest.id
  const inwardId    = row.original.inwardid;     // inwardentry.id
  const customerName = row.original.customername ?? "";

  // PHP: if (in_array(404, $permissions)) → show button
  const canRequest = permissions.includes(404);

  if (!canRequest) return null;

  return (
    <>
      {/* PHP: <input type='button' class='btn btn-danger' value='Request For Non Payment Report'
               onclick='dynamicmodal("id", "requestcalibpaymentapproval.php", "", "Request Without Payment Report")'/> */}
      <button
        onClick={() => setModalOpen(true)}
        className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-700 whitespace-nowrap"
      >
        Request For Non Payment Report
      </button>

      {modalOpen && (
        <NonPaymentReportModal
          requestId={requestId}
          inwardId={inwardId}
          customerName={customerName}
          onClose={() => setModalOpen(false)}
          onSuccess={() => table.options.meta?.deleteRow(row)}
        />
      )}
    </>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};