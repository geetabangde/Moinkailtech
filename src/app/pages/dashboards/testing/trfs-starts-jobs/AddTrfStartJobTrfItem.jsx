import { useState, useEffect, useCallback } from "react";
import axios from "utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import TrfItemForm from "./TrfItemForm";
import { toast } from "sonner";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Permissions from localStorage ────────────────────────────────────────────
function usePermissions() {
  return localStorage.getItem("userPermissions")?.split(",").map(Number) || [];
}

// ── Action Buttons — PHP trfitems.php logic exact match ──────────────────────
function ActionCell({ row, onEdit, onDelete, onCancelLRN, trfId }) {
  const permissions = usePermissions();
  const tid = row.id;
  const trfstatus = Number(row.status);
  const packtype = Number(row.pack_type ?? 1); // 0 = upload type, else test report
  const reportid = row.report ?? 0;

  // ── PHP: if ($trfstatus == 99) → "LRN Cancled"
  if (trfstatus === 99) {
    return (
      <span className="text-xs italic text-gray-400">LRN Cancelled</span>
    );
  }

  // ── Pending signature status check (Edit Item Detail condition)
  // PHP: $status = selectfieldwhere("pendingsignatures", ...) if status==0 or ""
  const canEditItem =
    (row.pending_signature_status === 0 || row.pending_signature_status === "" || row.pending_signature_status == null) &&
    permissions.includes(367);

  // ── Cancel LRN condition: permission 268 + no invoice + no ulr
  const canCancelLRN =
    permissions.includes(268) &&
    !row.invoice &&
    !row.ulr &&
    (row.pending_signature_status === 0 || row.pending_signature_status === "" || row.pending_signature_status == null);

  return (
    <div className="flex flex-wrap items-center gap-1.5">

      {/* ── Status 1: Remove Item + Clone ── */}
      {trfstatus === 1 && (
        <>
          <ActionBtn color="cyan" onClick={() => onDelete(tid)}>
            Remove Item
          </ActionBtn>
          <ActionBtn color="blue" onClick={() => window.location.href = `additemfromclone.php?hakuna=${tid}`}>
            Clone
          </ActionBtn>
        </>
      )}

      {/* ── Status 2: Technical Acceptance (permission 126) + Remove Item ── */}
      {trfstatus === 2 && (
        <>
          {permissions.includes(126) && (
            <ActionBtn color="blue" onClick={() => window.location.href = `technical.php?hakuna=${tid}`}>
              Technical Acceptance
            </ActionBtn>
          )}
          <ActionBtn color="cyan" onClick={() => onDelete(tid)}>
            Remove Item
          </ActionBtn>
        </>
      )}

      {/* ── Status 3: Remove Item (permission 128) ── */}
      {trfstatus === 3 && permissions.includes(128) && (
        <ActionBtn color="cyan" onClick={() => onDelete(tid)}>
          Remove Item
        </ActionBtn>
      )}

      {/* ── Status 4: PHP mein koi button nahi ── */}

      {/* ── Status 5: Perform Test (permission 7) ── */}
      {trfstatus === 5 && permissions.includes(7) && (
        <ActionBtn color="blue" onClick={() => window.location.href = `performtest.php?hakuna=${tid}`}>
          Perform Test
        </ActionBtn>
      )}

      {/* ── Status 10: Upload Report / Final Report ── */}
      {trfstatus === 10 && (
        <>
          {packtype === 0 ? (
            reportid === 0 || reportid === "0" ? (
              permissions.includes(333) && (
                <ActionBtn color="blue" onClick={() => window.location.href = `uploadreport.php?hakuna=${tid}`}>
                  Upload Report
                </ActionBtn>
              )
            ) : (
              <ActionBtn color="blue" onClick={() => window.open(row.report_link, "_blank")}>
                Final Report
              </ActionBtn>
            )
          ) : (
            <ActionBtn color="blue" onClick={() => window.location.href = `testreport.php?hakuna=${tid}`}>
              Final Report
            </ActionBtn>
          )}
        </>
      )}

      {/* ── Pending TRF Approval: jab koi status match na ho ── */}
      {![1, 2, 3, 4, 5, 10, 99].includes(trfstatus) && (
        <span className="text-xs italic text-gray-500">
          Pending TRF Approval
        </span>
      )}

      {/* ── Print Review Form — har status pe ── */}
      <ActionBtn color="blue" onClick={() => window.open(`printslip.php?hakuna=${tid}`, "_blank")}>
        Print Review Form
      </ActionBtn>

      {/* ── View Raw Data — status >= 5 ── */}
      {trfstatus >= 5 && (
        <ActionBtn color="blue" onClick={() => window.open(`viewrawdata.php?hakuna=${tid}`, "_blank")}>
          View Raw Data
        </ActionBtn>
      )}

      {/* ── Edit Item Detail — permission 367 + pending signature check ── */}
      {canEditItem && (
        <ActionBtn color="blue" onClick={() => onEdit(tid)}>
          Edit Item Detail
        </ActionBtn>
      )}

      {/* ── Cancel LRN — permission 268 + no invoice + no ulr ── */}
      {canCancelLRN && (
        <ActionBtn color="blue" onClick={() => onCancelLRN(trfId, tid)}>
          Cancel LRN
        </ActionBtn>
      )}
    </div>
  );
}

