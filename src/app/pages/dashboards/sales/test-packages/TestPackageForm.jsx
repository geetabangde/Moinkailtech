// Import Dependencies
import { useState, useEffect } from "react";
import axios from "utils/axios";
import { toast } from "sonner";

// ----------------------------------------------------------------------

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-500 dark:bg-dark-800 dark:text-dark-100";

const selectCls = inputCls;

export function FormRow({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="dark:text-dark-300 text-sm font-medium text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Quantities sub-section ────────────────────────────────────────────────────
export function QuantitiesSection({ packageId }) {
  const [quantities, setQuantities] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "", unit: "" });
  const [adding, setAdding] = useState(false);

  // Fetch existing quantities + units
  useEffect(() => {
    if (!packageId) return;
    const load = async () => {
      try {
        const [qRes, uRes] = await Promise.all([
          axios.get(`/sales/get-quantity?package=${packageId}`),
          axios.get("/master/units-list"),
        ]);
        if (Array.isArray(qRes.data.data)) setQuantities(qRes.data.data);
        if (Array.isArray(uRes.data.data)) setUnits(uRes.data.data);
        // pre-select first unit
        if (uRes.data.data?.[0])
          setForm((p) => ({ ...p, unit: uRes.data.data[0].id }));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [packageId]);

  // Fetch units on mount (for add form before save)
  useEffect(() => {
    if (packageId) return;
    axios.get("/master/units-list").then((res) => {
      if (Array.isArray(res.data.data)) {
        setUnits(res.data.data);
        if (res.data.data[0])
          setForm((p) => ({ ...p, unit: res.data.data[0].id }));
      }
    });
  }, [packageId]);

  const handleAdd = async () => {
    if (!form.name || !form.quantity || !form.unit) {
      toast.error("Fill all quantity fields");
      return;
    }
    if (!packageId) {
      toast.error("Save the package first before adding quantities");
      return;
    }
    setAdding(true);
    try {
      const res = await axios.post("/sales/add-quantity", {
        name: form.name,
        quantity: Number(form.quantity),
        unit: Number(form.unit),
        package: Number(packageId),
      });
      if (res.data.status === true || res.data.status === "true") {
        toast.success("Quantity added ✅");
        // Reload quantities
        const qRes = await axios.get(
          `/sales/get-quantity?package=${packageId}`,
        );
        if (Array.isArray(qRes.data.data)) setQuantities(qRes.data.data);
        setForm((p) => ({ ...p, name: "", quantity: "" }));
      } else {
        toast.error(res.data.message ?? "Failed to add quantity");
      }
    } catch {
      toast.error("Failed to add quantity");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (qid) => {
    try {
      await axios.delete(`/sales/delete-quantity?id=${qid}`);
      setQuantities((old) => old.filter((q) => q.id !== qid));
      toast.success("Quantity removed");
    } catch {
      toast.error("Failed to remove quantity");
    }
  };

  const unitName = (uid) => units.find((u) => u.id == uid)?.name ?? uid;

  return (
    <div className="dark:border-dark-500 rounded-lg border border-gray-200 p-4">
      <h4 className="dark:text-dark-200 mb-3 text-sm font-semibold text-gray-700">
        Quantity
      </h4>

      {/* Existing quantities */}
      {quantities.length > 0 && (
        <div className="mb-3 space-y-2">
          {quantities.map((q) => (
            <div
              key={q.id}
              className="dark:bg-dark-700 flex items-center gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm"
            >
              <span className="dark:text-dark-100 flex-1 font-medium text-gray-800">
                {q.name}
              </span>
              <span className="dark:text-dark-300 text-gray-600">
                {q.quantity}
              </span>
              <span className="dark:text-dark-400 text-gray-500">
                {unitName(q.unit)}
              </span>
              <button
                onClick={() => handleDelete(q.id)}
                className="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add quantity form */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Name (e.g. 2m pipe)"
          className={inputCls}
        />
        <input
          type="number"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          placeholder="Quantity"
          className={inputCls}
        />
        <select
          value={form.unit}
          onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
          className={selectCls}
        >
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} {u.description ? `(${u.description})` : ""}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {adding ? "Adding…" : "+ Add Quantity"}
        </button>
      </div>
    </div>
  );
}

// ── Main form fields (shared between Add and Edit) ────────────────────────────
export function useTestPackageDropdowns() {
  const [products, setProducts] = useState([]);
  const [standards, setStandards] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, sRes, cRes] = await Promise.all([
          axios.get("/testing/get-prodcut-list"),
          axios.get("/testing/get-standards"),
          axios.get("/master/currency-list"),
        ]);
        if (Array.isArray(pRes.data.data)) setProducts(pRes.data.data);
        if (Array.isArray(sRes.data.data)) setStandards(sRes.data.data);
        if (Array.isArray(cRes.data.data)) setCurrencies(cRes.data.data);
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { products, standards, currencies, loading };
}

export { inputCls, selectCls };
