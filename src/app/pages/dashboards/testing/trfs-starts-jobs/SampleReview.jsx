import { useState, useEffect } from "react";
import { Button } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router";

// ── Ok / Not Ok options (PHP: <option value="1">Ok</option> <option value="0">Not Ok</option>) ──
const OK_OPTIONS = [
  { value: 1, label: "Ok" },
  { value: 0, label: "Not Ok" },
];

// ── Subcontracting options (PHP: No default, then Yes) ──
const SUBCONTRACT_OPTIONS = [
  { value: 0, label: "No" },
  { value: 1, label: "Yes" },
];

// ── All review fields with labels (maps to Postman payload keys) ──
const REVIEW_FIELDS = [
  { key: "customername",    label: "Customer Name",                   options: OK_OPTIONS },
  { key: "address",         label: "Address",                         options: OK_OPTIONS },
  { key: "workorder",       label: "Work Order No/Date",              options: OK_OPTIONS },
  { key: "modeofreceipt",   label: "Mode Of Receipt",                 options: OK_OPTIONS },
  { key: "reportname",      label: "Report in Whose Name",            options: OK_OPTIONS },
  { key: "billingname",     label: "Billing in Whose Name",           options: OK_OPTIONS },
  { key: "witness",         label: "Witness (Required or not)",       options: OK_OPTIONS },
  { key: "packing",         label: "Packing of Sample (Sealed/Unsealed)", options: OK_OPTIONS },
  { key: "samplecondition", label: "Sample Condition",                options: OK_OPTIONS },
  { key: "time",            label: "Time Schedule (Clear or not)",    options: OK_OPTIONS },
  { key: "payment",         label: "Payment (Received or Not)",       options: OK_OPTIONS },
  { key: "gst",             label: "GST NO.",                         options: OK_OPTIONS },
  { key: "subcontracting",  label: "Subcontracting",                  options: SUBCONTRACT_OPTIONS },
];

// Default: all Ok (1), subcontracting No (0)
const DEFAULT_FORM = REVIEW_FIELDS.reduce(
  (acc, f) => ({ ...acc, [f.key]: f.options[0].value }),
  {}
);

