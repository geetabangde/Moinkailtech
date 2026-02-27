// HodReportView.jsx  (ReviewByHodDetail.jsx)
// PHP equivalent  : testreport.php
// Route           : review-by-hod/:tid?hid=
// APIs:
//   GET  /actionitem/view-test-report?tid=&hid=
//   POST /actionitem/submit-qa-approve   { aid, hodremark, qid[], remnant[], remark[], itemdepartment[] }
//   POST /actionitem/approve-submit-ulr  { hid }

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "utils/axios";
import { toast } from "sonner";
import clsx from "clsx";
import { Page } from "components/shared/Page";
import {
  PrintWithLHButton,
  PrintWithoutLHButton,
  PrintWithoutLHTwoSignButton,
} from "./TestReportPdf";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// PHP: date("d.m.Y", strtotime($date))
function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d)
      .toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
      .replace(/\//g, ".");
  } catch { return d; }
}

// PHP: $sflag inline style string → React style object
// API gives: "background:#008d4c!important;color:#ffffff;text-align:center"
function parseComplianceStyle(styleStr) {
  if (!styleStr) return {};
  const result = {};
  styleStr.split(";").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx === -1) return;
    const prop     = part.slice(0, idx).trim();
    const val      = part.slice(idx + 1).trim().replace("!important", "").trim();
    if (!prop || !val) return;
    const camel    = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    result[camel]  = val;
  });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Re-test Button
// PHP: <button onclick="view(id,'catid','requestretest.php',...)">Request Re-test</button>
// ─────────────────────────────────────────────────────────────────────────────
function ReTestButton({ testEventId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const handle = useCallback(async () => {
    setLoading(true);
    try {
      await axios.get(`/actionitem/request-reset/${testEventId}`);
      toast.success("Re-test requested ✅");
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed ❌");
    } finally { setLoading(false); }
  }, [testEventId, onSuccess]);

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={clsx(
        "rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? "..." : "Request Re-test"}
    </button>
  );
}
ReTestButton.propTypes = { testEventId: PropTypes.any, onSuccess: PropTypes.func };

// ─────────────────────────────────────────────────────────────────────────────
// Info Row  (customer info table)
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap border-r border-gray-200 dark:border-gray-700">
        {label}
      </td>
      <td className="p-2 text-xs text-gray-800 dark:text-gray-200">{value ?? "—"}</td>
    </tr>
  );
}
InfoRow.propTypes = { label: PropTypes.string, value: PropTypes.any };

