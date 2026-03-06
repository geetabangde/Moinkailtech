import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

// PHP: if (in_array(409, $permissions)) → show button
function usePermissions() {
  return localStorage.getItem("userPermissions")?.split(",").map(Number) || [];
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
// PHP: view(id, "catid", "approvecalibrationpaymentrequest.php", "Approve Approval")
// approvecalibrationpaymentrequest.php:
//   UPDATE calibrationpaymentapprovalrequest SET status=2, updated_on=NOW(), updated_by=$employeeid
//   echo "Reload : Payment Approved";
function ConfirmModal({ customerName, inwardId, onConfirm, onClose, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-lg bg-white shadow-xl dark:bg-dark-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-dark-600">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-dark-100">
            Approve Approval
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            {/* Warning Icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                Approve Non-Payment?
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-dark-400">
                {/* PHP: sets status=2, updated_on, updated_by */}
                This will approve the non-payment request for{" "}
                <span className="font-semibold text-gray-700 dark:text-dark-200">
                  {customerName}
                </span>{" "}
                (ID: {inwardId}). This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-dark-600">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
          {/* PHP: UPDATE calibrationpaymentapprovalrequest SET status=2 */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-md bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-700 ${
              loading ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {loading ? "Approving…" : "Yes, Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  customerName: PropTypes.string,
  inwardId:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onConfirm:    PropTypes.func,
  onClose:      PropTypes.func,
  loading:      PropTypes.bool,
};

// ── RowActions ─────────────────────────────────────────────────────────────────
export function RowActions({ row, table }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const permissions = usePermissions();

  // PHP: calibrationpaymentapprovalrequest.id  (used in UPDATE & API path)
  const id           = row.original.id;
  const customerName = row.original.customername ?? "";
  const inwardId     = row.original.inwardid ?? id;

  // PHP: if (in_array(409, $permissions))
  const canApprove = permissions.includes(409);

  // PHP: UPDATE calibrationpaymentapprovalrequest
  //        SET status=2, updated_on=NOW(), updated_by=$employeeid
  //      echo "Reload : Payment Approved";
  // API: POST /approvals/approve-calibration-nonpayment/{id}
  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post(`/approvals/approve-calibration-nonpayment/${id}`);
      toast.success("Payment Approved ✅");
      table.options.meta?.deleteRow(row);
      setModalOpen(false);
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Failed to approve.";
      toast.error(msg + " ❌");
    } finally {
      setLoading(false);
    }
  }, [id, row, table]);

  if (!canApprove) return null;

  return (
    <>
      {/* PHP: <input type='button' class='btn btn-danger' value='Approve Non-Payment'
               onclick='view(id, "catid", "approvecalibrationpaymentrequest.php", "Approve Approval")'/> */}
      <button
        onClick={() => setModalOpen(true)}
        className="whitespace-nowrap rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-red-700"
      >
        Approve Non-Payment
      </button>

      {modalOpen && (
        <ConfirmModal
          customerName={customerName}
          inwardId={inwardId}
          loading={loading}
          onConfirm={handleApprove}
          onClose={() => !loading && setModalOpen(false)}
        />
      )}
    </>
  );
}

RowActions.propTypes = {
  row:   PropTypes.object,
  table: PropTypes.object,
};