// ── Reusable button ───────────────────────────────────────────────────────────
function ActionBtn({ children, onClick, color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-500 hover:bg-blue-600",
    cyan: "bg-cyan-500 hover:bg-cyan-600",
    red: "bg-red-500 hover:bg-red-600",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-xs font-medium text-white transition ${colorMap[color] ?? colorMap.blue}`}
    >
      {children}
    </button>
  );
}

// ── Cancel LRN Modal ──────────────────────────────────────────────────────────
function CancelLRNModal({ show, trfId, trfProductId, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason for cancellation.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`testing/cancel-lrn`, {
        trf: trfId,
        trfproduct: trfProductId,
        reason,
      });
      toast.success("LRN cancelled successfully ✅");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to cancel LRN ❌");
    } finally {
      setLoading(false);
      setReason("");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h4 className="text-base font-semibold text-gray-800 dark:text-white">
            Cancel LRN
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason For Cancellation
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Reason For Accept / Reject"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TrfProductsList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trfStatus, setTrfStatus] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Cancel LRN modal state
  const [cancelLRNModal, setCancelLRNModal] = useState({
    show: false,
    trfId: null,
    trfProductId: null,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`testing/get-trf-item-list/${id}`);
      const products = response.data?.trf_products ?? [];
      setData(products);

      // ✅ Fix: trf_status top-level se lo pehle
      // Agar top-level nahi hai to pehle product ke trf_status se lo
      // Agar products bhi empty hain to alag API se TRF status fetch karo
      const topStatus =
        response.data?.trf_status ??
        response.data?.trfStatus ??
        response.data?.status ??
        (products.length > 0 ? products[0]?.trf_status : undefined);

      if (topStatus !== null && topStatus !== undefined) {
        setTrfStatus(Number(topStatus));
      } else {
        // ✅ Products empty hain (naya TRF) — alag endpoint se status lo
        try {
          const trfRes = await axios.get(`testing/get-trf-status/${id}`);
          const s = trfRes.data?.status ?? trfRes.data?.trf_status ?? null;
          if (s !== null) setTrfStatus(Number(s));
        } catch {
          // fallback — agar koi bhi API nahi hai to null rahega
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load TRF items.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchItems();
  }, [fetchItems, id]);

  const filtered = data.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [
      row.product_name,
      row.package_name,
      row.lrn,
      row.brn,
      row.ulr,
      row.grade_size,
      row.brand,
    ].some((v) =>
      String(v ?? "")
        .toLowerCase()
        .includes(q),
    );
  });

  // PHP: counter — status!=99 wale items count hote hain
  const activeItemCount = data.filter((row) => Number(row.status) !== 99).length;

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleAddNew = () => {
    setEditItemId(null);
    setShowForm(true);
  };
  const handleEdit = (itemId) => {
    setEditItemId(itemId);
    setShowForm(true);
  };

  const handleFormSuccess = (res) => {
    setShowForm(false);
    setEditItemId(null);
    fetchItems();
    if (res?.bookingrefno) {
      toast.success(
        <div>
          <p className="font-semibold">Item Added Successfully ✅</p>
          <p className="mt-0.5 text-xs text-green-700">
            BRN: <span className="font-mono font-bold">{res.bookingrefno}</span>
          </p>
        </div>,
        { duration: 4000 },
      );
    } else {
      toast.success(res?.message ?? "TRF Item added successfully", {
        duration: 3000,
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditItemId(null);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`testing/delete-trf-item/${itemId}`);
      fetchItems();
    } catch {
      alert("Failed to delete item.");
    }
  };

  const handleCancelLRN = (trfId, trfProductId) => {
    setCancelLRNModal({ show: true, trfId, trfProductId });
  };

  const handleCancelLRNClose = () => {
    setCancelLRNModal({ show: false, trfId: null, trfProductId: null });
  };

  // PHP: permission check for LRN/BRN columns
  const showLRN = permissions.includes(375);
  const showBRN = permissions.includes(376);

  const columns = [
    { key: "id", label: "ID" },
    { key: "product_name", label: "Product" },
    { key: "package_name", label: "Package" },
    ...(showLRN ? [{ key: "lrn", label: "LRN" }] : []),
    ...(showBRN ? [{ key: "brn", label: "BRN" }] : []),
    { key: "ulr", label: "ULR" },
    { key: "grade_size", label: "Grade/Size" },
    { key: "brand", label: "Brand/Source" },
  ];

  // PHP: "Add New Item" button — sirf status 0 ya 98 pe dikhta hai
  // Number() se wrap kiya — API string "0" ya null bhi handle hoga
  const trfStatusNum = trfStatus !== null && trfStatus !== undefined ? Number(trfStatus) : null;
  const canAddItem = trfStatusNum === 0 || trfStatusNum === 98;

  // PHP: "Submit For Review" — status==0 and counter>0
  const canSubmitReview = trfStatusNum === 0 && activeItemCount > 0;

  const handleSubmitForReview = async () => {
    try {
      await axios.post(`testing/submit-for-review/${id}`);
      toast.success("Submitted for review successfully ✅");
      fetchItems();
    } catch {
      toast.error("Failed to submit for review ❌");
    }
  };

  return (
    <div className="transition-content w-full pb-5">
      <div className="flex h-full w-full flex-col">
        <div className="pb-4 text-sm text-gray-700 dark:text-gray-300">

          {/* ── Header Row ── */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              TRF Products
            </h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboards/testing/trfs-starts-jobs")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
              >
                Back to TRF Entry List
              </button>

              {/* PHP: Add New Item sirf status 0 ya 98 pe */}
              {canAddItem && (
                <button
                  onClick={handleAddNew}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition ${
                    showForm && !editItemId
                      ? "bg-slate-500 hover:bg-slate-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <span className="mr-1 font-bold">
                    {showForm && !editItemId ? "✕" : "+"}
                  </span>
                  {showForm && !editItemId ? "Close Form" : "Add New Item"}
                </button>
              )}
            </div>
          </div>

          {/* ── Inline Add / Edit Form ── */}
          {showForm && (
            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <TrfItemForm
                trfId={id}
                itemId={editItemId}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {/* ── Controls Row ── */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded border border-gray-300 bg-white px-1.5 py-1 text-sm text-gray-700 outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Search:</span>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search…"
                className="w-44 rounded border border-gray-300 bg-white px-2.5 py-1 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ── Table ── */}
          <div className="table-wrapper min-w-full grow overflow-x-auto">
            <table className="w-full text-left rtl:text-right">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="border-y border-gray-200 bg-white px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="border-y border-gray-200 bg-white px-3 py-2.5 text-left text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-8 text-center text-gray-400 dark:text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
                        </svg>
                        Loading…
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-8 text-center text-gray-400 dark:text-gray-500">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-100 transition-colors dark:border-gray-800 ${
                        editItemId === row.id
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : idx % 2 === 0
                            ? "bg-white dark:bg-gray-900"
                            : "bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300">
                          {row[col.key] ?? ""}
                        </td>
                      ))}
                      <td className="min-w-[220px] px-3 py-2 align-middle">
                        <ActionCell
                          row={row}
                          trfId={id}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onCancelLRN={handleCancelLRN}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Footer ── */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalEntries === 0
                ? "Showing 0 to 0 of 0 entries"
                : `Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalEntries)} of ${totalEntries} entries`}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <span className="min-w-[36px] rounded border border-blue-500 bg-blue-50 px-3 py-1.5 text-center text-sm font-semibold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                {safeCurrentPage}
              </span>
              <button
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>

          {/* PHP: status==0 && counter>0 → Submit For Review button */}
          {canSubmitReview && (
            <button
              onClick={handleSubmitForReview}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
            >
              Submit For Review
            </button>
          )}

          {/* PHP: status==0 && counter==0 → "No Item added" */}
          {!loading && trfStatus === 0 && activeItemCount === 0 && !showForm && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              No Item added
            </p>
          )}
        </div>
      </div>

      {/* ── Cancel LRN Modal ── */}
      <CancelLRNModal
        show={cancelLRNModal.show}
        trfId={cancelLRNModal.trfId}
        trfProductId={cancelLRNModal.trfProductId}
        onClose={handleCancelLRNClose}
        onSuccess={fetchItems}
      />
    </div>
  );
}