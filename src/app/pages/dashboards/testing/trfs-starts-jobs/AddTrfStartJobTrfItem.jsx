import { useState, useEffect, useCallback } from "react";
import axios from "utils/axios";
import { useParams, } from "react-router-dom";
import TrfItemForm from "./TrfItemForm"; // inline form

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function TrfProductsList() {
  const { id } = useParams();
//   const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Inline form state ──────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);   // toggle add-form
  const [editItemId, setEditItemId] = useState(null); // null = add, number = edit

  // Table state
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`testing/get-trf-item-list/${id}`);
      const items = response.data?.trf_products ?? [];
      setData(items);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load TRF items.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchItems();
  }, [fetchItems, id]);

  // Derived state
  const filtered = data.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [
      row.product_name, row.package_name, row.lrn,
      row.brn, row.ulr, row.grade_size, row.brand,
    ].some((v) => String(v ?? "").toLowerCase().includes(q));
  });

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1); };
  const handlePageSizeChange = (e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); };

  // Open form for ADD
  const handleAddNew = () => {
    setEditItemId(null);
    setShowForm(true);
  };

  // Open form for EDIT
  const handleEdit = (itemId) => {
    setEditItemId(itemId);
    setShowForm(true);
  };

  // Close form & refresh
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditItemId(null);
    fetchItems();
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
        <th key={col.key} style={styles.th}>{col.label}</th>
      ))}
      <th style={styles.th}>Action</th>
    </tr>
  );

  return (
    <div style={styles.wrapper}>

      {/* ── Header Row ── */}
      <div style={styles.headerRow}>
        <span style={styles.sectionTitle}>TRF Products</span>
        <button
          style={{
            ...styles.addButton,
            ...(showForm && !editItemId ? styles.addButtonActive : {}),
          }}
          onClick={handleAddNew}
        >
          <span style={styles.addIcon}>{showForm && !editItemId ? "✕" : "+"}</span>
          {showForm && !editItemId ? "Close Form" : "Add New Item"}
        </button>
      </div>

      {/* ── Inline Add / Edit Form ── */}
      {showForm && (
        <div style={styles.formWrapper}>
          {/* animated slide-down */}
          <TrfItemForm
            trfId={id}
            itemId={editItemId}           // null = new, number = edit
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* ── Controls Row ── */}
      <div style={styles.controlsRow}>
        <div style={styles.showEntries}>
          <span style={styles.label}>Show</span>
          <select style={styles.select} value={pageSize} onChange={handlePageSizeChange}>
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span style={styles.label}>entries</span>
        </div>
        <div style={styles.searchWrapper}>
          <span style={styles.label}>Search:</span>
          <input
            style={styles.searchInput}
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search…"
          />
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* ── Table ── */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead><TableHeaders /></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + 1} style={styles.emptyCell}>Loading…</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={columns.length + 1} style={styles.emptyCell}>No data available in table</td></tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row.id}
                  style={{
                    ...(idx % 2 === 0 ? styles.trEven : styles.trOdd),
                    ...(editItemId === row.id ? styles.trHighlight : {}),
                  }}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={styles.td}>{row[col.key] ?? ""}</td>
                  ))}
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      {row.can_edit && (
                        <>
                          <button
                            style={{
                              ...styles.editBtn,
                              ...(editItemId === row.id ? styles.editBtnActive : {}),
                            }}
                            onClick={() => handleEdit(row.id)}
                          >
                            Edit
                          </button>
                          <button
                            style={styles.deleteBtn}
                            onClick={() => handleDelete(row.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot><TableHeaders /></tfoot>
        </table>
      </div>

      {/* ── Footer ── */}
      <div style={styles.footerRow}>
        <span style={styles.label}>
          {totalEntries === 0
            ? "Showing 0 to 0 of 0 entries"
            : `Showing ${startIndex + 1} to ${Math.min(startIndex + pageSize, totalEntries)} of ${totalEntries} entries`}
        </span>
        <div style={styles.paginationGroup}>
          <button
            style={{ ...styles.pageBtn, ...(safeCurrentPage === 1 ? styles.pageBtnDisabled : {}) }}
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <button
            style={{ ...styles.pageBtn, ...(safeCurrentPage === totalPages ? styles.pageBtnDisabled : {}) }}
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {!loading && totalEntries === 0 && !showForm && (
        <div style={styles.noItemMsg}>No Item added</div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: 13, color: "#333",
    padding: "0 0 16px 0",
  },
  headerRow: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#1e293b" },
  addButton: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 16px", background: "#3b82f6", color: "#fff",
    border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
    cursor: "pointer", boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
    transition: "background 0.18s",
  },
  addButtonActive: {
    background: "#64748b",
    boxShadow: "0 2px 6px rgba(100,116,139,0.25)",
  },
  addIcon: { fontSize: 15, lineHeight: 1, fontWeight: 700 },

  // ── Inline form container ──
  formWrapper: {
    marginBottom: 16,
    border: "1px solid #bfdbfe",
    borderRadius: 8,
    background: "#f0f7ff",
    padding: "18px 18px 10px",
    animation: "slideDown 0.2s ease",
  },

  controlsRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
    flexWrap: "wrap", gap: 8,
  },
  showEntries: { display: "flex", alignItems: "center", gap: 6 },
  label: { fontSize: 13, color: "#555" },
  select: { border: "1px solid #ccc", borderRadius: 3, padding: "2px 4px", fontSize: 13 },
  searchWrapper: { display: "flex", alignItems: "center", gap: 6 },
  searchInput: {
    border: "1px solid #ccc", borderRadius: 3,
    padding: "3px 8px", fontSize: 13, width: 180, outline: "none",
  },
  error: {
    color: "#c0392b", background: "#fdecea", border: "1px solid #e74c3c",
    borderRadius: 3, padding: "6px 12px", marginBottom: 8, fontSize: 13,
  },
  tableWrapper: { overflowX: "auto", borderTop: "1px solid #ddd" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 },
  th: {
    padding: "8px 10px", textAlign: "left",
    borderBottom: "1px solid #ddd", borderTop: "1px solid #ddd",
    background: "#fff", fontWeight: 600, color: "#333", whiteSpace: "nowrap",
  },
  td: { padding: "7px 10px", borderBottom: "1px solid #e8e8e8", color: "#444", verticalAlign: "middle" },
  trEven: { background: "#fff" },
  trOdd: { background: "#f9f9f9" },
  trHighlight: { background: "#eff6ff" },
  emptyCell: { textAlign: "center", padding: "14px", color: "#777", borderBottom: "1px solid #e8e8e8" },
  actionGroup: { display: "flex", gap: 4 },
  editBtn: {
    padding: "3px 10px", background: "#5bc0de", color: "#fff",
    border: "none", borderRadius: 3, cursor: "pointer", fontSize: 12,
  },
  editBtnActive: { background: "#0ea5e9" },
  deleteBtn: {
    padding: "3px 10px", background: "#d9534f", color: "#fff",
    border: "none", borderRadius: 3, cursor: "pointer", fontSize: 12,
  },
  footerRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8,
  },
  paginationGroup: { display: "flex", gap: 4 },
  pageBtn: {
    padding: "4px 12px", background: "#fff", border: "1px solid #ccc",
    borderRadius: 3, cursor: "pointer", fontSize: 13, color: "#333",
  },
  pageBtnDisabled: { opacity: 0.5, cursor: "default" },
  noItemMsg: { fontSize: 12, color: "#888", marginTop: 6 },
};