export default function SampleReview() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ── TRF display data (from API) ──────────────────────────────────────────
  const [trfData, setTrfData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm]             = useState({ ...DEFAULT_FORM });
  const [reviewremark, setReviewremark] = useState("");
  const [loading, setLoading]       = useState(false);

  // ── GET /testing/get-trf-byid/:id ────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res    = await axios.get(`/testing/get-trf-byid/${id}`);
        const result = res.data;
        if (result.status === true) {
          setTrfData(result.data);
        } else {
          toast.error("Failed to load TRF details");
        }
      } catch (err) {
        console.error("Fetch TRF error:", err);
        toast.error("Something went wrong while loading TRF.");
      } finally {
        setFetchLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // ── Handle select change ──────────────────────────────────────────────────
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: Number(value) }));
  };

  // ── POST /testing/submit-trf-samlereview ─────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        reviewremark,
        trf: Number(id),
      };

      const res    = await axios.post(`/testing/submit-trf-samlereview`, payload);
      const result = res.data;

      if (result.status === true) {
        toast.success("Sample Review submitted successfully ✅");
        setTimeout(() => {
          navigate("/dashboards/testing/trfs-starts-jobs");
        }, 1000);
      } else {
        toast.error(result.message || "Failed to submit ❌");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Something went wrong while submitting.");
    } finally {
      setLoading(false);
    }
  };

  // ── Display value helpers (PHP: resolved names from DB) ──────────────────
  // API should return these pre-resolved; fallback shown if missing
  const d = trfData || {};

  // PHP: $sealed = array("Unsealed","Sealed","Packed"); $packing = selectfieldwhere
  const SEALED_LABELS = { 0: "Unsealed", 1: "Sealed", 2: "Packed" };
  // PHP: $payments = array(0=>'', 1=>"Yes", 2=>"No");
  const PAYMENT_LABELS = { 0: "", 1: "Yes", 2: "No" };

  // Each field's display value from API data
  const displayValues = {
    customername:    d.customername       || "—",
    address:         d.customeraddress    || d.reportaddress_text || "—",
    workorder:       d.ponumber           || "—",
    modeofreceipt:   d.modeofreciept_name || d.modeofreciept || "—",
    reportname:      d.reportname_text    || "—",
    billingname:     d.billingname_text   || "—",
    witness:         d.witness_name       || "—",
    packing:         SEALED_LABELS[d.sealed] || "—",
    samplecondition: d.condition_name     || "—",
    time:            d.deadline           || "—",
    payment:         PAYMENT_LABELS[d.paymentstatus] || "—",
    gst:             d.gstno              || "—",
    subcontracting:  "",                  // PHP: no display value for this row
  };

  return (
    <Page title="Sample Review & Entry">
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboards/testing/trfs-starts-jobs")}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            &lt;&lt; Back to TRFS
          </button>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Sample Review &amp; Entry
          </h2>
        </div>

        {fetchLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
            </svg>
            Loading TRF details...
          </div>
        ) : (
          <div className="flex gap-6">

            {/* ── Left: Main Form ─────────────────────────────────────────── */}
            <div className="flex-1">
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg overflow-hidden">

                {/* Customer Credit row (display only, no select) */}
                <div className="grid grid-cols-12 border-b border-gray-100 dark:border-dark-600">
                  <div className="col-span-4 px-4 py-3 text-sm font-medium text-gray-600 dark:text-dark-300 bg-gray-50 dark:bg-dark-700 border-r border-gray-100 dark:border-dark-600">
                    Customer Credit
                  </div>
                  <div className="col-span-8 px-4 py-3 text-sm text-gray-800 dark:text-dark-100">
                    <div className="flex gap-8">
                      <div>
                        <span className="text-xs text-gray-500">Amount</span>
                        <p className="font-medium">{d.leftamount ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Days</span>
                        <p className="font-medium">{d.creditdays ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Reference row (display only, no select) */}
                <div className="grid grid-cols-12 border-b border-gray-100 dark:border-dark-600">
                  <div className="col-span-4 px-4 py-3 text-sm font-medium text-gray-600 dark:text-dark-300 bg-gray-50 dark:bg-dark-700 border-r border-gray-100 dark:border-dark-600">
                    Customer Reference
                  </div>
                  <div className="col-span-8 px-4 py-3 text-sm text-gray-800 dark:text-dark-100">
                    {d.letterrefno || "—"}
                  </div>
                </div>

                {/* ── All fields with Ok/Not Ok selects ── */}
                {REVIEW_FIELDS.map((field, idx) => (
                  <div
                    key={field.key}
                    className={`grid grid-cols-12 border-b border-gray-100 dark:border-dark-600 ${
                      idx % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-dark-750"
                    }`}
                  >
                    {/* Label */}
                    <div className="col-span-4 px-4 py-3 text-sm font-medium text-gray-600 dark:text-dark-300 bg-gray-50 dark:bg-dark-700 border-r border-gray-100 dark:border-dark-600">
                      {field.label}
                    </div>
                    {/* Display value */}
                    <div className="col-span-4 px-4 py-3 text-sm text-gray-800 dark:text-dark-100 border-r border-gray-100 dark:border-dark-600">
                      {displayValues[field.key]}
                    </div>
                    {/* Select */}
                    <div className="col-span-4 px-3 py-2 flex items-center">
                      <select
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full rounded-md border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-700 px-3 py-2 text-sm text-gray-700 dark:text-dark-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {/* Review Remark textarea */}
                <div className="grid grid-cols-12">
                  <div className="col-span-4 px-4 py-3 text-sm font-medium text-gray-600 dark:text-dark-300 bg-gray-50 dark:bg-dark-700 border-r border-gray-100 dark:border-dark-600">
                    Review Remark
                  </div>
                  <div className="col-span-8 px-3 py-3">
                    <textarea
                      rows={4}
                      value={reviewremark}
                      onChange={(e) => setReviewremark(e.target.value)}
                      placeholder="Review Remark"
                      className="w-full rounded-md border border-gray-300 dark:border-dark-500 bg-white dark:bg-dark-700 px-3 py-2 text-sm text-gray-700 dark:text-dark-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* ── Right: Submit Panel ─────────────────────────────────────── */}
            <div className="w-64 shrink-0">
              <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg p-4 space-y-3 sticky top-6">

                {/* Submit button */}
                <Button
                  color="success"
                  className="w-full justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Sample Review"
                  )}
                </Button>

                {/* PHP: <a href="edittrf.php?hakuna=...">Edit TRF</a> */}
                <button
                  onClick={() =>
                    navigate(`/dashboards/testing/trfs-starts-jobs/edit/${id}`)
                  }
                  className="w-full text-center text-blue-600 hover:underline text-sm"
                >
                  Edit TRF
                </button>

                {/* TRF Info box */}
                {trfData && (
                  <div className="mt-4 rounded-md bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 p-3 text-xs space-y-1 text-gray-600 dark:text-dark-300">
                    <p><span className="font-medium">TRF No:</span> {d.id}</p>
                    <p><span className="font-medium">Customer:</span> {d.customername}</p>
                    {d.ponumber && (
                      <p><span className="font-medium">PO No:</span> {d.ponumber}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </Page>
  );
}