// Import Dependencies
import { useNavigate } from "react-router";
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";

// Local Imports
import { ConfirmModal } from "components/shared/ConfirmModal";

// ----------------------------------------------------------------------

const PERMISSIONS = [263, 264, 265, 266]; // Replace with real auth

const confirmDeleteMessages = {
  pending: {
    description:
      "Are you sure you want to delete this test price? This cannot be undone.",
  },
  success: { title: "Test Price Deleted" },
};

export function RowActions({ row, table }) {
  const navigate = useNavigate();
  const { id } = row.original;

  const canEdit = PERMISSIONS.includes(266);
  const canDelete = PERMISSIONS.includes(265);
  const canClone = PERMISSIONS.includes(264);

  // ── Delete ──────────────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/sales/delete-test-package/${id}`);
      setDeleteSuccess(true);
      toast.success("Test price deleted ✅");
      setTimeout(() => {
        setDeleteOpen(false);
        table.options.meta?.deleteRow(row);
      }, 800);
    } catch {
      setDeleteError(true);
      toast.error("Failed to delete test price");
    } finally {
      setDeleteLoading(false);
    }
  }, [id, row, table]);

  // ── Clone — data fetch karo, phir EditTestPackage pe navigate karo ──────
  // Route: /dashboards/sales/test-packages/clone/:id
  // EditTestPackage pe `isClone` flag hoga → Save pe add API call hogi
  const [cloneLoading, setCloneLoading] = useState(false);

  const handleClone = useCallback(async () => {
    setCloneLoading(true);
    try {
      // Existing record ka data fetch karo
      const res = await axios.get(`/sales/get-test-package-byid/${id}`);
      const d = res.data.data ?? res.data.package ?? res.data ?? null;
      if (!d) {
        toast.error("Failed to fetch package data");
        return;
      }
      // Clone page pe navigate karo — id pass karo taaki data load ho sake
      navigate(`/dashboards/sales/test-packages/clone/${id}`);
    } catch {
      toast.error("Failed to load package for cloning");
    } finally {
      setCloneLoading(false);
    }
  }, [id, navigate]);

  const deleteState = deleteError
    ? "error"
    : deleteSuccess
      ? "success"
      : "pending";

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {canEdit && (
          <button
            onClick={() =>
              navigate(`/dashboards/sales/test-packages/edit/${id}`)
            }
            className="rounded bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600"
          >
            Edit
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => {
              setDeleteOpen(true);
              setDeleteError(false);
              setDeleteSuccess(false);
            }}
            className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
          >
            Delete
          </button>
        )}
        {canClone && (
          <button
            onClick={handleClone}
            disabled={cloneLoading}
            className="rounded bg-orange-500 px-3 py-1 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {cloneLoading ? "Loading…" : "Clone"}
          </button>
        )}
      </div>

      <ConfirmModal
        show={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        messages={confirmDeleteMessages}
        onOk={handleDelete}
        confirmLoading={deleteLoading}
        state={deleteState}
      />
    </>
  );
}

RowActions.propTypes = {
  row: PropTypes.object,
  table: PropTypes.object,
};
