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
// PHP: testinput.php?hakuna={teid}
// Route: /dashboards/action-items/test-input/:teid
//
// PHP Logic:
//   1. Load testeventdata row by $teid
//   2. Load parameter info (prow) → mintemp, maxtemp, minhumidity, maxhumidity,
//      cycle, measurements, instruments, formula, remark
//   3. If status==0 or status==24 → set default temp=27, humidity=30, remark=""
//   4. Render instrument dropdowns (per parameter's instruments list)
//   5. Render consumables rows (parameterconsumables table)
//   6. Render measurement table → cycle rows × parameterelements columns
//   7. If status==0  → "Submit Test Data" button → inserttestdata.php
//   8. If status==24 → show results table + "Finalise Data" + "Retest Data"
//      Finalise: if has_documents → setEndDate modal → finalsubmitdata.php
//               else              → finalsubmitdata.php directly
//
// APIs:
//   GET  /actionitem/get-test-event/{teid}          → load full test event data
//   POST /actionitem/add-test-data                   → inserttestdata.php (submit)
//   POST /actionitem/finalise-test-event             → finalsubmitdata.php
//   POST /actionitem/request-reset/{teid}            → requestretest.php (Retest)
// =============================================================================

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
    </svg>
  );
}

// ── Results table for status==24 ──────────────────────────────────────────────
// PHP: shows parameter name, unit, result (min/max/avg by resultype), method, specification
function ResultsTable({ results = [] }) {
  if (!results.length) return <p className="py-4 text-sm text-gray-400">No results found.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {["S.No", "Parameter", "Unit", "Results", "Test Method", "Permissible Value"].map((h) => (
              <th key={h} className="px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
              <td className="px-3 py-2">{i + 1}</td>
              <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{r.parameter_name ?? "—"}</td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.unit ?? "—"}</td>
              <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-100">{r.result ?? "—"}</td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.method ?? "—"}</td>
              <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.specification ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Set End Date Modal ────────────────────────────────────────────────────────
// PHP: modal-setEndDate → submiEndDate() → finalsubmitdata.php?updating&enddate={date}
function SetEndDateModal({ teid, startDate, onClose, onFinalised }) {
  const [endDate,    setEndDate]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!endDate) { toast.error("Please select an end date."); return; }
    const [y, m, d] = endDate.split("-");
    const formatted = `${d}/${m}/${y}`;
    try {
      setSubmitting(true);
      // PHP: view(teid, 'resultid', 'finalsubmitdata.php', `updating&enddate=${date}`)
      await axios.post("/actionitem/finalise-test-event", {
        teid: teid,
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

  // PHP: datepickerminmaxlimit(id, startdate, today) → between startdate and today
  const minDate = startDate
    ? new Date(startDate).toISOString().split("T")[0]
    : undefined;
  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-dark-100">
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
          <button onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400">
            Close
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className={clsx(
              "rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700",
              submitting && "cursor-not-allowed opacity-60"
            )}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TestInput() {
  const { teid }  = useParams();
  const navigate  = useNavigate();

  const [testData,     setTestData]     = useState(null);  // full event data from API
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [retesting,    setRetesting]    = useState(false);
  const [endDateModal, setEndDateModal] = useState(false);

  // ── Form state ──────────────────────────────────────────────────────────────
  // PHP defaults: temperature=27, humidity=30, remark=""
  const [temperature,  setTemperature]  = useState("27");
  const [humidity,     setHumidity]     = useState("30");
  const [remark,       setRemark]       = useState("");
  const [attachment,   setAttachment]   = useState(null);

  // Instruments: { [instrument_category_id]: selected_instrument_id }
  const [instruments, setInstruments] = useState({});

  // Consumables: { [parameterconsumable_id]: { materiallocationid, quantity } }
  const [consumables, setConsumables] = useState({});

  // Measurement rows: { [cycle_index]: { [element_id]: value } }
  const [measurements, setMeasurements] = useState({});

  // ── Fetch test event data ────────────────────────────────────────────────────
  // API: GET /actionitem/get-test-event/{teid}
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/actionitem/get-test-event/${teid}`);
      const d   = res.data?.data ?? res.data ?? null;
      setTestData(d);

      // PHP: if status==0 or status==24 → set defaults
      const st = Number(d?.status ?? 0);
      if (st === 0 || st === 24) {
        setTemperature(d?.temperature ?? "27");
        setHumidity(d?.humidity      ?? "30");
        setRemark(d?.remark          ?? "");
      }

      // Pre-fill existing instrument selections
      if (d?.selected_instruments) {
        setInstruments(d.selected_instruments);
      }

      // Pre-fill existing measurements if any
      if (d?.existing_measurements) {
        setMeasurements(d.existing_measurements);
      }
    } catch (err) {
      console.error("Error loading test event:", err);
      toast.error("Failed to load test data.");
    } finally {
      setLoading(false);
    }
  }, [teid]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const status       = Number(testData?.status ?? 0);
  const prow         = testData?.parameter_info    ?? {};   // PHP: $prow
  const paramElements= testData?.parameter_elements ?? [];  // PHP: parameterelements
  const cycle        = Number(prow?.cycle ?? 1);            // PHP: $cycle
  const instrList    = testData?.instrument_list    ?? [];  // PHP: $allins + instrument options
  const consumList   = testData?.consumables        ?? [];  // PHP: parameterconsumables
  const results      = testData?.results            ?? [];  // PHP: status==24 results table
  const has_documents= Boolean(testData?.has_documents);    // PHP: mysqli_num_rows($itemDocument)
  const lrn          = testData?.lrn                ?? "";  // PHP: $lrn
  const trfproduct   = testData?.trfproduct         ?? testData?.tid ?? "";

  // ── Measurement cell change handler ─────────────────────────────────────────
  const handleMeasurement = (cycleIdx, elementId, value) => {
    setMeasurements((prev) => ({
      ...prev,
      [cycleIdx]: { ...(prev[cycleIdx] ?? {}), [elementId]: value },
    }));
  };

  // ── POST /actionitem/add-test-data ───────────────────────────────────────────
  // PHP: inserttestdata.php → saves instruments, consumables, measurements
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("teid", teid);
      fd.append("temperature", temperature);
      fd.append("humidity",    humidity);
      fd.append("remark",      remark);
      if (attachment) fd.append("attachment", attachment);

      // PHP: instrument[aid] = selected_id
      Object.entries(instruments).forEach(([aid, val]) => {
        fd.append(`instrument[${aid}]`, val);
      });

      // PHP: materiallocationid[mid] + quantity[mid]
      Object.entries(consumables).forEach(([mid, vals]) => {
        fd.append(`materiallocationid[${mid}]`, vals.materiallocationid ?? "");
        fd.append(`quantity[${mid}]`,           vals.quantity ?? "");
      });

      // PHP: measurement_id[] per cycle → name="pid[]"
      // Send as: measurements = { cycle_idx: { element_id: value } }
      fd.append("measurements", JSON.stringify(measurements));

      await axios.post("/actionitem/add-test-data", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Test data submitted successfully ✅");
      navigate(`/dashboards/action-items/perform-testing/${trfproduct}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Submit failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Finalise without end date (no documents case) ────────────────────────────
  // PHP: view(teid, 'resultid', 'finalsubmitdata.php', 'updating')
  const handleFinalise = async () => {
    try {
      setSubmitting(true);
      await axios.post("/actionitem/finalise-test-event", {
        teid: teid,
    });
      toast.success("Test finalised successfully ✅");
      navigate(`/dashboards/action-items/perform-testing/${trfproduct}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Finalise failed ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Retest — POST /actionitem/request-reset/{teid} ───────────────────────────
  // PHP: view(teid, 'resultid', 'requestretest.php', 'updating')
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
      <div className="transition-content w-full pb-10 px-(--margin-x)">

        {/* ── Back button — PHP: href="performtest.php?hakuna={trfproduct}" ── */}
        <div className="mb-5">
          <button
            onClick={() => navigate(`/dashboards/action-items/perform-testing/${trfproduct}`)}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          >
            ← Back To Tests
          </button>
        </div>

        <Card className="p-6">

          {/* ── LRN ─────────────────────────────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 items-center gap-4 border-b border-gray-100 pb-4 dark:border-gray-800">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">LRN</label>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{lrn || "—"}</span>
          </div>

          {/* ── Temperature ─────────────────────────────────────────────────── */}
          {/* PHP: Temperature({prow.mintemp}-{prow.maxtemp}) */}
          <div className="mb-4 grid grid-cols-2 items-center gap-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Temperature
              {(prow.mintemp || prow.maxtemp) && (
                <span className="ml-1 text-xs text-gray-400">
                  ({prow.mintemp ?? ""}–{prow.maxtemp ?? ""})
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
          {/* PHP: Humidity({prow.minhumidity}% - {prow.maxhumidity}%) */}
          <div className="mb-4 grid grid-cols-2 items-center gap-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Humidity
              {(prow.minhumidity || prow.maxhumidity) && (
                <span className="ml-1 text-xs text-gray-400">
                  ({prow.minhumidity ?? ""}% – {prow.maxhumidity ?? ""}%)
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
            <label className="pt-2 text-sm font-medium text-gray-600 dark:text-gray-400">Remark</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Theory & Remark"
              rows={3}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          {/* ── Upload Attachment ────────────────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 items-center gap-4">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload Attachment</label>
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
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Grade</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{testData.grade ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Size</p>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{testData.size ?? "—"}</p>
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
                {instrList.map((instr) => (
                  <div key={instr.category_id}>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      {instr.category_name}
                    </label>
                    <select
                      value={instruments[instr.category_id] ?? ""}
                      onChange={(e) =>
                        setInstruments((prev) => ({
                          ...prev,
                          [instr.category_id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="">Select {instr.category_name}</option>
                      {/* PHP: valid instruments where mastervalidity.enddate > today */}
                      {(instr.options ?? []).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}({opt.newidno})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
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
                {consumList.map((con) => (
                  <div key={con.id} className="grid grid-cols-3 items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    {/* PHP: rowinstrument.name (consumable) + unit */}
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {con.name}({con.consumable_id}) (in {con.unit})
                    </div>
                    {/* PHP: select materiallocation batch */}
                    <select
                      value={consumables[con.id]?.materiallocationid ?? ""}
                      onChange={(e) =>
                        setConsumables((prev) => ({
                          ...prev,
                          [con.id]: { ...(prev[con.id] ?? {}), materiallocationid: e.target.value },
                        }))
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value=""></option>
                      {(con.batches ?? []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.newidno}({b.batchno})
                        </option>
                      ))}
                    </select>
                    {/* PHP: quantity input */}
                    <input
                      type="text"
                      placeholder={`enter value in ${con.unit}`}
                      value={consumables[con.id]?.quantity ?? ""}
                      onChange={(e) =>
                        setConsumables((prev) => ({
                          ...prev,
                          [con.id]: { ...(prev[con.id] ?? {}), quantity: e.target.value },
                        }))
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Measurement Table ─────────────────────────────────────────────── */}
          {/* PHP: parameterelements → headers; cycle rows → input cells */}
          {paramElements.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {prow.name ?? "Measurements"}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      {paramElements.map((el) => (
                        <th key={el.element_id}
                          className="px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                          {el.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* PHP: for ($i=0; $i<$cycle; $i++) */}
                    {Array.from({ length: cycle }, (_, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        {paramElements.map((el) => (
                          <td key={el.element_id} className="px-2 py-1">
                            {/* PHP: status==0 → input; status==24 → readonly */}
                            {status === 0 ? (
                              <input
                                type="text"
                                placeholder={`value in ${el.unit ?? ""}`}
                                value={measurements[i]?.[el.element_id] ?? ""}
                                onChange={(e) => handleMeasurement(i, el.element_id, e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                              />
                            ) : (
                              // status==24 → show saved value + unit (from testdata table)
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {measurements[i]?.[el.element_id] ?? el.saved_value ?? "—"} {el.unit ?? ""}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              ACTION BUTTONS
              PHP:
                status==0  → "Submit Test Data"  → inserttestdata.php
                status==24 → Results table +
                             "Finalise Data" (has_documents → enddate modal,
                                              no docs → direct)
                           + "Retest Data"   → requestretest.php
          ══════════════════════════════════════════════════════════════════ */}
          <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">

            {/* ── status == 0: Submit ──────────────────────────────────────── */}
            {status === 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={clsx(
                    "rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700",
                    submitting && "cursor-not-allowed opacity-60"
                  )}
                >
                  {submitting ? "Submitting..." : "Submit Test Data"}
                </button>
              </div>
            )}

            {/* ── status == 24: Results table + Finalise + Retest ─────────── */}
            {status === 24 && (
              <>
                <ResultsTable results={results} />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {/* PHP: has_documents → setEndDate modal, else direct finalise */}
                  <button
                    onClick={has_documents ? () => setEndDateModal(true) : handleFinalise}
                    disabled={submitting}
                    className={clsx(
                      "rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700",
                      submitting && "cursor-not-allowed opacity-60"
                    )}
                  >
                    {submitting ? "Finalising..." : "Finalise Data"}
                  </button>
                  <button
                    onClick={handleRetest}
                    disabled={retesting}
                    className={clsx(
                      "rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700",
                      retesting && "cursor-not-allowed opacity-60"
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

      {/* ── Set End Date Modal ───────────────────────────────────────────────── */}
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