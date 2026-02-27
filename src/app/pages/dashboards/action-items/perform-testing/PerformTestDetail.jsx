// Import Dependencies
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "utils/axios";
import { toast } from "sonner";
import clsx from "clsx";

// Local Imports
import { Page } from "components/shared/Page";
import { PaginationSection } from "components/shared/table/PaginationSection";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Table, Card, THead, TBody, Th, Tr, Td } from "components/ui";
import { fuzzyFilter } from "utils/react-table/fuzzyFilter";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const columnHelper = createColumnHelper();

// PHP: TAT = allotmentdate + parameter.time days → red if TAT <= today
function isTATOverdue(tatDate) {
  if (!tatDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = tatDate.split("/"); // dd/mm/yyyy
  if (parts.length !== 3) return false;
  const tat = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  return tat <= today;
}

// ─── Action Cell ───────────────────────────────────────────────────────────────
// PHP status logic:
//   status=0, witnesslock=0, startdate=""  → Start / Upload Document  (if chemist)
//   status=0, witnesslock=0, startdate≠""  → Test Input               (if chemist)
//   status=0, witnesslock≠0               → Locked For Witness
//   status=24, witnesslock=0              → Test Input                (if chemist)
//   status=24, witnesslock≠0              → Locked For Witness
//   else                                  → Test Completed + View Raw Data
//   has_documents (any status)            → View Documents button
//
// API field mapping (what backend actually returns):
//   testeventdata_id  → row unique id (teid)
//   tid               → trfproduct id
//   trfid             → trf id
//   witnesslock       → witness lock flag
//   start_time        → startdate from testeventdata (backend should send this)
//   is_chemist        → whether logged-in user is the assigned chemist (backend should send this)
//   has_documents     → whether testdocuments exist for this row (backend should send this)
function ActionCell({ row }) {
  // ── Destructure using actual API field names ──────────────────────────────
  const {
    testeventdata_id,   // unique id of testeventdata row  (maps to teid / id in PHP)
    tid,                // trfproduct id                   (maps to trfproduct_id in PHP)
    trfid,              // trf id                          (maps to trf in PHP)
    status,
    witnesslock,        // 0 = not locked, non-zero = locked
    start_time,         // "" or null = not started yet   (PHP: $starttime = $row['startdate'])
    is_chemist,         // true/false — backend resolves chemist == employeeid
    has_documents,      // true/false — backend checks testdocuments count
  } = row.original;

  const [startDateModal, setStartDateModal] = useState(false);
  const [uploadModal,    setUploadModal]    = useState(false);
  const [startDate,      setStartDate]      = useState("");
  const [submitting,     setSubmitting]     = useState(false);

  // ── POST /actionitem/start-test ───────────────────────────────────────────
  // PHP: $data['startdate'] = changedateformatespecito($_POST['start_date'], "d/m/Y", "Y-m-d H:i:s")
  // Body: { id: testeventdata_id, enddate: "dd/mm/yyyy" }
  const handleSetStartDate = async () => {
    if (!startDate) { toast.error("Please select a start date."); return; }
    const [y, m, day] = startDate.split("-");
    const formatted = `${day}/${m}/${y}`;
    try {
      setSubmitting(true);
      await axios.post("/actionitem/start-test", { id: testeventdata_id, enddate: formatted });
      toast.success("Test started successfully ✅");
      setStartDateModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to start test. ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Direct start — no docs, no modal (PHP: GET starttest.php → startdate = now) ──
  const handleDirectStart = async () => {
    try {
      setSubmitting(true);
      const today     = new Date();
      const formatted = `${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}/${today.getFullYear()}`;
      await axios.post("/actionitem/start-test", { id: testeventdata_id, enddate: formatted });
      toast.success("Test started successfully ✅");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to start test. ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // ── PHP action flag logic ─────────────────────────────────────────────────
  const renderAction = () => {
    const actions = [];
    const isStarted = start_time && start_time !== ""; // PHP: $starttime == ""

    if (status === 0 || status === 24) {
      if (!witnesslock) {
        // ── status=0, not yet started ───────────────────────────────────────
        if (status === 0 && !isStarted) {
          if (is_chemist) {
            if (!has_documents) {
              // PHP: mysqli_num_rows($itemDocument) == 0
              // → green Start link (direct, no modal) + Upload Document
              actions.push(
                <button
                  key="start-direct"
                  onClick={handleDirectStart}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                >
                  {submitting ? "Starting..." : "Start"}
                </button>
              );
              actions.push(
                <button
                  key="upload"
                  onClick={() => setUploadModal(true)}
                  className="ml-1 inline-flex items-center gap-1 rounded bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-600"
                >
                  Upload Document
                </button>
              );
            } else {
              // PHP: has docs → green Start button → set start date modal
              actions.push(
                <button
                  key="start-modal"
                  onClick={() => setStartDateModal(true)}
                  className="inline-flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                >
                  Start
                </button>
              );
            }
          } else {
            // PHP: $flag = "Pending To start"
            actions.push(
              <span key="pending-start" className="inline-flex items-center gap-1 text-xs text-gray-500">
                <span className="rounded bg-primary-600 px-1.5 py-0.5 text-xs font-semibold text-white">Pending</span>
                To start
              </span>
            );
          }
        } else {
          // ── status=0 but started, OR status=24 ─────────────────────────────
          // PHP: Test Input link
          if (is_chemist) {
            actions.push(
              <a
                key="test-input"
                href={`/testinput?hakuna=${testeventdata_id}`}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Test Input
              </a>
            );
          } else {
            actions.push(
              <span key="pending-input" className="text-xs text-gray-500">Pending Test Input</span>
            );
          }
        }
      } else {
        // PHP: $witnesslock != 0 → Locked For Witness
        actions.push(
          <span key="locked" className="text-xs text-orange-600 dark:text-orange-400">
            Locked For Witness
          </span>
        );
      }
    } else {
      // PHP: else → Test Completed + View Raw Data
      actions.push(
        <div key="completed" className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">Test Completed</span>
          <a
            href={`/viewrawdatasingle?hakuna=${testeventdata_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            View Raw Data
          </a>
        </div>
      );
    }

    // PHP: if(mysqli_num_rows($itemDocument) > 0) → View Documents (always, any status)
    if (has_documents) {
      actions.push(
        <a
          key="view-docs"
          href={`/viewTestItemDocuments?hakuna=${trfid}&matata=${tid}&testeventdata_id=${testeventdata_id}`}
          className="ml-1 inline-flex items-center gap-1 rounded bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
        >
          View Documents
        </a>
      );
    }

    return <div className="flex flex-wrap items-center gap-1">{actions}</div>;
  };

  return (
    <>
      {renderAction()}

      {/* ── Set Start Date Modal ─────────────────────────────────────────── */}
      {startDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-dark-100">
              Set Test Start Date
            </h3>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-gray-500">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStartDateModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                Close
              </button>
              <button
                onClick={handleSetStartDate}
                disabled={submitting}
                className={clsx(
                  "rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700",
                  submitting && "cursor-not-allowed opacity-60"
                )}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Document Modal ────────────────────────────────────────── */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-dark-100">
              Upload Calibration Document
            </h3>
            <UploadDocumentForm
              teid={testeventdata_id}
              trfId={trfid}
              trfProductId={tid}
              onClose={() => setUploadModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ─── Upload Document Form ──────────────────────────────────────────────────────
function UploadDocumentForm({ teid, trfId, trfProductId, onClose }) {
  const [name,       setName]       = useState("");
  const [files,      setFiles]      = useState([null]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name)                      { toast.error("Please enter a name.");              return; }
    if (files.every((f) => !f))     { toast.error("Please upload at least one document."); return; }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name",              name);
      formData.append("trfs_id",           trfId);
      formData.append("trfproducts_id",    trfProductId);
      formData.append("testeventdata_id",  teid);
      files.forEach((f) => { if (f) formData.append("path[]", f); });
      await axios.post("/actionitem/insert-test-documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded successfully ✅");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Upload failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-gray-500">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-blue-500"
          placeholder="Document name"
        />
      </div>
      <div className="mb-3 flex flex-col gap-2">
        {files.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const updated = [...files];
                updated[i] = e.target.files[0] ?? null;
                setFiles(updated);
              }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm"
            />
            {files.length > 1 && (
              <button
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setFiles([...files, null])}
          className="self-start text-xs font-medium text-green-600 hover:underline"
        >
          + Add file
        </button>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400"
        >
          Close
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={clsx(
            "rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700",
            submitting && "cursor-not-allowed opacity-60"
          )}
        >
          {submitting ? "Uploading..." : "Save"}
        </button>
      </div>
    </>
  );
}

// ─── Table Columns ─────────────────────────────────────────────────────────────
// All accessor keys match actual API response field names
const detailColumns = [
  columnHelper.accessor((_row, i) => i + 1, {
    id: "s_no",
    header: "S. No.",
    cell: (info) => info.row.index + 1,
  }),
  columnHelper.accessor("product", {
    id: "product",
    header: "Product",
    cell: (info) => (
      <span className="text-sm text-gray-700 dark:text-dark-200">{info.getValue() ?? "—"}</span>
    ),
  }),
  columnHelper.accessor("package", {
    id: "package",
    header: "Package",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("parameter", {          // API: "parameter"  (was "parameter_name")
    id: "parameter",
    header: "Parameter",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("description", {
    id: "description",
    header: "Description",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("department", {         // API: "department" (was "department_name")
    id: "department",
    header: "Department",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("chemist", {            // API: "chemist"    (was "chemist_name")
    id: "chemist",
    header: "Chemist",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("assign_date", {        // API: "assign_date" (was "allotment_date")
    id: "assign_date",
    header: "Assign Date",
    cell: (info) => info.getValue() ?? "—",
  }),
  columnHelper.accessor("due_date", {
    id: "due_date",
    header: "Due Date",
    cell: (info) => info.getValue() ?? "—",
  }),
  // TAT — PHP: red if TAT <= today
  columnHelper.accessor("tat", {
    id: "tat",
    header: "TAT",
    cell: (info) => {
      const val     = info.getValue();
      const overdue = isTATOverdue(val);
      return (
        <span
          className={clsx(
            "inline-block rounded px-2 py-0.5 text-xs font-semibold",
            overdue
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          {val ?? "—"}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "action",
    header: "Action",
    cell: ActionCell,
  }),
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PerformTestDetail() {
  const { id } = useParams();   // trfproduct id  →  GET ?id=45826
  const navigate = useNavigate();

  const [rows,         setRows]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  // ── Fetch — GET /actionitem/get-perform-testing-byid?id={id} ─────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/actionitem/get-perform-testing-byid", { params: { id } });
        // API envelope: { status: true, data: [...] }
        const d = res.data?.data ?? res.data ?? [];
        setRows(Array.isArray(d) ? d : []);
      } catch (err) {
        console.error("Error fetching test detail:", err);
        toast.error("Failed to load test data.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const table = useReactTable({
    data:                  rows,
    columns:               detailColumns,
    state:                 { globalFilter },
    onGlobalFilterChange:  setGlobalFilter,
    filterFns:             { fuzzy: fuzzyFilter },
    globalFilterFn:        fuzzyFilter,
    getCoreRowModel:       getCoreRowModel(),
    getFilteredRowModel:   getFilteredRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <Page title="Tests List">
        <div className="flex h-[60vh] items-center justify-center gap-3 text-gray-500">
          <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
          </svg>
          Loading...
        </div>
      </Page>
    );
  }

  return (
    <Page title="Tests List">
      <div className="transition-content w-full pb-8 px-(--margin-x)">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-100">Tests List</h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          >
            ← Back
          </button>
        </div>

        {/* Search */}
        <div className="mb-3 flex items-center justify-end">
          <div className="relative">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-9 pr-4 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
          </div>
        </div>

        <Card className="relative flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <Table hoverable className="w-full text-left text-sm">
              <THead>
                {table.getHeaderGroups().map((hg) => (
                  <Tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <Th
                        key={header.id}
                        className="bg-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:bg-dark-800 dark:text-dark-200"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </THead>
              <TBody>
                {table.getRowModel().rows.length === 0 ? (
                  <Tr>
                    <Td colSpan={99} className="py-12 text-center text-sm text-gray-400">
                      No tests found.
                    </Td>
                  </Tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <Tr
                      key={row.id}
                      className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <Td key={cell.id} className="bg-white dark:bg-dark-900 py-2 px-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </TBody>
            </Table>
          </div>

          {/* Pagination */}
          {table.getCoreRowModel().rows.length > 0 && (
            <div className="px-4 py-4 sm:px-5">
              <PaginationSection table={table} />
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}