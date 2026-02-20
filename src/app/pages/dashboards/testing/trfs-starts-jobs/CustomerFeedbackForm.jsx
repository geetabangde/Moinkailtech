import { useState, useEffect } from "react";
import { Button } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router";

// ── Rating attributes (PHP: table rows 1-6) ──────────────────────────────────
const RATING_FIELDS = [
  { key: "behavior",            label: "Behavior of Staff" },
  { key: "response",            label: "Response of technical & General query through letter/phone/E-Mail" },
  { key: "timelydelivry",       label: "Commitment and timely delivery of calibration certificates/test Report" },
  { key: "qualityofreport",     label: "Quality of certificate/test report and its presentation" },
  { key: "reliabilityofresult", label: "Reliability of calibration/Test results" },
  { key: "qualityofservice",    label: "Overall quality of services provided by us" },
];

// PHP: all ratings default checked value="5"
const DEFAULT_RATINGS = RATING_FIELDS.reduce(
  (acc, f) => ({ ...acc, [f.key]: "5" }),
  {}
);

export default function CustomerFeedbackForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ route: customerFeedbackForm/:id

  const type = "Testing"; // PHP: $type = $_GET['matata'] → TRF flow

  // ── State ──────────────────────────────────────────────────────────────────
  const [fetchLoading, setFetchLoading] = useState(true);

  // PHP hidden fields (from GET API response)
  const [customername,    setCustomername]    = useState("");
  const [customeraddress, setCustomeraddress] = useState("");
  const [customerid,      setCustomerid]      = useState("");
  const [addressid,       setAddressid]       = useState("");
  const [cperson,         setCperson]         = useState("");

  // PHP: date("d/m/Y") readonly
  const today = new Date().toLocaleDateString("en-GB");

  // PHP: all radio defaults value="5" checked
  const [ratings, setRatings] = useState({ ...DEFAULT_RATINGS });

  // PHP: willyourecommend default "Yes" checked
  const [willyourecommend,        setWillyourecommend]        = useState("Yes");
  const [willyourecommendreason,  setWillyourecommendreason]  = useState("");
  const [suggestion,              setSuggestion]              = useState("");

  // PHP: contactpersonname, contactpersondepartment, contactpersondesignation
  const [contactpersonname,        setContactpersonname]        = useState("");
  const [contactpersondepartment,  setContactpersondepartment]  = useState("");
  const [contactpersondesignation, setContactpersondesignation] = useState("");

  const [loading, setLoading] = useState(false);

  // ── GET /testing/get-feedback-data?type=Testing&id= ──────────────────────
  // PHP: selectextrawhere("trfs","id=$inwardid") + selectfieldwhere('customer-contact','name',...)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `/testing/get-feedback-data?type=${type}&id=${id}`
        );
        const result = res.data;

        if (result.status === true) {
          const d = result.data;

          // PHP hidden fields
          setCustomername(d.customername      || "");
          setCustomeraddress(d.customeraddress || "");
          setCustomerid(String(d.customerid   || ""));
          setAddressid(String(d.addressid     || ""));
          setCperson(String(d.contactperson?.id || ""));

          // PHP: $contactpersonname from customer-contact table
          setContactpersonname(d.contactperson?.name         || "");
          setContactpersondepartment(d.contactperson?.department  || "");
          setContactpersondesignation(d.contactperson?.designation || "");
        } else {
          toast.error("Failed to fetch feedback data");
        }
      } catch (err) {
        console.error("Fetch feedback data error:", err);
        toast.error("Something went wrong while loading data.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // ── Rating change ─────────────────────────────────────────────────────────
  const handleRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  // ── POST /testing/send-feedback-form ─────────────────────────────────────
  // PHP: insertnew("feedbackform", $_POST) → update("trfs", {feedbackid}, inwardid)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!willyourecommendreason.trim()) {
      toast.error("Please fill in the 'Why' reason");
      return;
    }
    if (!suggestion.trim()) {
      toast.error("Please fill in Suggestions/Comments");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        // Ratings as numbers (API: "behavior": 5, not "5")
        behavior:            Number(ratings.behavior),
        response:            Number(ratings.response),
        timelydelivry:       Number(ratings.timelydelivry),
        qualityofreport:     Number(ratings.qualityofreport),
        reliabilityofresult: Number(ratings.reliabilityofresult),
        qualityofservice:    Number(ratings.qualityofservice),
        // Recommend
        willyourecommend,
        willyourecommendreason,
        suggestion,
        // Contact
        contactpersonname,
        contactpersondepartment,
        contactpersondesignation,
        // Hidden fields — IDs as numbers
        customername,
        customeraddress,
        customerid:  Number(customerid),
        addressid:   Number(addressid),
        cperson:     Number(cperson),
        inwardid:    Number(id),
        type,
        date: today,
      };

      const res    = await axios.post(`/testing/send-feedback-form`, payload);
      const result = res.data;

      if (result.status === true) {
        toast.success("Feedback submitted successfully ✅");
        setTimeout(() => {
          navigate("/dashboards/testing/trfs-starts-jobs");
        }, 1000);
      } else {
        toast.error(result.message || "Failed to submit feedback ❌");
      }
    } catch (err) {
      console.error("Submit feedback error:", err);
      toast.error("Something went wrong while submitting feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Customer Feedback Form">
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Customer Feedback Form
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboards/testing/trfs-starts-jobs")}
          >
            Back to TRF List
          </Button>
        </div>

        {/* Page Loading Spinner */}
        {fetchLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
            </svg>
            Loading feedback form...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Instructions */}
            <div className="text-center text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded p-3">
              Please answer the questions below by ticking the following number values where<br />
              <strong>1-Poor, 2-Average, 3-Good, 4-Very Good, 5-Excellent</strong>
            </div>

            {/* Date readonly */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-16">Date</label>
              <input
                type="text"
                value={today}
                readOnly
                className="w-40 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
            </div>

            {/* Ratings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-md overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border border-gray-200 px-3 py-2 text-left w-12">Sr. No.</th>
                    <th className="border border-gray-200 px-3 py-2 text-left">Attribute</th>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <th key={n} className="border border-gray-200 px-3 py-2 text-center w-12">{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>

                  {/* Rows 1-6: Rating fields */}
                  {RATING_FIELDS.map((field, idx) => (
                    <tr key={field.key} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-200 px-3 py-2 text-center">{idx + 1}</td>
                      <td className="border border-gray-200 px-3 py-2">{field.label}</td>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <td key={n} className="border border-gray-200 px-3 py-2 text-center">
                          <input
                            type="radio"
                            name={field.key}
                            value={String(n)}
                            checked={ratings[field.key] === String(n)}
                            onChange={() => handleRating(field.key, String(n))}
                            className="accent-blue-600"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Row 7: Recommend Yes/No */}
                  <tr className="bg-white">
                    <td className="border border-gray-200 px-3 py-2 text-center">7</td>
                    <td className="border border-gray-200 px-3 py-2">
                      Would you like to recommend us to others please give your remark
                    </td>
                    <td colSpan={3} className="border border-gray-200 px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="willyourecommend"
                          value="Yes"
                          checked={willyourecommend === "Yes"}
                          onChange={() => setWillyourecommend("Yes")}
                          className="accent-blue-600"
                        />
                        Yes
                      </label>
                    </td>
                    <td colSpan={2} className="border border-gray-200 px-3 py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="willyourecommend"
                          value="No"
                          checked={willyourecommend === "No"}
                          onChange={() => setWillyourecommend("No")}
                          className="accent-blue-600"
                        />
                        No
                      </label>
                    </td>
                  </tr>

                  {/* Why reason */}
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 font-medium">Why:</td>
                    <td colSpan={6} className="border border-gray-200 px-3 py-2">
                      <textarea
                        value={willyourecommendreason}
                        onChange={(e) => setWillyourecommendreason(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>

                  {/* Row 8: Suggestions label */}
                  <tr className="bg-white">
                    <td className="border border-gray-200 px-3 py-2 text-center">8</td>
                    <td colSpan={6} className="border border-gray-200 px-3 py-2 font-medium">
                      Suggestions/Comments for Improvement
                    </td>
                  </tr>

                  {/* Suggestions textarea */}
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="border border-gray-200 px-3 py-2">
                      <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        rows={3}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>

                  {/* Customer Name and Address header + Contact person */}
                  <tr className="bg-white">
                    <td colSpan={3} className="border border-gray-200 px-3 py-2 font-medium">
                      Customer Name and Address
                    </td>
                    <td colSpan={2} className="border border-gray-200 px-3 py-2 font-medium">
                      Contact person
                    </td>
                    <td colSpan={2} className="border border-gray-200 px-3 py-2">
                      <input
                        type="text"
                        value={contactpersonname}
                        onChange={(e) => setContactpersonname(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>

                  {/* Customer name/address display + Department */}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={3}
                      rowSpan={3}
                      className="border border-gray-200 px-3 py-2 align-top text-sm text-gray-700"
                    >
                      <p className="font-semibold">{customername}</p>
                      <p className="text-gray-500 mt-1">{customeraddress}</p>
                    </td>
                    <td colSpan={2} className="border border-gray-200 px-3 py-2 font-medium">
                      Department
                    </td>
                    <td colSpan={2} className="border border-gray-200 px-3 py-2">
                      <input
                        type="text"
                        value={contactpersondepartment}
                        onChange={(e) => setContactpersondepartment(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>

                  {/* Designation */}
                  <tr className="bg-white">
                    <td colSpan={2} className="border border-gray-200 px-3 py-2 font-medium">
                      Designation
                    </td>
                    <td colSpan={2} className="border border-gray-200 px-3 py-2">
                      <input
                        type="text"
                        value={contactpersondesignation}
                        onChange={(e) => setContactpersondesignation(e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>

                  {/* Signature with stamp */}
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="border border-gray-200 px-3 py-2 font-medium">
                      Signature With Stamp
                    </td>
                    <td colSpan={2} className="border border-gray-200 px-3 py-2 text-gray-400 text-sm italic">
                      —
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" color="primary" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>

          </form>
        )}
      </div>
    </Page>
  );
}