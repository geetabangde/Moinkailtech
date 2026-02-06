


import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import axios from "utils/axios";

// Mock components - replace with your actual imports
const Page = ({  children }) => <div>{children}</div>;
const Button = ({  className, onClick, children }) => (
  <button className={className} onClick={onClick}>{children}</button>
);

export default function ViewDispatchRegister() {
  const navigate = useNavigate();
  const [dispatchData, setDispatchData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDispatchData();
  }, []);

  const fetchDispatchData = async () => {
  try {
    setLoading(true);
    setError(null);

    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Authorization token not found");
    }

    const response = await axios.get(
      "/calibrationprocess/get-dispatchregistercalibration",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response:", response.data);

    // ✅ axios data handling
    if (response.data?.success && response.data?.data) {
      setDispatchData(response.data.data);
    } else {
      setDispatchData([]); // fallback
    }

  } catch (err) {
    console.error("Error fetching dispatch data:", err);
    setError(
      err.response?.data?.message ||
      err.message ||
      "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Page title="Dispatch Register">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Dispatch Register
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            onClick={() => navigate('/dashboards/calibration-process/dispatch-register')}
          >
            Go Back
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dispatch data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchDispatchData}
                  className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Display */}
        {!loading && !error && (
          <div className="printable-area">
            {/* Header Section */}
            <div className="flex border border-gray-300 bg-white shadow-sm">
              <div className="w-1/3 p-4">
                <img
                  src="/images/krtc.jpg"
                  alt="Logo"
                 className="w-auto h-16"
                />
                <p className="font-semibold text-sm text-gray-800">
                  Kailtech Test & Research Centre Pvt. Ltd.
                </p>
              </div>
              <div className="w-1/3 p-4 border-l border-gray-300 flex items-center justify-center">
                <h3 className="text-base font-bold uppercase text-center text-gray-800">
                  Dispatch Registry
                </h3>
              </div>
              <div className="w-1/3 p-0 border-l border-gray-300 flex">
                <table className="w-full h-full text-xs text-gray-800 border-collapse">
                  <tbody>
                    {[
                      ["QF. No.", "KTRC/QF/0704/06"],
                      ["Issue No.", "01"],
                      ["Issue Date", "01/06/2019"],
                      ["Revision No.", "01"],
                      ["Revision Date", "20/08/2021"],
                      ["Page", "1 of 1"],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-gray-300">
                        <td className="p-1 font-semibold border-r border-gray-300 bg-gray-50">
                          {label}
                        </td>
                        <td className="p-1">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dispatch Register Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full border border-gray-300 text-xs text-gray-800">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border border-gray-300 min-w-[80px]">Date</th>
                    <th className="p-2 border border-gray-300 min-w-[120px]">BRN</th>
                    <th className="p-2 border border-gray-300 min-w-[120px]">LRN</th>
                    <th className="p-2 border border-gray-300 min-w-[200px]">Name of Party Address</th>
                    <th className="p-2 border border-gray-300 min-w-[100px]">Person</th>
                    <th className="p-2 border border-gray-300 min-w-[200px]">
                      <div className="text-center">Description</div>
                      <div className="flex border-t border-gray-300 mt-1">
                        <div className="flex-1 p-1 border-r border-gray-300 text-center">Sample</div>
                        <div className="flex-1 p-1 border-r border-gray-300 text-center">Report</div>
                        <div className="flex-1 p-1 text-center">Invoice</div>
                      </div>
                    </th>
                    <th className="p-2 border border-gray-300 min-w-[80px]">Dispatch Date</th>
                    <th className="p-2 border border-gray-300 min-w-[120px]">Dispatch Through</th>
                    <th className="p-2 border border-gray-300 min-w-[100px]">Dispatched By</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-gray-500">
                        No dispatch records found
                      </td>
                    </tr>
                  ) : (
                    dispatchData.map((dispatch, idx) => (
                      <tr key={dispatch.id || idx} className="hover:bg-gray-50">
                        <td className="p-2 border border-gray-300">
                          {formatDate(dispatch.added_on)}
                        </td>
                        <td className="p-2 border border-gray-300">{dispatch.brn || '-'}</td>
                        <td className="p-2 border border-gray-300">{dispatch.lrn || '-'}</td>
                        <td className="p-2 border border-gray-300">
                          {dispatch.customername || '-'}
                        </td>
                        <td className="p-2 border border-gray-300">
                          {dispatch.cpersonname || '-'}
                        </td>
                        <td className="p-2 border border-gray-300">
                          <div className="flex">
                            <div className="flex-1 text-center border-r border-gray-300 p-1">
                              {dispatch.instrument === "Yes" ? "Yes" : "No"}
                            </div>
                            <div className="flex-1 text-center border-r border-gray-300 p-1">
                              {dispatch.certificate === "Yes" ? "Yes" : "No"}
                            </div>
                            <div className="flex-1 text-center p-1">
                              {dispatch.invoice === "Yes" ? "Yes" : "No"}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 border border-gray-300">
                          {formatDate(dispatch.dispatchdate)}
                        </td>
                        <td className="p-2 border border-gray-300">
                          {dispatch.dispatchthrough || '-'}
                        </td>
                        <td className="p-2 border border-gray-300">
                          {dispatch.firstname && dispatch.lastname
                            ? `${dispatch.firstname} ${dispatch.lastname}`
                            : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <th className="p-2 border border-gray-300 min-w-[80px]">Date</th>
                    <th className="p-2 border border-gray-300 min-w-[120px]">BRN</th>
                    <th className="p-2 border border-gray-300 min-w-[120px]">LRN</th>
                    <th className="p-2 border border-gray-300 min-w-[200px]">Name of Party Address</th>
                    <th className="p-2 border border-gray-300 min-w-[100px]">Person</th>
                    <th className="p-2 border border-gray-300 min-w-[200px]">
                      <div className="text-center">Description</div>
                    </th>
                    <th className="p-2 border border-gray-300 min-w-[80px]">Dispatch Date</th>
                    <th className="p-2 border border-gray-300 min-w-[120px]">Dispatch Through</th>
                    <th className="p-2 border border-gray-300 min-w-[100px]">Dispatched By</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}