import { useState, useEffect, useCallback } from "react";
import axios from "utils/axios";
import { useNavigate, useParams } from "react-router-dom";
import TrfItemForm from "./TrfItemForm";
import { toast } from "sonner";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Action Buttons (mirrors PHP trfitems.php logic) ──────────────────────────
function ActionCell({ row, onEdit, onDelete }) {
  // ✅ Fix 1: navigate removed from ActionCell (it belongs in main component)
  const tid = row.id;
  const status = row.status;

  if (status === 99) {
    return <span className="text-xs text-gray-400 italic">LRN Cancelled</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* ── Status == 1: Remove Item + Clone ── */}
      {status === 1 && (
        <>
          <button
            onClick={() => onDelete(tid)}
            className="rounded bg-cyan-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-cyan-600"
          >
            Remove Item
          </button>
          <a
            href={`additemfromclone.php?hakuna=${tid}`}
            className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
          >
            Clone
          </a>
        </>
      )}

      {/* ── Status == 2: Technical Acceptance + Remove Item ── */}
      {status === 2 && (
        <>
          {row.can_technical && (
            <a
              href={`technical.php?hakuna=${tid}`}
              className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
            >
              Technical Acceptance
            </a>
          )}
          <button
            onClick={() => onDelete(tid)}
            className="rounded bg-cyan-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-cyan-600"
          >
            Remove Item
          </button>
        </>
      )}

      {/* ── Status == 3: Remove Item only ── */}
      {status === 3 && row.can_delete && (
        <button
          onClick={() => onDelete(tid)}
          className="rounded bg-cyan-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-cyan-600"
        >
          Remove Item
        </button>
      )}

      {/* ── Status == 5: Perform Test ── */}
      {status === 5 && row.can_perform && (
        <a
          href={`performtest.php?hakuna=${tid}`}
          className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
        >
          Perform Test
        </a>
      )}

      {/* ── Status == 10: Upload Report / Final Report ── */}
      {status === 10 && (
        <>
          {row.pack_type === 0 ? (
            row.report == 0 ? (
              row.can_upload_report && (
                <a
                  href={`uploadreport.php?hakuna=${tid}`}
                  className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
                >
                  Upload Report
                </a>
              )
            ) : (
              <a
                href={row.report_link}
                target="_blank"
                rel="noreferrer"
                className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
              >
                Final Report
              </a>
            )
          ) : (
            <a
              href={`testreport.php?hakuna=${tid}`}
              className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
            >
              Final Report
            </a>
          )}
        </>
      )}

      {/* ── Pending TRF Approval (default) ── */}
      {![1, 2, 3, 5, 10, 99].includes(status) && (
        <span className="text-xs text-gray-500 italic">
          Pending TRF Approval
        </span>
      )}

      {/* ── Print Review Form ── */}
      <a
        href={`printslip.php?hakuna=${tid}`}
        target="_blank"
        rel="noreferrer"
        className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
      >
        Print Review Form
      </a>

      {/* ── Edit Item Detail ── */}
      {row.can_edit && (
        <button
          onClick={() => onEdit(tid)}
          className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
        >
          Edit Item Detail
        </button>
      )}

      {/* ── Cancel LRN ── */}
      {row.can_cancel_lrn && !row.invoice && !row.ulr && (
        <button
          onClick={() => handleCancelLRN(tid)}
          className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-600"
        >
          Cancel LRN
        </button>
      )}
    </div>
  );
}

function handleCancelLRN(tid) {
  alert(`Cancel LRN for item ${tid} — wire up modal here`);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TrfProductsList() {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ Fix 3: navigate moved to main component

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fix 2: proper useState with both value and setter
  const [trfStatus, setTrfStatus] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`testing/get-trf-item-list/${id}`);
      setData(response.data?.trf_products ?? []);
      if (response.data?.trf_status !== undefined) {
        setTrfStatus(response.data.trf_status);
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load TRF items.");
    } finally {
      setLoading(false);
    }
  }, [id]); // ✅ Fix 2: setTrfStatus is stable, no need in deps

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

  // Suppress unused warning — trfStatus available for future use
  void trfStatus;

  const columns = [
    { key: "id", label: "ID" },
    { key: "product_name", label: "Product" },
    { key: "package_name", label: "Package" },
    { key: "lrn", label: "LRN" },
    { key: "brn", label: "BRN" },
    { key: "ulr", label: "ULR" },
    { key: "grade_size", label: "Grade/Size" },
    { key: "brand", label: "Brand/Source" },
  ];

  const TableHeaders = () => (
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
  );

  return (
    <div className="transition-content w-full pb-5">
      <div className="flex h-full w-full flex-col">
        <div className="pb-4 text-sm text-gray-700 dark:text-gray-300">
          {/* ── Header Row ── */}
          {/* ── Header Row ── */}
          <div className="mb-4 flex items-center justify-between">
            {/* Left Side - Title */}
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              TRF Products
            </h2>

            {/* Right Side - Buttons */}
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <button
                onClick={() => navigate("/dashboards/testing/trfs-starts-jobs")}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
              >
                Back to TRF Entry List
              </button>

              {/* Add / Close Button */}
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
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Show
              </span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded border border-gray-300 bg-white px-1.5 py-1 text-sm text-gray-700 outline-none focus:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Search:
              </span>
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
                <TableHeaders />
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="py-8 text-center text-gray-400 dark:text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin text-blue-500"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
                          />
                        </svg>
                        Loading…
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="py-8 text-center text-gray-400 dark:text-gray-500"
                    >
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
                        <td
                          key={col.key}
                          className="px-3 py-2 align-middle text-gray-700 dark:text-gray-300"
                        >
                          {row[col.key] ?? ""}
                        </td>
                      ))}
                      <td className="min-w-[200px] px-3 py-2 align-middle">
                        <ActionCell
                          row={row}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>

          {!loading && totalEntries === 0 && !showForm && (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              No Item added
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
