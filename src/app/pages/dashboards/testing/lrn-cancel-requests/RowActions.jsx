// Import Dependencies
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useCallback, useState } from "react";
import PropTypes from "prop-types";

// Local Imports
import axios from "utils/axios";
import { toast } from "sonner";

// ----------------------------------------------------------------------

// ─── Approve/Reject Modal ────────────────────────────────────────────────────

function ApproveRejectModal({ show, onClose, row, table }) {
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const reason = row?.original?.reason ?? row?.original?.Reason ?? "";
  const revrequestid = row?.original?.id ?? row?.original?.ID;

  const handleAction = useCallback(
    async (type) => {
      if (!revrequestid) return;
      setLoading(true);

      const endpoint =
        type === "approve"
          ? "/testing/approve-testing-lrnrequest"
          : "/testing/reject-testing-lrnrequest";

      const payload = {
        revrequestid,
        type,
        reason,
        remark,
      };

      try {
        await axios.post(endpoint, payload);

        toast.success(
          type === "approve"
            ? "Request approved successfully ✅"
            : "Request rejected ❌",
          { duration: 2000 }
        );

        table.options.meta?.refreshData?.();
        onClose();
        setRemark("");
      } catch (error) {
        console.error(`${type} failed:`, error);
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          `Failed to ${type} request`;
        toast.error(`${errorMessage}`, { duration: 2500 });
      } finally {
        setLoading(false);
      }
    },
    [revrequestid, reason, remark, table, onClose]
  );

  const handleClose = () => {
    if (loading) return;
    setRemark("");
    onClose();
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-[200]" onClose={handleClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <DialogPanel className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-dark-800">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-600">
                <DialogTitle className="text-base font-semibold text-gray-800 dark:text-dark-100">
                  Approve Revision Request
                </DialogTitle>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 dark:hover:bg-dark-600 dark:hover:text-dark-200"
                >
                  <XCircleIcon className="size-5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 px-6 py-5">
                {/* Reason to Cancel — read-only */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                    Reason to Cancel
                  </label>
                  <textarea
                    readOnly
                    value={reason}
                    rows={3}
                    className="w-full resize-none rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </div>

                {/* Remark — user input */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                    Remark
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={3}
                    placeholder="Reason For Accept / Reject"
                    disabled={loading}
                    className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-60 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100 dark:placeholder:text-dark-400"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-dark-600">
                <button
                  onClick={() => handleAction("reject")}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                >
                  {loading ? (
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
                    </svg>
                  ) : (
                    <XCircleIcon className="size-4" />
                  )}
                  Reject
                </button>
                <button
                  onClick={() => handleAction("approve")}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
                >
                  {loading ? (
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
                    </svg>
                  ) : (
                    <CheckCircleIcon className="size-4" />
                  )}
                  Approve
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

ApproveRejectModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  row: PropTypes.object,
  table: PropTypes.object,
};

// ─── Row Actions ─────────────────────────────────────────────────────────────

export function RowActions({ row, table }) {
  const [approveRejectOpen, setApproveRejectOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center">
        <button
          onClick={() => setApproveRejectOpen(true)}
          className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 active:bg-emerald-700"
        >
          Approve/Reject
        </button>
      </div>

      <ApproveRejectModal
        show={approveRejectOpen}
        onClose={() => setApproveRejectOpen(false)}
        row={row}
        table={table}
      />
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};