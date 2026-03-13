// Import Dependencies
import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";

// Local Imports
import { Page } from "components/shared/Page";
import { Card } from "components/ui";
import {
  FormRow,
  useTestPackageDropdowns,
  inputCls,
  selectCls,
} from "./TestPackageForm";

// ----------------------------------------------------------------------

const NABL_OPTIONS = [
  { value: 1, label: "NABL" },
  { value: 3, label: "QAI" },
  { value: 2, label: "NO" },
];

const defaultForm = {
  package: "",
  type: 0,
  special: 0,
  nabl: 1,
  description: "",
  product: "",
  category: 0,
  standard: "",
  rate: "",
  currency: "",
  days: "",
};

export default function AddTestPackage() {
  const navigate = useNavigate();
  const { products, standards, currencies, loading } =
    useTestPackageDropdowns();

  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!form.package) {
      toast.error("Package name is required");
      return;
    }
    if (!form.product) {
      toast.error("Please select a product");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        package: form.package,
        type: Number(form.type),
        special: Number(form.special),
        nabl: Number(form.nabl),
        description: form.description,
        product: Number(form.product),
        category: Number(form.category),
        standard: Number(form.standard),
        rate: Number(form.rate),
        currency: Number(form.currency),
        days: Number(form.days),
      };
      const res = await axios.post("/sales/add-test-package", payload);
      if (
        res.data.success === true ||
        res.data.status === true ||
        res.data.status === "true"
      ) {
        toast.success(res.data.message ?? "Test package added ✅");
        navigate("/dashboards/sales/test-packages");
      } else {
        toast.error(res.data.message ?? "Failed to add package");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Page title="Add Test Price">
        <div className="flex h-[60vh] items-center justify-center text-gray-600">
          <svg
            className="mr-2 h-6 w-6 animate-spin text-blue-600"
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
          Loading...
        </div>
      </Page>
    );
  }

  return (
    <Page title="Add New Test Price">
      <div className="transition-content px-(--margin-x) pb-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="dark:text-dark-50 text-xl font-semibold text-gray-800">
            Add New Test Price
          </h2>
          <button
            onClick={() => navigate("/dashboards/sales/test-packages")}
            className="dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700 rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Back to Price List
          </button>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Package Name */}
            <div className="sm:col-span-2">
              <FormRow label="Test Package Name" required>
                <input
                  type="text"
                  value={form.package}
                  onChange={(e) => set("package", e.target.value)}
                  placeholder="Test Package"
                  className={inputCls}
                />
              </FormRow>
            </div>

            {/* Package Type */}
            <FormRow label="Package Type">
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className={selectCls}
              >
                <option value={1}>Perform All Tests</option>
                <option value={0}>Upload Report Directly</option>
              </select>
            </FormRow>

            {/* NABL */}
            <FormRow label="Covered Under Accreditation?">
              <select
                value={form.nabl}
                onChange={(e) => set("nabl", e.target.value)}
                className={selectCls}
              >
                {NABL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormRow>

            {/* Description */}
            <div className="sm:col-span-2">
              <FormRow label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Description"
                  className={`${inputCls} resize-none`}
                />
              </FormRow>
            </div>

            {/* Product */}
            <FormRow label="Product Name" required>
              <select
                value={form.product}
                onChange={(e) => set("product", e.target.value)}
                className={selectCls}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.description ? ` (${p.description})` : ""}
                  </option>
                ))}
              </select>
            </FormRow>

            {/* Special Package */}
            <FormRow label="Special Package">
              <select
                value={form.special}
                onChange={(e) => set("special", e.target.value)}
                className={selectCls}
              >
                <option value="">Select</option>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </FormRow>

            {/* BIS Category */}
            <FormRow label="It Is BIS Price">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={selectCls}
              >
                <option value={1}>Yes, BIS</option>
                <option value={0}>No, General</option>
              </select>
            </FormRow>

            {/* Standard */}
            <FormRow label="Standards">
              <select
                value={form.standard}
                onChange={(e) => set("standard", e.target.value)}
                className={selectCls}
              >
                <option value="">Select Standard</option>
                {standards.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.description ? ` (${s.description})` : ""}
                  </option>
                ))}
              </select>
            </FormRow>

            {/* Rate */}
            <FormRow label="Rate">
              <input
                type="number"
                value={form.rate}
                onChange={(e) => set("rate", e.target.value)}
                placeholder="Rate"
                className={inputCls}
              />
            </FormRow>

            {/* Currency */}
            <FormRow label="Currency">
              <select
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
                className={selectCls}
              >
                <option value="">Select Currency</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.description ? ` (${c.description})` : ""}
                  </option>
                ))}
              </select>
            </FormRow>

            {/* Days */}
            <FormRow label="No. Of Days Required">
              <input
                type="number"
                value={form.days}
                onChange={(e) => set("days", e.target.value)}
                placeholder="No. Of Days"
                className={inputCls}
              />
            </FormRow>
          </div>

          {/* ── Submit ── */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-green-600 px-8 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Add Test Price"}
            </button>
          </div>
        </Card>
      </div>
    </Page>
  );
}
