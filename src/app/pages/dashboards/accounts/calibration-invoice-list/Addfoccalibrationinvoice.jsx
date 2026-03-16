// AddFOCCalibrationInvoice.jsx
// Route: /dashboards/accounts/calibration-invoice-list/add-foc
// PHP: createfocbillcalibration.php → insertCalibrationInvoice.php (foc=True)
// Permission: 292
//
// FOC = Free of Charge
// PHP sumamount() special behavior:
//   - All rates = 0 (readonly)
//   - discnumber = 0 (readonly)
//   - mobilisation = 0 (readonly)
//   - freight = 0 (readonly)
//   - witnesscharges = 0 (readonly)
//   - All totals = 0
//   - BRN nos: manual (editable, not readonly like normal)

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";
import { Page } from "components/shared/Page";
import { Card } from "components/ui";

const inputCls =
  "dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const selectCls =
  "dark:bg-dark-900 dark:border-dark-500 dark:text-dark-100 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelCls =
  "dark:text-dark-300 mb-1 block text-sm font-medium text-gray-700";

const toPhpDate = (d) => {
  if (!d) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

function Spinner() {
  return (
    <div className="flex h-[60vh] items-center justify-center gap-2 text-gray-600">
      <svg
        className="h-5 w-5 animate-spin text-blue-600"
        viewBox="0 0 24 24"
        fill="none"
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
  );
}

export default function AddFOCCalibrationInvoice() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [customerid, setCustomerid] = useState("");
  const [ponumbers, setPonumbers] = useState([]);
  const [selectedPo, setSelectedPo] = useState("");
  const [inwardOptions, setInwardOptions] = useState([]);
  const [selectedInwards, setSelectedInwards] = useState([]);
  const [items, setItems] = useState([]);
  const [remark, setRemark] = useState("");
  const [brnnos, setBrnnos] = useState(""); // PHP: editable in FOC
  const [invoicedate, setInvoicedate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [custDetail, setCustDetail] = useState({
    customername: "",
    addressid: "",
    address: "",
    statecode: "",
    pan: "",
    gstno: "",
  });
  const [addresses, setAddresses] = useState([]);

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);

  // PHP: FOC — all charges are 0 and locked
  const FOC_TOTALS = {
    subtotal: 0,
    discount: 0,
    witnesscharges: 0,
    subtotal2: 0,
    cgstamount: 0,
    sgstamount: 0,
    igstamount: 0,
    total: 0,
    finaltotal: 0,
    roundoff: 0,
  };

  useEffect(() => {
    axios.get("/people/get-all-customers").then((res) => {
      setCustomers(res.data.data ?? res.data ?? []);
      setLoadingCustomers(false);
    });
  }, []);

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
      } catch {
        toast.error("Failed to load PO numbers");
      }
      try {
        const c = customers.find((c) => String(c.id) === String(cid));
        const addrRes = await axios.get(`/people/get-customers-address/${cid}`);
        const addrs = addrRes.data.data ?? addrRes.data ?? [];
        setAddresses(addrs);
        setCustDetail({
          customername: c?.name ?? "",
          statecode: String(c?.statecode ?? ""),
          pan: c?.pan ?? "",
          gstno: c?.gstno ?? "",
          addressid: addrs[0]?.id ?? "",
          address: addrs[0]?.address ?? "",
        });
      } catch {
        /* ignore */
      }
    },
    [customers],
  );

  useEffect(() => {
    loadPoNumbers(customerid);
  }, [customerid, loadPoNumbers]);

  const loadInwards = useCallback(
    async (po) => {
      if (!po || !customerid) return;
      try {
        const res = await axios.get(
          `/accounts/get-service-reportforinvoice?customerid=${customerid}&ponumber=${encodeURIComponent(po)}&potype=Normal`,
        );
        setInwardOptions(res.data.data ?? res.data ?? []);
        setSelectedInwards([]);
        setItems([]);
      } catch {
        toast.error("Failed to load inward entries");
      }
    },
    [customerid],
  );

  useEffect(() => {
    loadInwards(selectedPo);
  }, [selectedPo, loadInwards]);

  // PHP: getitemFromServiceReport.php → items with rate=0 locked
  const loadItems = useCallback(
    async (inwards) => {
      if (!inwards.length || !selectedPo || !customerid) {
        setItems([]);
        return;
      }
      setLoadingItems(true);
      try {
        const inwardParam = inwards.join(",");
        const res = await axios.get(
          `/accounts/get-invoice-item?potype=Normal&customerid=${customerid}&ponumber=${encodeURIComponent(selectedPo)}&inwardid=${inwardParam}`,
        );
        const rawItems = res.data.data ?? res.data ?? [];
        // PHP: FOC sets all rates to 0 and locks them
        setItems(
          rawItems.map((i, idx) => ({ ...i, _key: `item-${idx}`, rate: 0 })),
        );
      } catch {
        toast.error("Failed to load items");
      } finally {
        setLoadingItems(false);
      }
    },
    [customerid, selectedPo],
  );

  const handleSubmit = async () => {
    if (!customerid) {
      toast.error("Customer required");
      return;
    }
    if (!selectedPo) {
      toast.error("PO Number required");
      return;
    }
    if (!selectedInwards.length) {
      toast.error("Inward Entry required");
      return;
    }
    if (!items.length) {
      toast.error("No items found");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerid: Number(customerid),
        potype: "Normal",
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
        itemaccreditation: items.map(
          (i) => i.accreditation ?? i.itemaccreditation ?? "",
        ),
        itempackagename: items.map(
          (i) => i.packagename ?? i.itempackagename ?? "",
        ),
        itempackagedesc: items.map(
          (i) => i.packagedesc ?? i.itempackagedesc ?? "",
        ),
        itempricematrixid: items.map(
          (i) => i.pricematrixid ?? i.itempricematrixid ?? 0,
        ),
        iteminwardid: items.map((i) => i.inwardid ?? selectedInwards[0] ?? 0),
        itemrate: items.map(() => 0), // PHP: FOC → all rates 0

        // PHP: FOC — all charges locked at 0
        subtotal: 0,
        discnumber: 0,
        disctype: "%",
        discount: 0,
        freight: 0,
        mobilisation: 0,
        witnessnumber: 0,
        witnesstype: "%",
        witnesscharges: 0,
        subtotal2: 0,
        cgstper: 0,
        cgstamount: 0,
        sgstper: 0,
        sgstamount: 0,
        igstper: 0,
        igstamount: 0,
        total: 0,
        roundoff: 0,
        finaltotal: 0,
        remark,
        brnnos, // PHP: editable in FOC
        foc: "True", // PHP: sendForm('foc', 'True', ...)
      };

      const res = await axios.post(
        "/accounts/add-calibration-invoice",
        payload,
      );
      if (
        res.data.success === true ||
        res.data.status === true ||
        res.data.status === "true"
      ) {
        toast.success("FOC Invoice added ✅");
        navigate("/dashboards/accounts/calibration-invoice-list");
      } else {
        toast.error(res.data.message ?? "Failed to add FOC invoice");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loadingCustomers)
    return (
      <Page title="Add FOC Calibration Invoice">
        <Spinner />
      </Page>
    );

  return (
    <Page title="Add FOC Calibration Invoice">
      <div className="transition-content px-(--margin-x) pb-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="dark:text-dark-50 text-xl font-semibold text-gray-800">
            Add Calibration FOC Invoice
          </h2>
          <button
            onClick={() =>
              navigate("/dashboards/accounts/calibration-invoice-list")
            }
            className="dark:border-dark-500 dark:text-dark-300 rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Back to Invoice List
          </button>
        </div>

        {/* FOC Banner */}
        <div className="mb-5 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 dark:border-teal-800 dark:bg-teal-900/20">
          <p className="text-sm font-medium text-teal-700 dark:text-teal-400">
            FOC (Free of Charge) Invoice — All rates and charges are locked at
            ₹0
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-1">
            <Card className="p-5">
              <h3 className="dark:text-dark-100 mb-4 text-sm font-semibold text-gray-700 uppercase">
                Invoice Details
              </h3>

              <div className="mb-3">
                <label className={labelCls}>
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerid}
                  onChange={(e) => setCustomerid(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {ponumbers.length > 0 && (
                <div className="mb-3">
                  <label className={labelCls}>
                    PO Number <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPo}
                    onChange={(e) => setSelectedPo(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select PO</option>
                    {ponumbers.map((p, i) => (
                      <option key={i} value={p.ponumber ?? p}>
                        {p.ponumber ?? p}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {inwardOptions.length > 0 && (
                <div className="mb-3">
                  <label className={labelCls}>
                    Inward Entry <span className="text-red-500">*</span>
                  </label>
                  <select
                    multiple
                    value={selectedInwards}
                    onChange={(e) => {
                      const vals = Array.from(e.target.selectedOptions).map(
                        (o) => o.value,
                      );
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
                  <p className="mt-1 text-xs text-gray-400">
                    Ctrl+Click to select multiple
                  </p>
                </div>
              )}

              <div className="mb-3">
                <label className={labelCls}>Invoice Date</label>
                <input
                  type="date"
                  value={invoicedate}
                  onChange={(e) => setInvoicedate(e.target.value)}
                  className={inputCls}
                />
              </div>

              {addresses.length > 0 && (
                <div className="mb-3">
                  <label className={labelCls}>Billing Address</label>
                  <select
                    value={custDetail.addressid}
                    onChange={(e) => {
                      const a = addresses.find(
                        (a) => String(a.id) === e.target.value,
                      );
                      setCustDetail((p) => ({
                        ...p,
                        addressid: e.target.value,
                        address: a?.address ?? "",
                      }));
                    }}
                    className={selectCls}
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.address})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className={labelCls}>Remark</label>
                <textarea
                  rows={3}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* PHP: brnnos editable in FOC (not readonly) */}
              <div className="mb-3">
                <label className={labelCls}>BRN Nos.</label>
                <textarea
                  rows={3}
                  value={brnnos}
                  onChange={(e) => setBrnnos(e.target.value)}
                  className={`${inputCls} resize-none`}
                  placeholder="Enter BRN numbers..."
                />
              </div>
            </Card>
          </div>

          <div className="space-y-5 lg:col-span-2">
            <Card className="p-5">
              <h3 className="dark:text-dark-100 mb-4 text-sm font-semibold text-gray-700 uppercase">
                Items (Rate = 0)
              </h3>

              {loadingItems ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
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
                        {[
                          "#",
                          "Name",
                          "ID No",
                          "Serial No",
                          "Location",
                          "Rate (FOC)",
                        ].map((h) => (
                          <th
                            key={h}
                            className="dark:text-dark-300 px-2 py-2 text-left text-xs font-semibold text-gray-500 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="dark:divide-dark-600 divide-y divide-gray-100">
                      {items.map((item, idx) => (
                        <tr
                          key={item._key}
                          className="dark:hover:bg-dark-700 hover:bg-gray-50"
                        >
                          <td className="dark:text-dark-400 px-2 py-2 text-xs text-gray-400">
                            {idx + 1}
                          </td>
                          <td className="dark:text-dark-100 px-2 py-2 text-sm font-medium">
                            {item.name ?? item.itemname ?? "—"}
                          </td>
                          <td className="dark:text-dark-300 px-2 py-2 text-xs">
                            {item.idno ?? item.itemidno ?? "—"}
                          </td>
                          <td className="dark:text-dark-300 px-2 py-2 text-xs">
                            {item.serialno ?? item.itemserialno ?? "—"}
                          </td>
                          <td className="dark:text-dark-300 px-2 py-2 text-xs">
                            {item.location ?? item.itemlocation ?? "Lab"}
                          </td>
                          {/* PHP: rate=0 readonly in FOC */}
                          <td className="px-2 py-2">
                            <span className="font-mono text-sm text-gray-400 line-through">
                              0.00
                            </span>
                            <span className="ml-2 rounded bg-teal-100 px-1.5 py-0.5 text-xs font-medium text-teal-700">
                              FOC
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {items.length > 0 && (
              <Card className="p-5">
                {/* PHP: FOC totals summary — all zero */}
                <div className="dark:border-dark-600 rounded-md border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20">
                  <div className="space-y-1 text-sm">
                    {[
                      "Subtotal",
                      "Discount",
                      "Subtotal 2",
                      "Tax",
                      "Round Off",
                    ].map((l) => (
                      <div key={l} className="flex justify-between">
                        <span className="dark:text-dark-400 text-gray-600">
                          {l}
                        </span>
                        <span className="font-mono text-gray-400">0.00</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-teal-200 pt-2 text-base font-bold dark:border-teal-700">
                      <span className="text-teal-700 dark:text-teal-400">
                        Final Total (FOC)
                      </span>
                      <span className="font-mono text-teal-700 dark:text-teal-400">
                        0.00
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="rounded-md bg-teal-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Add FOC Invoice"}
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
