// AddCalibrationInvoice.jsx
// Route: /dashboards/accounts/calibration-invoice-list/add
// PHP: generateInvoiceCalibration.php → insertCalibrationInvoice.php
// Permission: 61
//
// Flow:
//   1. Select Customer + Bill Type (Normal / Fix Cost)
//   2. getPoDetail → GET /accounts/get-ponumber/:customerid
//   3. Select PO → getServiceReportDetail → GET /accounts/get-service-reportforinvoice
//   4. Select Inward IDs → GET /accounts/get-invoice-item + GET /accounts/get-brn-number
//   5. Items table with sumamount() logic
//   6. POST /accounts/add-calibration-invoice

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";

// ── Style tokens ──────────────────────────────────────────────────────────
const inputCls =
  "dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const selectCls =
  "dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelCls = "dark:text-dark-300 mb-1 block text-sm font-medium text-gray-700";

const COMPANY_STATE_CODE = "23";

// ── PHP sumamount() port ──────────────────────────────────────────────────
function calcTotals(items, charges, sgst, potype) {
  let subtotal = 0;
  if (potype === "Normal") {
    subtotal = items.reduce((s, i) => s + (parseFloat(i.rate) || 0), 0);
  } else {
    subtotal = parseFloat(charges.subtotal) || 0;
  }

  const discnumber = parseFloat(charges.discnumber) || 0;
  const disctype = charges.disctype || "%";
  const discount = disctype === "%" ? (subtotal / 100) * discnumber : discnumber;

  const mobilisation = parseFloat(charges.mobilisation) || 0;
  const freight = parseFloat(charges.freight) || 0;

  const witnessnumber = parseFloat(charges.witnessnumber) || 0;
  const witnesstype = charges.witnesstype || "%";
  const witnesscharges =
    witnesstype === "%" ? (subtotal / 100) * witnessnumber : witnessnumber;

  const subtotal2 =
    subtotal - discount + freight + witnesscharges + mobilisation;

  const cgstper = parseFloat(charges.cgstper) || 0;
  const sgstper = parseFloat(charges.sgstper) || 0;
  const igstper = parseFloat(charges.igstper) || 0;

  const cgstamount = sgst ? parseFloat(((subtotal2 / 100) * cgstper).toFixed(2)) : 0;
  const sgstamount = sgst ? parseFloat(((subtotal2 / 100) * sgstper).toFixed(2)) : 0;
  const igstamount = !sgst ? parseFloat(((subtotal2 / 100) * igstper).toFixed(2)) : 0;

  const total = parseFloat(
    (subtotal2 + cgstamount + sgstamount + igstamount).toFixed(2),
  );
  const finaltotal = Math.round(total);
  const roundoff = parseFloat((finaltotal - total).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    witnesscharges: parseFloat(witnesscharges.toFixed(2)),
    subtotal2: parseFloat(subtotal2.toFixed(2)),
    cgstamount, sgstamount, igstamount,
    total, finaltotal, roundoff,
  };
}

