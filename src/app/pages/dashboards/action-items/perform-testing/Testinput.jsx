// Import Dependencies
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "utils/axios";
import { toast } from "sonner";
import clsx from "clsx";

// Local Imports
import { Page } from "components/shared/Page";
import { Card } from "components/ui";

// =============================================================================
// TestInput Page
// Route: /dashboards/action-items/test-input/:teid
// =============================================================================

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
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
  );
}

// ── Results table for status==24 ──────────────────────────────────────────────
function ResultsTable({ results = [] }) {
  if (!results.length)
    return <p className="py-4 text-sm text-gray-400">No results found.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {[
              "S.No",
              "Parameter",
              "Unit",
              "Results",
              "Test Method",
              "Permissible Value",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase dark:text-gray-300"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr
              key={i}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              <td className="px-3 py-2">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                {r.parameter_name ?? r.parameter ?? "—"}
              </td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                {r.unit ?? "—"}
              </td>
              <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-100">
                {r.result ?? "—"}
              </td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                {r.method ?? "—"}
              </td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                {r.specification ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Set End Date Modal ────────────────────────────────────────────────────────
function SetEndDateModal({ teid, startDate, onClose, onFinalised }) {
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!endDate) {
      toast.error("Please select an end date.");
      return;
    }
    const [y, m, d] = endDate.split("-");
    const formatted = `${d}/${m}/${y}`;
    try {
      setSubmitting(true);
      await axios.post("/actionitem/finalise-test-event", {
        id: teid,
        enddate: formatted,
      });
      toast.success("Test finalised successfully ✅");
      onFinalised?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Finalise failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = startDate
    ? new Date(startDate).toISOString().split("T")[0]
    : undefined;
  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <h3 className="dark:text-dark-100 mb-4 text-base font-semibold text-gray-800">
          Set Test End Date
        </h3>
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            End Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          />
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
              submitting && "cursor-not-allowed opacity-60",
            )}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TestInput() {
  const { teid } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retesting, setRetesting] = useState(false);
  const [endDateModal, setEndDateModal] = useState(false);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [temperature, setTemperature] = useState("27");
  const [humidity, setHumidity] = useState("30");
  const [remark, setRemark] = useState("");
  const [attachment, setAttachment] = useState(null);

  // instruments: { [category_id]: selected_instrument_id }
  const [instruments, setInstruments] = useState({});

  // consumables: { [mid]: { materiallocationid, quantity } }
  const [consumables, setConsumables] = useState({});

  // measurements: { [cycle_index]: { [element_id]: value } }
  const [measurements, setMeasurements] = useState({});

  // ── Fetch test event data ────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/actionitem/get-test-event/${teid}`);

      // ✅ Handle both res.data.data and res.data formats
      const d = res.data?.data ?? res.data ?? null;

      console.log("API Response:", d); // Debug - check your browser console

      setTestData(d);

      const st = Number(d?.status ?? 0);
      if (st === 0 || st === 24) {
        setTemperature(String(d?.temperature ?? "27"));
        setHumidity(String(d?.humidity ?? "30"));
        setRemark(d?.remark ?? "");
      }

      // Pre-fill instruments if returned
      if (d?.selected_instruments) setInstruments(d.selected_instruments);

      // Pre-fill measurements if returned
      if (d?.existing_measurements) setMeasurements(d.existing_measurements);
    } catch (err) {
      console.error("Error loading test event:", err);
      toast.error("Failed to load test data.");
    } finally {
      setLoading(false);
    }
  }, [teid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived data from API — handles multiple possible key names ──────────────
  const status = Number(testData?.status ?? 0);

  // parameter info — PHP: $prow
  const prow = testData?.parameter_info ?? testData?.parameter ?? {};

  // parameter elements — PHP: parameterelements table
  // ✅ Try multiple possible key names the API might use
  const paramElements =
    testData?.parameter_elements ??
    testData?.elements ??
    testData?.parameterelements ??
    [];

  const cycle = Number(prow?.cycle ?? testData?.cycle ?? 1);

  // instrument list — PHP: $allins + instrument dropdown options
  // ✅ Try multiple possible key names
  const instrList =
    testData?.instrument_list ??
    testData?.instruments ??
    testData?.instrument_categories ??
    [];

  // consumables — PHP: parameterconsumables
  // ✅ Try multiple possible key names
  const consumList =
    testData?.consumables ?? testData?.parameterconsumables ?? [];

  // results for status==24
  const results = testData?.results ?? [];
  const has_documents = Boolean(
    testData?.has_documents ?? testData?.hasdocuments,
  );
  const lrn = testData?.lrn ?? "";
  const trfproduct = testData?.trfproduct ?? testData?.tid ?? "";

  // ── Measurement cell change ──────────────────────────────────────────────────
  const handleMeasurement = (cycleIdx, elementId, value) => {
    setMeasurements((prev) => ({
      ...prev,
      [cycleIdx]: { ...(prev[cycleIdx] ?? {}), [elementId]: value },
    }));
  };

  // ── POST /actionitem/add-test-data ───────────────────────────────────────────
  // ✅ FIXED: Payload format matches Postman exactly
  // instruments[0], instruments[1] → indexed array of selected IDs
  // materiallocationid[0], quantity[0] → indexed
  // 446[], 1[], 2[] → element_id[] per cycle row
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const fd = new FormData();

      fd.append("teid", teid);
      fd.append("temperature", temperature);
      fd.append("humidity", humidity);
      fd.append("remark", remark);
      if (attachment) fd.append("attachment", attachment);

      // ✅ instruments[0], instruments[1]... (indexed, not category_id keyed)
      const instrumentValues = Object.values(instruments).filter(Boolean);
      instrumentValues.forEach((val, idx) => {
        fd.append(`instruments[${idx}]`, val);
      });

      // ✅ materiallocationid[0], quantity[0]... (indexed)
      const consumableEntries = Object.values(consumables);
      consumableEntries.forEach((vals, idx) => {
        fd.append(`materiallocationid[${idx}]`, vals.materiallocationid ?? "");
        fd.append(`quantity[${idx}]`, vals.quantity ?? "");
      });

      // ✅ 446[], 1[], 2[]... → element_id[] appended for each cycle row
      // PHP: name="$pid[]" where $pid = $frow['element'] from parameterelements table
      // API returns field as "element" (not element_id)
      paramElements.forEach((el) => {
        // PHP: $pid = $frow['element'] → field name is "element"
        const elId = el.element ?? el.element_id ?? el.id;
        for (let i = 0; i < cycle; i++) {
          fd.append(`${elId}[]`, measurements[i]?.[elId] ?? "");
        }
      });

      console.log("Submitting FormData:");
      for (let [k, v] of fd.entries()) console.log(k, v); // Debug

      await axios.post("/actionitem/add-test-data", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Test data submitted successfully ✅");
      navigate(`/dashboards/action-items/perform-testing/${trfproduct}`);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err?.response?.data?.message ?? "Submit failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Finalise without end date ────────────────────────────────────────────────
  const handleFinalise = async () => {
    try {
      setSubmitting(true);
      await axios.post("/actionitem/finalise-test-event", { id: teid });
      toast.success("Test finalised successfully ✅");
      navigate(`/dashboards/action-items/perform-testing/${trfproduct}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Finalise failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Retest ───────────────────────────────────────────────────────────────────
  const handleRetest = async () => {
    if (!window.confirm("Request a retest for this test?")) return;
    try {
      setRetesting(true);
      await axios.post(`/actionitem/request-reset/${teid}`);
      toast.success("Retest requested ✅");
      navigate(`/dashboards/action-items/perform-testing/${trfproduct}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Retest request failed ❌");
    } finally {
      setRetesting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Page title="Test Input">
        <div className="flex h-[60vh] items-center justify-center gap-3 text-gray-500">
          <Spinner /> Loading...
        </div>
      </Page>
    );
  }

  if (!testData) {
    return (
      <Page title="Test Input">
        <div className="flex h-[60vh] items-center justify-center text-gray-400">
          Nothing Here
        </div>
      </Page>
    );
  }

  return (
    <Page title="Test Input">
      <div className="transition-content w-full px-(--margin-x) pb-10">
        {/* Back Button */}
        <div className="mb-5">
          <button
            onClick={() =>
              navigate(`/dashboards/action-items/perform-testing/${trfproduct}`)
            }
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          >
            ← Back To Tests
          </button>
        </div>

        <Card className="p-6">
          {/* ── LRN ─────────────────────────────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 items-center gap-4 border-b border-gray-100 pb-4 dark:border-gray-800">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              LRN
            </label>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {lrn || "—"}
            </span>
          </div>

          {/* ── Temperature ─────────────────────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 items-center gap-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Temperature
              {(prow.mintemp || prow.maxtemp) && (
                <span className="ml-1 text-xs text-gray-400">
                  ({prow.mintemp}–{prow.maxtemp})
                </span>
              )}
            </label>
            <input
              type="text"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="Environment Temperature in deg celsius"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          {/* ── Humidity ────────────────────────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 items-center gap-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Humidity
              {(prow.minhumidity || prow.maxhumidity) && (
                <span className="ml-1 text-xs text-gray-400">
                  ({prow.minhumidity}% – {prow.maxhumidity}%)
                </span>
              )}
            </label>
            <input
              type="text"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
              placeholder="Environment Humidity in %"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          {/* ── Remark ──────────────────────────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 items-start gap-4">
            <label className="pt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Remark
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Theory & Remark"
              rows={3}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          {/* ── Upload Attachment ────────────────────────────────────────────── */}
          <div className="mb-6 grid grid-cols-2 items-center gap-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Upload Attachment
            </label>
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-600"
            />
          </div>

          {/* ── Grade / Size ─────────────────────────────────────────────────── */}
          {(testData.grade || testData.size) && (
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/40">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Grade
                </p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                  {testData.grade ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
                  Size
                </p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                  {testData.size ?? "—"}
                </p>
              </div>
            </div>
          )}

          {/* ── Parameter Remark ─────────────────────────────────────────────── */}
          {prow.remark && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
              {prow.remark}
            </div>
          )}

          {/* ── Instruments ──────────────────────────────────────────────────── */}
          {/* PHP: foreach($allins as $aid) → select instrument dropdown per category */}
          {instrList.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Instruments
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {instrList.map((instr) => {
                  // ✅ Handle both category_id and id field names
                  const catId = instr.category_id ?? instr.id;
                  const catName = instr.category_name ?? instr.name;
                  const options = instr.options ?? instr.instruments ?? [];
                  return (
                    <div key={catId}>
                      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        {catName}
                      </label>
                      <select
                        value={instruments[catId] ?? ""}
                        onChange={(e) =>
                          setInstruments((prev) => ({
                            ...prev,
                            [catId]: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      >
                        <option value="">Select {catName}</option>
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}({opt.newidno ?? opt.code ?? opt.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Consumables ──────────────────────────────────────────────────── */}
          {/* PHP: foreach parameterconsumables → select batch + quantity input */}
          {consumList.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Consumables
              </h4>
              <div className="space-y-3">
                {consumList.map((con) => {
                  // ✅ Handle both id and mid field names
                  const conId = con.id ?? con.mid;
                  const batches = con.batches ?? con.materiallocation ?? [];
                  return (
                    <div
                      key={conId}
                      className="grid grid-cols-3 items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {con.name}({con.consumable_id ?? con.consumable}) (in{" "}
                        {con.unit})
                      </div>
                      <select
                        value={consumables[conId]?.materiallocationid ?? ""}
                        onChange={(e) =>
                          setConsumables((prev) => ({
                            ...prev,
                            [conId]: {
                              ...(prev[conId] ?? {}),
                              materiallocationid: e.target.value,
                            },
                          }))
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      >
                        <option value=""></option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.newidno}({b.batchno})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder={`enter value in ${con.unit}`}
                        value={consumables[conId]?.quantity ?? ""}
                        onChange={(e) =>
                          setConsumables((prev) => ({
                            ...prev,
                            [conId]: {
                              ...(prev[conId] ?? {}),
                              quantity: e.target.value,
                            },
                          }))
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Measurement Table ─────────────────────────────────────────────── */}
          {/* PHP: parameterelements headers + cycle rows × element columns */}
          {paramElements.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {prow.name ?? testData?.parameter_name ?? "Measurements"}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      {paramElements.map((el) => {
                        // ✅ PHP: $pid = $frow['element'] — API field is "element"
                        const elId = el.element ?? el.element_id ?? el.id;
                        const elName = el.name ?? el.element_name;
                        return (
                          <th
                            key={elId}
                            className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase dark:text-gray-300"
                          >
                            {elName}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* PHP: for ($i=0; $i<$cycle; $i++) */}
                    {Array.from({ length: cycle }, (_, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        {paramElements.map((el) => {
                          // ✅ PHP: $pid = $frow['element']
                          const elId = el.element ?? el.element_id ?? el.id;
                          const elUnit = el.unit ?? "";
                          return (
                            <td key={elId} className="px-2 py-1">
                              {status === 0 ? (
                                // PHP: name="$pid[]" per cycle input
                                <input
                                  type="text"
                                  placeholder={`value in ${elUnit}`}
                                  value={measurements[i]?.[elId] ?? ""}
                                  onChange={(e) =>
                                    handleMeasurement(i, elId, e.target.value)
                                  }
                                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                                />
                              ) : (
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {measurements[i]?.[elId] ??
                                    el.saved_value ??
                                    "—"}{" "}
                                  {elUnit}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Action Buttons ────────────────────────────────────────────────── */}
          <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
            {/* status == 0: Submit */}
            {status === 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={clsx(
                    "rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700",
                    submitting && "cursor-not-allowed opacity-60",
                  )}
                >
                  {submitting ? "Submitting..." : "Submit Test Data"}
                </button>
              </div>
            )}

            {/* status == 24: Results + Finalise + Retest */}
            {status === 24 && (
              <>
                <ResultsTable results={results} />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={
                      has_documents
                        ? () => setEndDateModal(true)
                        : handleFinalise
                    }
                    disabled={submitting}
                    className={clsx(
                      "rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700",
                      submitting && "cursor-not-allowed opacity-60",
                    )}
                  >
                    {submitting ? "Finalising..." : "Finalise Data"}
                  </button>
                  <button
                    onClick={handleRetest}
                    disabled={retesting}
                    className={clsx(
                      "rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700",
                      retesting && "cursor-not-allowed opacity-60",
                    )}
                  >
                    {retesting ? "Requesting..." : "Retest Data"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Set End Date Modal */}
      {endDateModal && (
        <SetEndDateModal
          teid={teid}
          startDate={testData?.startdate}
          onClose={() => setEndDateModal(false)}
          onFinalised={() =>
            navigate(`/dashboards/action-items/perform-testing/${trfproduct}`)
          }
        />
      )}
    </Page>
  );
}
