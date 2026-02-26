// Import Dependencies
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// Local Imports
import axios from "utils/axios";
import { Page } from "components/shared/Page";

// ----------------------------------------------------------------------

const formatDate = (val) => {
  if (!val || val === "0000-00-00") return "-";
  const date = new Date(val);
  if (isNaN(date)) return val;
  return date.toLocaleDateString("en-GB"); // DD/MM/YYYY
};

// ----------------------------------------------------------------------

export default function DispatchFormTesting() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/testing/get-testing-dispatch-form?id=${id}`);
        const result = response.data;
        if (result?.status && result?.dispatch) {
          setData(result);
        } else {
          setError("Invalid response from server");
        }
      } catch (err) {
        console.error("Failed to fetch dispatch form:", err);
        setError("Failed to load dispatch form. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchForm();
  }, [id]);

  const handleDownload = () => {
    window.open(
      `${axios.defaults.baseURL ?? ""}/testing/get-testing-dispatch-form?id=${id}&download=1`,
      "_blank"
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Page title="View Dispatch Form">
        <div className="flex h-[60vh] items-center justify-center text-gray-600">
          <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
          </svg>
          Loading Dispatch Form...
        </div>
      </Page>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <Page title="View Dispatch Form">
        <div className="flex flex-col h-[60vh] items-center justify-center gap-4 text-red-500">
          <p>{error || "No data found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeftIcon className="size-4" /> Go Back
          </button>
        </div>
      </Page>
    );
  }

  const { dispatch, signature, items } = data;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Page title="View Dispatch Form">
      <div className="transition-content px-(--margin-x) pb-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Back to Dispatch List
          </button>
        </div>

        {/* Challan Card */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600">

          {/* NON RETURNABLE CHALLAN heading */}
          <div className="px-8 pt-6 pb-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-dark-200 tracking-wide">
              NON RETURNABLE CHALLAN
            </p>
          </div>

          {/* ── Header Row: Logo | Company | GST/Challan/Date ── */}
          <div className="grid grid-cols-3 items-start gap-4 border-b border-gray-200 dark:border-dark-600 px-8 py-4">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/images/logo.png" 
                alt="KTRC Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>

            {/* Company Info */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-dark-50">
                Kailtech Test And Research Centre Pvt. Ltd.
              </h2>
              <p className="text-xs text-gray-600 dark:text-dark-300 mt-1">
                Plot No.141-C, Electronic Complex, Industrial Area, Indore-452010 (MADHYA PRADESH) India
              </p>
              <p className="text-xs text-gray-600 dark:text-dark-300">
                Ph: 91-731-4787555 (30 lines) Ph: 91-731-4046055, 4048055
              </p>
              <p className="text-xs text-gray-600 dark:text-dark-300">
                Email: contact@kailtech.net , Web: http://www.kailtech.net
              </p>
            </div>

            {/* GST / Challan No / Date */}
            <div className="text-right text-xs text-gray-700 dark:text-dark-200 space-y-0.5">
              <p>GST No. 23AADCK0799A1ZV</p>
              <p>{dispatch.challanno}</p>
              <p>Date {formatDate(dispatch.dispatchdate)}</p>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="px-8 py-6 space-y-3 text-sm text-gray-800 dark:text-dark-100">

            <div className="grid grid-cols-[220px_1fr]">
              <span className="text-gray-600 dark:text-dark-300">Customer</span>
              <span>{dispatch.customername || "-"}</span>
            </div>

            <div className="grid grid-cols-[220px_1fr]">
              <span className="font-semibold">Customer Address</span>
              <span>{dispatch.customeraddress || "-"}</span>
            </div>

            <div className="grid grid-cols-[220px_1fr]">
              <span className="font-semibold">Concern person name</span>
              <span>{dispatch.concernpersonname || "-"}</span>
            </div>

            <div className="grid grid-cols-[220px_1fr]">
              <span className="font-semibold">Concern person Designation</span>
              <span>{dispatch.concernpersondesignation || "-"}</span>
            </div>

            <div className="grid grid-cols-[220px_1fr]">
              <span className="font-semibold">Concern person email</span>
              <span>{dispatch.concernpersonemail || "-"}</span>
            </div>

            <div className="grid grid-cols-[220px_1fr]">
              <span className="font-semibold">Concern person mobile</span>
              <span>{dispatch.concernpersonmobile || "-"}</span>
            </div>

            {/* Dispatch Date + Dispatch Through */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="grid grid-cols-[160px_1fr]">
                <span className="font-semibold">Dispatch Date</span>
                <span>{formatDate(dispatch.dispatchdate)}</span>
              </div>
              <div className="grid grid-cols-[160px_1fr]">
                <span className="font-semibold">Dispatch Through</span>
                <span>{dispatch.dispatchthrough || "-"}</span>
              </div>
            </div>

            {/* Dispatch Detail + Dispatched By */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-[160px_1fr]">
                <span className="font-semibold">Dispatch Detail</span>
                {/* API has typo "dispatchdetial" — handle both */}
                <span>{dispatch.dispatchdetial || dispatch.dispatchdetail || "-"}</span>
              </div>
              <div className="grid grid-cols-[160px_1fr]">
                <span className="font-semibold">Dispatched By</span>
                <span>{dispatch.dispatched_by || "-"}</span>
              </div>
            </div>

            {/* ── Items Table ── */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 dark:text-dark-400 mb-2">Report, invoice</p>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-600">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-dark-200 w-16">Srno</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-dark-200">Name of item</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-dark-200">Description of item in courier</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-dark-200">Items Attached</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-dark-200">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(items) && items.length > 0 ? (
                      items.map((item, idx) => (
                        <tr
                          key={item.id ?? idx}
                          className="border-t border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                        >
                          <td className="px-4 py-3">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div>{item.name || "-"}</div>
                            <div className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
                              {item.lrn && <span><strong>LRN :</strong> {item.lrn}. </span>}
                              {item.brn && <span><strong>BRN:</strong> {item.brn}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.description || "-"}</td>
                          <td className="px-4 py-3">
                            {[
                              item.certificate ? "Certificate" : null,
                              item.invoice ? "Invoice" : null,
                            ]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </td>
                          <td className="px-4 py-3">{item.remark || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Image */}
            {signature?.image_path && (
              <div className="pt-2">
                <img
                  src={signature.image_path}
                  alt="Signature"
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}

            {/* Regards */}
            <div className="pt-2">
              <p className="font-semibold">Regards</p>
              <p className="font-semibold">For Kailtech Test And Research Centre Pvt. Ltd.</p>
            </div>
          </div>

          {/* ── Footer: Download Button ── */}
          <div className="flex justify-end px-8 pb-6">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 active:bg-emerald-700"
            >
              Download Dispatch Report
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
}