import { useState, useEffect } from "react";
import axios from "utils/axios";

// ── Shared class strings ──────────────────────────────────────────────────────
const inputCls =
  "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm " +
  "text-gray-800 dark:text-white bg-white dark:bg-gray-800 outline-none " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition placeholder-gray-400";

const inputErrCls =
  "w-full border border-red-400 dark:border-red-500 rounded-lg px-3 py-2.5 text-sm " +
  "text-gray-800 dark:text-white bg-white dark:bg-gray-800 outline-none " +
  "focus:border-red-500 focus:ring-2 focus:ring-red-100 transition placeholder-gray-400";

const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
const errCls   = "text-red-500 text-xs mt-1";

function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
    </svg>
  );
}

/**
 * EditItemModal
 *
 * Props:
 *   show         — boolean: modal visible ya nahi
 *   itemId       — TRF product ID (e.g. 49543)
 *   onClose      — modal band karne ka callback
 *   onSuccess    — successful update ke baad callback (refresh list etc.)
 */
export default function EditItemModal({ show, itemId, onClose, onSuccess }) {
  const [form, setForm] = useState({ brand: "", qrcode: "", testrequest: "" });
  const [productName, setProductName] = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors]         = useState({});

  // ── Fetch item detail when modal opens ────────────────────────────────────
  useEffect(() => {
    if (!show || !itemId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setFetchError(null);
      setSubmitError(null);
      setErrors({});
      try {
        const res  = await axios.get(`/testing/get-trf-product-detail/${itemId}`);
        const data = res.data ?? {};
        setProductName(data.product_name ?? "");
        setForm({
          brand:       data.brand       ?? "",
          qrcode:      data.qrcode      ?? "",
          testrequest: data.testrequest ?? "",
        });
      } catch {
        setFetchError("Item detail load karne mein error aaya. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [show, itemId]);

  // ── Close reset ───────────────────────────────────────────────────────────
  const handleClose = () => {
    setForm({ brand: "", qrcode: "", testrequest: "" });
    setProductName("");
    setErrors({});
    setFetchError(null);
    setSubmitError(null);
    onClose?.();
  };

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.brand.trim())       errs.brand       = "Brand/Source required hai";
    if (!form.qrcode.trim())      errs.qrcode      = "QR Code required hai";
    if (!form.testrequest.trim()) errs.testrequest  = "Test Request required hai";
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await axios.post("/testing/update-trf-entry", {
        id:          Number(itemId),
        brand:       form.brand.trim(),
        qrcode:      form.qrcode.trim(),
        testrequest: form.testrequest.trim(),
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error   ??
        (typeof err?.response?.data === "string" ? err.response.data : null) ??
        "Update karne mein error aaya. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Backdrop click to close ───────────────────────────────────────────────
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-gray-900 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h4 className="text-base font-semibold text-gray-800 dark:text-white">
            Edit Item Detail
          </h4>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-5 space-y-4">

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
              <Spinner className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Loading item details...</span>
            </div>
          )}

          {/* Fetch error */}
          {!loading && fetchError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg px-3 py-2.5 text-sm">
              <span className="mt-0.5">⚠️</span>
              <span>{fetchError}</span>
            </div>
          )}

          {/* Form fields */}
          {!loading && !fetchError && (
            <>
              {/* Product name (read-only display) */}
              {productName && (
                <div>
                  <p className={labelCls}>Name Of Product</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white px-1">
                    {productName}
                  </p>
                </div>
              )}

              {/* Submit error */}
              {submitError && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg px-3 py-2.5 text-sm">
                  <span className="mt-0.5">⚠️</span>
                  <span>{submitError}</span>
                </div>
              )}

              {/* Brand / Source */}
              <div>
                <label className={labelCls}>
                  Brand/Source <span className="text-red-500">*</span>
                </label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="Brand/Source enter karein"
                  className={errors.brand ? inputErrCls : inputCls}
                />
                {errors.brand && <p className={errCls}>{errors.brand}</p>}
              </div>

              {/* QR Code */}
              <div>
                <label className={labelCls}>
                  QR Code <span className="text-red-500">*</span>
                </label>
                <input
                  name="qrcode"
                  value={form.qrcode}
                  onChange={handleChange}
                  placeholder="QR Code enter karein"
                  className={errors.qrcode ? inputErrCls : inputCls}
                />
                {errors.qrcode && <p className={errCls}>{errors.qrcode}</p>}
              </div>

              {/* Test Request */}
              <div>
                <label className={labelCls}>
                  Test Request <span className="text-red-500">*</span>
                </label>
                <input
                  name="testrequest"
                  value={form.testrequest}
                  onChange={handleChange}
                  placeholder="Test Request enter karein"
                  className={errors.testrequest ? inputErrCls : inputCls}
                />
                {errors.testrequest && <p className={errCls}>{errors.testrequest}</p>}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && !fetchError && (
          <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 disabled:opacity-50 transition"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4 text-white" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}