// ─────────────────────────────────────────────────────────────────────────────
// HOD Approve Form
// PHP: $reportstatus==7 && in_array(180,$permissions) && isset($hid) && !empty($hid)
// POST /actionitem/submit-qa-approve
// Payload: { aid, hodremark, qid[], remnant[], remark[], itemdepartment[] }
// ─────────────────────────────────────────────────────────────────────────────
function HodApproveForm({ hid, allottedItems, disposable, onSuccess }) {
  const [hodremark, setHodremark] = useState("");
  const [remnants,  setRemnants]  = useState(() => allottedItems.map(() => ""));
  const [remarks,   setRemarks]   = useState(() => allottedItems.map(() => ""));
  const [loading,   setLoading]   = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Postman payload: { aid, hodremark, qid[], remnant[], remark[], itemdepartment[] }
      const payload = {
        aid:            hid,
        hodremark,
        qid:            allottedItems.map((q) => q.qid),
        remnant:        remnants.map((r) => parseFloat(r) || 0),
        remark:         remarks,
        itemdepartment: allottedItems.map((q) => q.department),
      };
      await axios.post("/actionitem/submit-qa-approve", payload);
      toast.success("Approved & Submitted to QA ✅");
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Submission failed ❌");
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-800 p-5">

      {/* PHP: if ($trfprow['disposable'] == 2) red else green */}
      <div className={clsx(
        "mb-4 rounded-lg px-4 py-2 text-sm font-semibold",
        disposable === 2
          ? "bg-red-50 text-red-600 dark:bg-red-900/20"
          : "bg-green-50 text-green-700 dark:bg-green-900/20"
      )}>
        {disposable === 2
          ? "⚠️ This Item Is To Be Return — Not To Be Disposed"
          : "✅ This Item Is To Be Disposed"}
      </div>

      {/* PHP: <textarea name="hodremark" placeholder="Add Remark"> */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
          Add Remark
        </label>
        <textarea
          value={hodremark}
          onChange={(e) => setHodremark(e.target.value)}
          placeholder="Add Remark"
          rows={3}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
        />
      </div>

      {/* PHP: alloteditems table — only rows where $qrow['qleft'] > 0 */}
      {allottedItems.length > 0 && (
        <div className="mb-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 dark:bg-dark-700">
              <tr>
                {["ID", "Quantity", "Allotted", "Left", "Department", "Remnant", "Remark"].map((h) => (
                  <th key={h} className="border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allottedItems.map((item, i) =>
                // PHP: if ($qrow['qleft'] > 0)
                // API field is "qleft" (NOT "q_left")
                (item.qleft ?? 0) > 0 ? (
                  <tr key={item.id ?? i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.id}</td>
                    {/* PHP: packagequantity.name */}
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.quantity_name}</td>
                    {/* PHP: $qrow['alloted'] — API field is "alloted" (single t) */}
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.alloted}</td>
                    {/* PHP: $qrow['qleft'] — API field is "qleft" */}
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.qleft}</td>
                    {/* PHP: labs.name */}
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">{item.department_name}</td>
                    {/* PHP: <input name="remnant[]" max=$qrow['qleft']> */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max={item.qleft}
                        step="any"
                        value={remnants[i]}
                        onChange={(e) => {
                          const updated = [...remnants];
                          updated[i] = e.target.value;
                          setRemnants(updated);
                        }}
                        placeholder="Remnant quantity"
                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs outline-none focus:border-blue-500"
                      />
                    </td>
                    {/* PHP: <textarea name="remark[]"> */}
                    <td className="px-3 py-2">
                      <textarea
                        value={remarks[i]}
                        onChange={(e) => {
                          const updated = [...remarks];
                          updated[i] = e.target.value;
                          setRemarks(updated);
                        }}
                        placeholder="Remark for remnant"
                        rows={1}
                        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs outline-none focus:border-blue-500"
                      />
                    </td>
                  </tr>
                ) : null
              )}
            </tbody>
            {/* PHP: tfoot same headers */}
            <tfoot className="bg-gray-50 dark:bg-dark-800">
              <tr>
                {["ID", "Quantity", "Allotted", "Left", "Department", "Remnant", "Remark"].map((h) => (
                  <th key={h} className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                    {h}
                  </th>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* PHP: if (isset($hid) && (!empty($hid))) show submit button */}
      {!!hid && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={clsx(
            "w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700",
            loading && "opacity-60 cursor-not-allowed"
          )}
        >
          {loading ? "Submitting..." : "Approve, Submit to QA"}
        </button>
      )}
    </div>
  );
}
HodApproveForm.propTypes = {
  hid:           PropTypes.any,
  allottedItems: PropTypes.array,
  disposable:    PropTypes.number,
  onSuccess:     PropTypes.func,
};

// ─────────────────────────────────────────────────────────────────────────────
// QA Approve Button
// PHP: $reportstatus==8 && in_array(181,$permissions) && isset($hid) && !empty($hid)
// POST /actionitem/approve-submit-ulr  { hid }
// ─────────────────────────────────────────────────────────────────────────────
function QaApproveButton({ hid, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const handle = useCallback(async () => {
    setLoading(true);
    try {
      // Postman payload: { hid: 49092 }
      await axios.post("/actionitem/approve-submit-ulr", { hid });
      toast.success("Approved & Submitted for ULR ✅");
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed ❌");
    } finally { setLoading(false); }
  }, [hid, onSuccess]);

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={clsx(
        "rounded-lg bg-green-600 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? "Submitting..." : "Approve & Submit For ULR"}
    </button>
  );
}
QaApproveButton.propTypes = { hid: PropTypes.any, onSuccess: PropTypes.func };

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HodReportView() {
  const { tid }        = useParams();              // PHP: $_GET['hakuna']
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const hid            = searchParams.get("hid") ?? "";  // PHP: $_GET['what']

  const [report,  setReport]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    if (!tid) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ tid });
      if (hid) params.append("hid", hid);
      const res = await axios.get(`/actionitem/view-test-report?${params}`);
      setReport(res.data?.data ?? res.data ?? null);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [tid, hid]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <Page title="Test Report">
      <div className="flex h-[60vh] items-center justify-center gap-3 text-gray-500">
        <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
        </svg>
        Loading Report...
      </div>
    </Page>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <Page title="Test Report">
      <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
        >
          ← Go Back
        </button>
      </div>
    </Page>
  );

  if (!report) return null;

  // ── Destructure API response ──────────────────────────────────────────────
  const {
    trf_product    = {},
    nabl: nablObj  = {},           // { status:1, is_nabl, is_qai, logo }
    size,
    grade,
    batchno,                       // API key: "batchno"
    report_status: rsObj = {},     // { code, hodparams, pstatus, label }
    dates          = {},
    customer       = {},
    product        = {},
    trf            = {},
    received_items = [],
    test_results   = [],           // API key: "test_results"
    remarks: remarksObj = {},      // { hod_remark, witness_detail, witness, bdl_remark, adl_remark }
    signatories    = [],
    allotted_items = [],           // API: qleft, alloted (check these exact field names)
    counts         = {},
    permissions: permsObj = {},    // { has_hod_permission, has_qa_permission, can_view_actions }
    available_actions = [],
    meta           = {},
  } = report;

  // ── Values ────────────────────────────────────────────────────────────────

  const { brn, ulr, condition_name, sealed_name, reportdate, disposable } = trf_product;

  // PHP: $nabl = testprices.nabl (1=NABL, 3=QAI)
  const nablStatus = nablObj?.status ?? 0;

  // PHP: $reportstatus = hodrequests.status OR trfProducts.status
  // API: report_status.code
const reportStatus = typeof rsObj === "object" ? (rsObj?.code ?? 0) : (Number(rsObj) || 0);

  const { start_date, end_date } = dates;

  // PHP: remarks
  const hodRemark     = remarksObj?.hod_remark    ?? "";
  const witnessVal    = remarksObj?.witness        ?? "";
  const witnessDetail = remarksObj?.witness_detail ?? "";
  const bdlRemark     = remarksObj?.bdl_remark     ?? "";
  const adlRemark     = remarksObj?.adl_remark     ?? "";

  // PHP: in_array(180,$permissions) → has_hod_permission
  const canHod = permsObj?.has_hod_permission === true;
  const canQa  = permsObj?.has_qa_permission  === true;

  // PHP: if(perm 180||181) && reportstatus<9 → show Actions column
  const showActionsColumn = (canHod || canQa) && reportStatus < 9;

  // PHP: per-row retest button
  const showRetest = (row) =>
    showActionsColumn && (
      row.can_retest === true ||
      permsObj?.can_view_actions === true ||
      available_actions.some((a) => (typeof a === "object" ? a.id : a) === row.id)
    );

  // PHP: $reportstatus==7 && in_array(180) && isset($hid) && !empty($hid)
  const showHodForm   = reportStatus === 7 && canHod && !!hid;
  // PHP: $reportstatus==8 && in_array(181) && isset($hid) && !empty($hid)
  const showQaApprove = reportStatus === 8 && canQa  && !!hid;

  // PHP: $specs==1 → show SPECIFICATIONS column
  const hasSpecs =
    trf_product?.specification_flag === 1 ||
    Number(trf_product?.specification) === 1 ||
    test_results.some((r) => r.specification && r.specification !== "—");

  // PHP: nabl==1 → nabltest.png, nabl==3 → qai.jpeg
  const nablLogo =
    nablStatus === 1 ? (nablObj?.logo ?? "/images/nabltest.png") :
    nablStatus === 3 ? "/images/qai.jpeg" :
    null;

  const sealedLabel    = sealed_name ?? "—";
  const conditionLabel = condition_name ?? "—";

  // PHP: receiveditems qty string
  const qtyStr = received_items
    .filter((q) => (q.received ?? 0) > 0)
    .map((q) => {
      const name = q.quantity_name ?? "";
      if (name.toUpperCase().trim() === "NA") return "NA";
      return `${q.received} ${q.unit_name ?? ""}`.trim();
    })
    .join(", ") || "—";

  // PHP: Remarks block — hodremark + witness + BDL + ADL
  const remarkLines = [];
  if (hodRemark?.trim())                   remarkLines.push(hodRemark.trim());
  if (witnessVal === "1" && witnessDetail) remarkLines.push(`The test was witnessed by ${witnessDetail}`);
  if (bdlRemark)                           remarkLines.push(bdlRemark);
  if (adlRemark)                           remarkLines.push(adlRemark);

  const leftCount  = counts?.left_count  ?? counts?.pending_tests ?? 0;
  const doneCount  = counts?.done_count  ?? 0;
  const paramCount = counts?.param_count ?? 0;

  const customerName    = customer?.name           ?? "—";
  const customerAddress = customer?.address        ?? "";
  const contactPerson   = customer?.contact_person ?? "";
  const showContact     = Number(trf?.specificpurpose ?? customer?.specific_purpose) === 2;
  const customerRef     = customer?.letterrefno    ?? "";

  const productName  = product?.name        ?? "—";
  const productDesc  = product?.description ?? size ?? "—";
  const displayLRN   = trf_product?.lrn     ?? brn  ?? "—";
  const ktrcRef      = meta?.ktrc_ref       ?? "KTRC/QF/0708/01";
  const batchnoClean = (batchno ?? "").replace(/<br\s*\/?>/gi, " ").trim();

  return (
    <Page title={`REPORT-${ulr ?? ""}`}>
      <div className="transition-content px-(--margin-x) pb-8">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">Final Report</h1>
          </div>

          {/* PHP: Print With LH | Without LH | Without LH (2 Signs) */}
          <div className="flex items-center gap-2 no-print">
              {report && (
              <div className="flex items-center gap-2 no-print">
                <PrintWithLHButton report={report} />
                <PrintWithoutLHButton report={report} />
                <PrintWithoutLHTwoSignButton report={report} />
              </div>
            )}
            </div>
        </div>

        {/* ── Report Card ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-dark-800">
          <div className="px-6 py-6">

            {/* PHP: if ($nabl==1) nabltest.png elseif ($nabl==3) qai.jpeg */}
            {nablLogo && (
              <div className="mb-3 flex justify-center">
                <img src={nablLogo} alt="Accreditation Logo" className="h-16 w-auto" />
              </div>
            )}

            {/* PHP: <h1><u>TEST REPORT</u></h1> */}
            <h1 className="mb-4 text-center text-xl font-bold underline tracking-wide text-gray-900 dark:text-gray-100">
              TEST REPORT
            </h1>

            {/* PHP: if ($nabl==1) ULR:$ulr  ||  KTRC/QF/0708/01 */}
            <div className="mb-4 flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span>{nablStatus === 1 && ulr ? `ULR: ${ulr}` : "ULR:"}</span>
              <span>{ktrcRef}</span>
            </div>

            {/* ── Customer Info Table ────────────────────────────────────── */}
            <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="w-2/5 align-top p-3 border-r border-gray-200 dark:border-gray-700" rowSpan={8}>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Name and Address of Customer
                      </p>
                      <p className="text-gray-800 dark:text-gray-200">{customerName}</p>
                      <p className="text-gray-600 dark:text-gray-400">{customerAddress}</p>
                      {/* PHP: if ($specificpurpose == 2) */}
                      {showContact && contactPerson && (
                        <p className="mt-1 text-gray-700 dark:text-gray-300">
                          Contact Person: {contactPerson}
                        </p>
                      )}
                    </td>
                    {/* PHP: LRN = $trfprow['brn'] */}
                    <td className="p-2 font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 w-1/4">
                      Laboratory Reference Number (LRN)
                    </td>
                    <td className="p-2 text-gray-800 dark:text-gray-200">{displayLRN}</td>
                  </tr>
                  <InfoRow label="Date of Receipt"             value={fmtDate(trf?.date ?? dates?.receipt_date)} />
                  <InfoRow label="Condition, When Received"    value={conditionLabel} />
                  <InfoRow label="Packing, When Received"      value={sealedLabel} />
                  <InfoRow label="Quantity Received (Approx.)" value={qtyStr} />
                  <InfoRow label="Date of Start Of Test"       value={fmtDate(start_date)} />
                  <InfoRow label="Date of Completion"          value={fmtDate(end_date)} />
                  <InfoRow label="Date of Reporting"           value={fmtDate(reportdate ?? dates?.report_date)} />
                </tbody>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td colSpan={3} className="p-2 text-gray-700 dark:text-gray-300">
                      Sample Identification: {productDesc}
                    </td>
                  </tr>
                  {/* PHP: if ($trfrow['letterrefno'] != "-") */}
                  {customerRef && customerRef !== "-" && (
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td colSpan={3} className="p-2 text-gray-700 dark:text-gray-300">
                        Customer Reference: {customerRef}
                      </td>
                    </tr>
                  )}
                  {/* PHP: Sample Particulars: $proname Grade: $grade $batchno */}
                  <tr>
                    <td colSpan={3} className="p-2 text-gray-700 dark:text-gray-300">
                      Sample Particulars: {productName} Grade: {grade} {batchnoClean}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── TEST RESULTS ──────────────────────────────────────────── */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-bold text-gray-800 dark:text-gray-100">TEST RESULTS</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-dark-700">
                    <tr>
                      {["S.NO", "PARAMETER", "UNIT", "RESULTS", "TEST METHOD"].map((h) => (
                        <th key={h} className="border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                          {h}
                        </th>
                      ))}
                      {/* PHP: if ($specs==1) */}
                      {hasSpecs && (
                        <th className="border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                          SPECIFICATIONS
                        </th>
                      )}
                      {/* PHP: if(perm 180||181) && $reportstatus<9 */}
                      {showActionsColumn && (
                        <th className="border-b border-gray-200 dark:border-gray-700 px-3 py-2 text-center font-semibold text-gray-700 dark:text-gray-300 no-print">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {test_results.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                          No test results found.
                        </td>
                      </tr>
                    ) : (
                      test_results.map((row, idx) => {
                        // PHP: $sflag inline style
                        const cellStyle     = parseComplianceStyle(row.compliance_style);
                        // PHP: BDL/ADL display_value
                        const displayResult = row.result?.display_value ?? row.result?.value ?? "—";
                        // PHP: units.description
                        const unitDisplay   = row.unit?.description ?? row.unit?.name ?? "—";
                        // PHP: methods.name
                        const methodName    = row.method?.name ?? "—";

                        return (
                          <tr key={row.id ?? idx} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                              {row.sno ?? idx + 1}
                            </td>
                            <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                              {row.parameter_name}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                              {unitDisplay}
                            </td>
                            {/* PHP: <td $sflag>$rresult</td> */}
                            <td className="px-3 py-2" style={cellStyle}>
                              {displayResult}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                              {methodName}
                            </td>
                            {hasSpecs && (
                              <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300">
                                {row.specification ?? "—"}
                              </td>
                            )}
                            {showActionsColumn && (
                              <td className="px-3 py-2 text-center no-print">
                                {showRetest(row) && (
                                  <ReTestButton testEventId={row.id} onSuccess={fetchReport} />
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Remarks ───────────────────────────────────────────────── */}
            {/* PHP: if hodremark || wdetail || remark || remark1 */}
            {remarkLines.length > 0 && (
              <div className="mb-4 rounded-lg bg-gray-50 dark:bg-dark-700 px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                <strong>Remark: </strong>
                {remarkLines.map((line, i) => (
                  <span key={i}>{i > 0 && <br />}{line}</span>
                ))}
              </div>
            )}

            {/* PHP: if ($tid != "1356") **End of Report** */}
            {String(tid) !== "1356" && (
              <div className="mb-6 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                **End of Report**
              </div>
            )}

            {/* ── Signatories ───────────────────────────────────────────── */}
            {signatories.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-8">
                {signatories.map((signer, i) => (
                  <div key={signer.signer_id ?? i} className="min-w-[180px]">
                    {signer.is_signed ? (
                      <div>
                        {/* PHP: "Reviewed By:" / "Authorized By:" / "Reviewed & Authorized By:" */}
                        {signer.title && (
                          <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {signer.title}
                          </p>
                        )}
                        {/* PHP: fetchattachment(sign_image) */}
                        {signer.sign_image_url && (
                          <img
                            src={signer.sign_image_url}
                            alt=""
                            className="mb-1 h-6 w-auto object-contain"
                          />
                        )}
                        {/* PHP: PlaceWatermark → digital signature */}
                        {signer.digital_signature_url && (
                          <img
                            src={signer.digital_signature_url}
                            alt={`Signed by ${signer.display_name}`}
                            className="h-14 object-contain"
                          />
                        )}
                      </div>
                    ) : (
                      // PHP: not signed — show name + authorizefor only
                      <div className="text-xs text-gray-700 dark:text-gray-300">
                        {signer.title && (
                          <p className="mb-1 font-medium text-gray-500 dark:text-gray-400">
                            {signer.title}
                          </p>
                        )}
                        <p className="font-semibold">{signer.display_name ?? signer.name}</p>
                        <p className="text-gray-500">{signer.authorizefor}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Pending Tests info ─────────────────────────────────────── */}
            {/* PHP: $leftcount > 0 || ($paramcount > $donecount) */}
            {(leftCount > 0 || paramCount > doneCount) && (
              <div className="no-print mb-4 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>{leftCount} Tests Pending completion</p>
                <p>{paramCount - (doneCount + leftCount)} Tests Pending Assignment</p>
              </div>
            )}

            {/* ── HOD Approve Form ──────────────────────────────────────── */}
            {/* PHP: $reportstatus==7 && in_array(180,$permissions) && isset($hid) && !empty($hid) */}
            {showHodForm && (
              <HodApproveForm
                hid={hid}
                allottedItems={allotted_items}
                disposable={Number(disposable)}
                onSuccess={() => navigate(-1)}
              />
            )}

            {/* ── QA Approve Button ─────────────────────────────────────── */}
            {/* PHP: $reportstatus==8 && in_array(181,$permissions) && isset($hid) && !empty($hid) */}
            {showQaApprove && (
              <div className="mt-6 flex justify-center">
                <QaApproveButton hid={hid} onSuccess={() => navigate(-1)} />
              </div>
            )}

          </div>
        </div>
      </div>
    </Page>
  );
}