// ── Date helper ───────────────────────────────────────────────────────────
const toPhpDate = (d) => {
  if (!d) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

// ── Spinner ───────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex h-[60vh] items-center justify-center gap-2 text-gray-600">
      <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
      </svg>
      Loading...
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function AddCalibrationInvoice() {
  const navigate = useNavigate();

  // ── Step 1: Customer + PO ─────────────────────────────────────────────
  const [customers, setCustomers] = useState([]);
  const [customerid, setCustomerid] = useState("");
  const [potype, setPotype] = useState("Normal");
  const [ponumbers, setPonumbers] = useState([]);
  const [selectedPo, setSelectedPo] = useState("");

  // ── Step 2: Inward IDs ────────────────────────────────────────────────
  const [inwardOptions, setInwardOptions] = useState([]);
  const [selectedInwards, setSelectedInwards] = useState([]);

  // ── Step 3: Items ─────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [brnnos, setBrnnos] = useState("");
  const [remark, setRemark] = useState("");

  // ── Customer details (for invoice) ───────────────────────────────────
  const [custDetail, setCustDetail] = useState({
    customername: "", addressid: "", address: "",
    statecode: "", pan: "", gstno: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [invoicedate, setInvoicedate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  // ── Charges ───────────────────────────────────────────────────────────
  const [charges, setCharges] = useState({
    subtotal: 0,
    discnumber: 0, disctype: "%",
    mobilisation: 0, freight: 0,
    witnesstype: "%", witnessnumber: 0,
    cgstper: 9, sgstper: 9, igstper: 18,
  });
  const setCharge = (k, v) => setCharges((p) => ({ ...p, [k]: v }));

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);

  // isSgst — PHP: if statecode==companystatecode → sgst=1
  const isSgst =
    String(custDetail.statecode || "").padStart(2, "0") === COMPANY_STATE_CODE;

  const totals = calcTotals(items, charges, isSgst, potype);

  // ── Load customers ────────────────────────────────────────────────────
  useEffect(() => {
    axios.get("/people/get-all-customers").then((res) => {
      setCustomers(res.data.data ?? res.data ?? []);
      setLoadingCustomers(false);
    });
  }, []);

  // ── PHP: getPoDetail → getpodetailforinvoice.php ──────────────────────
  // API: GET /accounts/get-ponumber/:customerid
  const loadPoNumbers = useCallback(
    async (cid) => {
      if (!cid) {
        setPonumbers([]);
        return;
      }
      try {
        const res = await axios.get(`/accounts/get-ponumber/${cid}`);
        setPonumbers(res.data.data ?? res.data ?? []);
        setSelectedPo("");
        setInwardOptions([]);
        setSelectedInwards([]);
        setItems([]);
        setBrnnos("");
      } catch {
        toast.error("Failed to load PO numbers");
      }

      // Load customer address for invoice
      try {
        const c = customers.find((c) => String(c.id) === String(cid));
        const addrRes = await axios.get(`/people/get-customers-address/${cid}`);
        const addrs = addrRes.data.data ?? addrRes.data ?? [];
        setAddresses(addrs);
        setCustDetail((p) => ({
          ...p,
          customername: c?.name ?? "",
          statecode: String(c?.statecode ?? ""),
          pan: c?.pan ?? "",
          gstno: c?.gstno ?? "",
          addressid: addrs[0]?.id ?? "",
          address: addrs[0]?.address ?? "",
        }));
      } catch {
        // ignore
      }
    },
    [customers],
  );

  useEffect(() => {
    loadPoNumbers(customerid, potype);
  }, [customerid, potype, loadPoNumbers]);

  // ── PHP: getServiceReportDetail → getServiceReportFormForInvoice.php ──
  // API: GET /accounts/get-service-reportforinvoice?customerid=&ponumber=&potype=
  const loadServiceReport = useCallback(async (po) => {
    if (!po || !customerid) return;
    try {
      const res = await axios.get(
        `/accounts/get-service-reportforinvoice?customerid=${customerid}&ponumber=${encodeURIComponent(po)}&potype=${potype}`,
      );
      setInwardOptions(res.data.data ?? res.data ?? []);
      setSelectedInwards([]);
      setItems([]);
      setBrnnos("");
    } catch {
      toast.error("Failed to load service report");
    }
  }, [customerid, potype]);

  useEffect(() => {
    loadServiceReport(selectedPo);
  }, [selectedPo, loadServiceReport]);

  // ── PHP: getServiceReportDetail + getCalibrationInvoiceBrnNos ─────────
  // API: GET /accounts/get-invoice-item?potype=&customerid=&ponumber=&inwardid=
  // API: GET /accounts/get-brn-number?inwardid=
  const loadItems = useCallback(async (inwards) => {
    if (!inwards.length || !selectedPo || !customerid) {
      setItems([]);
      setBrnnos("");
      return;
    }
    setLoadingItems(true);
    try {
      const inwardParam = inwards.join(",");
      const [itemsRes, brnRes] = await Promise.all([
        axios.get(
          `/accounts/get-invoice-item?potype=${potype}&customerid=${customerid}&ponumber=${encodeURIComponent(selectedPo)}&inwardid=${inwardParam}`,
        ),
        axios.get(`/accounts/get-brn-number?inwardid=${inwardParam}`),
      ]);
      const rawItems = itemsRes.data.data ?? itemsRes.data ?? [];
      setItems(rawItems.map((i, idx) => ({ ...i, _key: `item-${idx}` })));
      setBrnnos(brnRes.data.data ?? brnRes.data ?? "");
    } catch {
      toast.error("Failed to load invoice items");
    } finally {
      setLoadingItems(false);
    }
  }, [customerid, selectedPo, potype]);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!customerid) { toast.error("Customer required"); return; }
    if (!selectedPo) { toast.error("PO Number required"); return; }
    if (!selectedInwards.length) { toast.error("Inward Entry required"); return; }
    if (!items.length) { toast.error("No items found"); return; }

    setSaving(true);
    try {
      const payload = {
        customerid: Number(customerid),
        potype,
        ponumber: selectedPo,
        inwardid: selectedInwards.map(Number),
        customername: custDetail.customername,
        addressid: Number(custDetail.addressid),
        address: custDetail.address,
        statecode: custDetail.statecode,
        pan: custDetail.pan,
        gstno: custDetail.gstno,
        invoicedate: toPhpDate(invoicedate),

        itemid: items.map((i) => i.id ?? i.itemid ?? 0),
        itemname: items.map((i) => i.name ?? i.itemname ?? ""),
        iteminstid: items.map((i) => i.instid ?? i.iteminstid ?? 0),
        itemidno: items.map((i) => i.idno ?? i.itemidno ?? ""),
        brnno: items.map((i) => i.brnno ?? ""),
        itemserialno: items.map((i) => i.serialno ?? i.itemserialno ?? ""),
        itemlocation: items.map((i) => i.location ?? i.itemlocation ?? "Lab"),
        itemaccreditation: items.map((i) => i.accreditation ?? i.itemaccreditation ?? ""),
        itempackagename: items.map((i) => i.packagename ?? i.itempackagename ?? ""),
        itempackagedesc: items.map((i) => i.packagedesc ?? i.itempackagedesc ?? ""),
        itempricematrixid: items.map((i) => i.pricematrixid ?? i.itempricematrixid ?? 0),
        iteminwardid: items.map((i) => i.inwardid ?? selectedInwards[0] ?? 0),
        itemrate: items.map((i) => parseFloat(i.rate) || 0),

        subtotal: totals.subtotal,
        discnumber: parseFloat(charges.discnumber) || 0,
        disctype: charges.disctype,
        discount: totals.discount,
        freight: parseFloat(charges.freight) || 0,
        mobilisation: parseFloat(charges.mobilisation) || 0,
        witnessnumber: parseFloat(charges.witnessnumber) || 0,
        witnesstype: charges.witnesstype,
        witnesscharges: totals.witnesscharges,
        subtotal2: totals.subtotal2,
        cgstper: isSgst ? parseFloat(charges.cgstper) || 0 : 0,
        cgstamount: totals.cgstamount,
        sgstper: isSgst ? parseFloat(charges.sgstper) || 0 : 0,
        sgstamount: totals.sgstamount,
        igstper: !isSgst ? parseFloat(charges.igstper) || 0 : 0,
        igstamount: totals.igstamount,
        total: totals.total,
        roundoff: totals.roundoff,
        finaltotal: totals.finaltotal,
        remark,
        brnnos,
      };

      const res = await axios.post("/accounts/add-calibration-invoice", payload);
      if (res.data.success === true || res.data.status === true || res.data.status === "true") {
        toast.success("Invoice added ✅");
        navigate("/dashboards/accounts/calibration-invoice-list");
      } else {
        toast.error(res.data.message ?? "Failed to add invoice");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loadingCustomers) return <Page title="Add Calibration Invoice"><Spinner /></Page>;

  return (
    <Page title="Add Calibration Invoice">
      <div className="transition-content px-(--margin-x) pb-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="dark:text-dark-50 text-xl font-semibold text-gray-800">
            Add Calibration Invoice
          </h2>
          <button
            onClick={() => navigate("/dashboards/accounts/calibration-invoice-list")}
            className="dark:border-dark-500 dark:text-dark-300 rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Back to Invoice List
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* ── Left: Form ── */}
          <div className="space-y-5 lg:col-span-1">
            <Card className="p-5">
              <h3 className="dark:text-dark-100 mb-4 text-sm font-semibold text-gray-700 uppercase">
                Invoice Details
              </h3>

              {/* Customer */}
              <div className="mb-3">
                <label className={labelCls}>Customer <span className="text-red-500">*</span></label>
                <select
                  value={customerid}
                  onChange={(e) => setCustomerid(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Bill Type — PHP: potype Normal / Fix Cost */}
              <div className="mb-3">
                <label className={labelCls}>Bill Type <span className="text-red-500">*</span></label>
                <select value={potype} onChange={(e) => setPotype(e.target.value)} className={selectCls}>
                  <option value="Normal">Normal</option>
                  <option value="Fix Cost">Fix Cost</option>
                </select>
              </div>

              {/* PO Number — PHP: getPoDetail → getpodetailforinvoice.php */}
              {ponumbers.length > 0 && (
                <div className="mb-3">
                  <label className={labelCls}>PO Number <span className="text-red-500">*</span></label>
                  <select
                    value={selectedPo}
                    onChange={(e) => setSelectedPo(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select PO Number</option>
                    {ponumbers.map((p, i) => (
                      <option key={i} value={p.ponumber ?? p}>{p.ponumber ?? p}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Inward IDs — PHP: multi-select #inwardid */}
              {inwardOptions.length > 0 && (
                <div className="mb-3">
                  <label className={labelCls}>Inward Entry <span className="text-red-500">*</span></label>
                  <select
                    multiple
                    value={selectedInwards}
                    onChange={(e) => {
                      const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
                      setSelectedInwards(vals);
                      loadItems(vals);
                    }}
                    className={`${selectCls} h-32`}
                  >
                    {inwardOptions.map((opt, i) => (
                      <option key={i} value={opt.id ?? opt.inwardid ?? opt}>
                        {opt.inwardid ?? opt.id ?? opt}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-400">Ctrl+Click to select multiple</p>
                </div>
              )}

              {/* Invoice Date */}
              <div className="mb-3">
                <label className={labelCls}>Invoice Date</label>
                <input
                  type="date"
                  value={invoicedate}
                  onChange={(e) => setInvoicedate(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Address */}
              {addresses.length > 0 && (
                <div className="mb-3">
                  <label className={labelCls}>Billing Address</label>
                  <select
                    value={custDetail.addressid}
                    onChange={(e) => {
                      const a = addresses.find((a) => String(a.id) === e.target.value);
                      setCustDetail((p) => ({
                        ...p,
                        addressid: e.target.value,
                        address: a?.address ?? "",
                      }));
                    }}
                    className={selectCls}
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.address})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Remark */}
              <div className="mb-3">
                <label className={labelCls}>Remark</label>
                <textarea
                  rows={3}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className={`${inputCls} resize-none`}
                  placeholder="Remark"
                />
              </div>

              {/* BRN Nos — PHP: readonly brnnos textarea */}
              <div className="mb-3">
                <label className={labelCls}>BRN Nos.</label>
                <textarea
                  rows={3}
                  value={brnnos}
                  readOnly
                  className={`${inputCls} resize-none bg-gray-50`}
                />
              </div>
            </Card>
          </div>

          {/* ── Right: Items + Charges ── */}
          <div className="space-y-5 lg:col-span-2">
            <Card className="p-5">
              <h3 className="dark:text-dark-100 mb-4 text-sm font-semibold text-gray-700 uppercase">
                Invoice Items
              </h3>

              {loadingItems ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <svg className="mr-2 h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
                  </svg>
                  Loading items...
                </div>
              ) : items.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  Select customer, PO and inward entry to load items
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="dark:bg-dark-700 bg-gray-100">
                        {["#", "Name", "ID No", "Serial No", "Location", "Accreditation", "Package", "Rate"].map((h) => (
                          <th key={h} className="dark:text-dark-300 px-2 py-2 text-left text-xs font-semibold uppercase text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="dark:divide-dark-600 divide-y divide-gray-100">
                      {items.map((item, idx) => (
                        <tr key={item._key} className="dark:hover:bg-dark-700 hover:bg-gray-50">
                          <td className="dark:text-dark-400 px-2 py-2 text-xs text-gray-400">{idx + 1}</td>
                          <td className="dark:text-dark-100 px-2 py-2 text-sm font-medium text-gray-800">
                            {item.name ?? item.itemname ?? "—"}
                          </td>
                          <td className="dark:text-dark-300 px-2 py-2 text-xs text-gray-600">
                            {item.idno ?? item.itemidno ?? "—"}
                          </td>
                          <td className="dark:text-dark-300 px-2 py-2 text-xs text-gray-600">
                            {item.serialno ?? item.itemserialno ?? "—"}
                          </td>
                          <td className="dark:text-dark-300 px-2 py-2 text-xs text-gray-600">
                            {item.location ?? item.itemlocation ?? "Lab"}
                          </td>
                          <td className="dark:text-dark-300 px-2 py-2 text-xs text-gray-600">
                            {item.accreditation ?? item.itemaccreditation ?? "—"}
                          </td>
                          <td className="dark:text-dark-300 px-2 py-2 text-xs text-gray-600">
                            {item.packagename ?? item.itempackagename ?? "—"}
                          </td>
                          <td className="px-2 py-2">
                            {potype === "Normal" ? (
                              <span className="font-mono text-sm font-semibold text-gray-800 dark:text-dark-100">
                                {parseFloat(item.rate || 0).toFixed(2)}
                              </span>
                            ) : (
                              <input
                                type="number"
                                value={item.rate || 0}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setItems((prev) =>
                                    prev.map((it) =>
                                      it._key === item._key ? { ...it, rate: val } : it,
                                    ),
                                  );
                                }}
                                className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-24 rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Charges */}
            {items.length > 0 && (
              <Card className="p-5">
                <h3 className="dark:text-dark-100 mb-4 text-sm font-semibold text-gray-700 uppercase">
                  Charges
                </h3>
                <div className="flex flex-col gap-5 lg:flex-row">
                  {/* Left inputs */}
                  <div className="flex-1 space-y-3">
                    {potype === "Fix Cost" && (
                      <div className="flex items-center gap-2">
                        <span className="dark:text-dark-400 w-44 shrink-0 text-sm text-gray-600">Subtotal</span>
                        <input type="number" value={charges.subtotal} onChange={(e) => setCharge("subtotal", e.target.value)}
                          className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-28 rounded border border-gray-300 bg-white px-2 py-1 text-sm" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="dark:text-dark-400 w-44 shrink-0 text-sm text-gray-600">Discount</span>
                      <input type="number" value={charges.discnumber} onChange={(e) => setCharge("discnumber", e.target.value)}
                        className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm" />
                      <select value={charges.disctype} onChange={(e) => setCharge("disctype", e.target.value)}
                        className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 rounded border border-gray-300 bg-white px-2 py-1 text-sm">
                        <option value="%">%</option>
                        <option value="amount">Flat</option>
                      </select>
                      <span className="ml-auto font-mono text-sm">{totals.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dark:text-dark-400 w-44 shrink-0 text-sm text-gray-600">Witness Charges</span>
                      <input type="number" value={charges.witnessnumber} onChange={(e) => setCharge("witnessnumber", e.target.value)}
                        className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm" />
                      <select value={charges.witnesstype} onChange={(e) => setCharge("witnesstype", e.target.value)}
                        className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 rounded border border-gray-300 bg-white px-2 py-1 text-sm">
                        <option value="%">%</option>
                        <option value="amount">Flat</option>
                      </select>
                      <span className="ml-auto font-mono text-sm">{totals.witnesscharges.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dark:text-dark-400 w-44 shrink-0 text-sm text-gray-600">Mobilisation</span>
                      <input type="number" value={charges.mobilisation} onChange={(e) => setCharge("mobilisation", e.target.value)}
                        className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm" />
                      <span className="ml-auto font-mono text-sm">{parseFloat(charges.mobilisation || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="dark:text-dark-400 w-44 shrink-0 text-sm text-gray-600">Freight</span>
                      <input type="number" value={charges.freight} onChange={(e) => setCharge("freight", e.target.value)}
                        className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-20 rounded border border-gray-300 bg-white px-2 py-1 text-sm" />
                      <span className="ml-auto font-mono text-sm">{parseFloat(charges.freight || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Right totals */}
                  <div className="dark:border-dark-600 w-full border-t border-gray-200 pt-4 lg:w-72 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="dark:text-dark-400 text-gray-600">Subtotal</span>
                        <span className="font-mono">{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="dark:text-dark-400 text-gray-600">Subtotal 2</span>
                        <span className="font-mono font-semibold">{totals.subtotal2.toFixed(2)}</span>
                      </div>
                      {isSgst ? (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="dark:text-dark-400 text-gray-600">CGST</span>
                            <div className="flex items-center gap-1">
                              <input type="number" value={charges.cgstper} onChange={(e) => setCharge("cgstper", e.target.value)}
                                className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-12 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs" />
                              <span className="text-xs text-gray-500">%</span>
                              <span className="ml-2 w-20 text-right font-mono">{totals.cgstamount.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="dark:text-dark-400 text-gray-600">SGST</span>
                            <div className="flex items-center gap-1">
                              <input type="number" value={charges.sgstper} onChange={(e) => setCharge("sgstper", e.target.value)}
                                className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-12 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs" />
                              <span className="text-xs text-gray-500">%</span>
                              <span className="ml-2 w-20 text-right font-mono">{totals.sgstamount.toFixed(2)}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span className="dark:text-dark-400 text-gray-600">IGST</span>
                          <div className="flex items-center gap-1">
                            <input type="number" value={charges.igstper} onChange={(e) => setCharge("igstper", e.target.value)}
                              className="dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-12 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs" />
                            <span className="text-xs text-gray-500">%</span>
                            <span className="ml-2 w-20 text-right font-mono">{totals.igstamount.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="dark:text-dark-400 text-gray-600">Round Off</span>
                        <span className="font-mono">{totals.roundoff.toFixed(2)}</span>
                      </div>
                      <div className="dark:border-dark-500 flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                        <span className="dark:text-dark-100 text-gray-800">Final Total</span>
                        <span className="font-mono text-green-700 dark:text-green-400">
                          {totals.finaltotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="rounded-md bg-green-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Add Invoice"}
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}