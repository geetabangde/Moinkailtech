import { useState, useEffect } from "react";
import axios from "utils/axios";
import { toast } from "react-hot-toast";

export default function ApproveRejectModal({
  open,
  onClose,
  revRequestId,
  initialReason = "",
  initialRemark = "",
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setReason(initialReason);
      setRemark(initialRemark);
    }
  }, [open, initialReason, initialRemark]);

  if (!open) return null;

  const handleAction = async (actionType) => {
    if (!reason || !remark) {
      toast.error("Reason and Remark are required");
      return;
    }

    setLoading(true);
    try {
      const url =
        actionType === "approve"
          ? "/calibrationoperations/approve-rev-requests"
          : "/calibrationoperations/reject-rev-requests";

      await axios.post(url, {
        revrequestid: revRequestId,
        reason,
        remark,
      });

      toast.success(
        actionType === "approve"
          ? "Revision Approved Successfully"
          : "Revision Rejected Successfully"
      );

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Approve / Reject Revision Request
          </h2>
          <button onClick={onClose} className="text-xl">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Reason</label>
            <textarea
              rows={3}
              className="w-full border rounded p-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Remark</label>
            <textarea
              rows={3}
              className="w-full border rounded p-2"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={() => handleAction("reject")}
            className="px-4 py-2 rounded text-white bg-red-600"
          >
            Reject
          </button>

          <button
            disabled={loading}
            onClick={() => handleAction("approve")}
            className="px-4 py-2 rounded text-white bg-green-600"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
