import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "utils/axios";

const AddCalibPoint = () => {
  const { priceId, matrixId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState([
    {
      parameter: "",
      specification: "",
      setpoint: "",
      uuc: "",
      master: "",
      error: "",
      remark: "",
    }
  ]);
  
  // Store the required IDs
  const [apiIds, setApiIds] = useState({
    instid: 268,
    pricematrixid: null,
  });

  // Alternative approach: Try to get pricematrixid from the GET endpoint
  const fetchPriceMatrixId = useCallback(async () => {
    try {
      setFetchingData(true);
      console.log(`Attempting to fetch data for matrixId: ${matrixId}`);
      
      // Try the existing GET endpoint to fetch existing calibration points
      // This endpoint returns data that includes the pricematrixid
      try {
        const calibPointsResponse = await axios.get(
          `/calibrationoperations/get-calibpoint-byid_withmatrixid/268/${matrixId}`
        );
        
        console.log("Calib Points API Response:", calibPointsResponse.data);
        
        if (calibPointsResponse.data.status && calibPointsResponse.data.data.length > 0) {
          const firstPoint = calibPointsResponse.data.data[0];
          const pricematrixid = firstPoint.matrixid; // This is the pricematrixid
          
          console.log("✅ Fetched Price Matrix ID from calib points:", pricematrixid);
          
          setApiIds(prev => ({
            ...prev,
            pricematrixid: pricematrixid
          }));
          
          toast.success("Data loaded successfully");
          setFetchingData(false);
          return;
        }
      } catch (err) {
        console.log("First endpoint failed, trying alternative...", err.message);
      }

      // Alternative: Try the pricematrix endpoint
      try {
        const matrixResponse = await axios.get(
          `/calibrationoperations/get-pricematrix-byid/${matrixId}`
        );
        
        console.log("Matrix API Response:", matrixResponse.data);
        
        if (matrixResponse.data.status && matrixResponse.data.data.length > 0) {
          const matrixData = matrixResponse.data.data[0];
          const pricematrixid = matrixData.pricematrixid;
          
          console.log("✅ Fetched Price Matrix ID from matrix endpoint:", pricematrixid);
          
          setApiIds(prev => ({
            ...prev,
            pricematrixid: pricematrixid
          }));
          
          toast.success("Data loaded successfully");
          setFetchingData(false);
          return;
        }
      } catch (err) {
        console.log("Matrix endpoint also failed", err.message);
      }

      // If both fail, use matrixId as pricematrixid (common pattern)
      console.log("⚠️ Using matrixId as pricematrixid fallback");
      setApiIds(prev => ({
        ...prev,
        pricematrixid: Number(matrixId)
      }));
      
      toast.info("Using matrix ID as price matrix ID");
      
    } catch (error) {
      console.error("Error in fetchPriceMatrixId:", error);
      
      // Fallback: Use matrixId as pricematrixid
      console.log("Using fallback: matrixId as pricematrixid");
      setApiIds(prev => ({
        ...prev,
        pricematrixid: Number(matrixId)
      }));
      
      toast.warning("Using fallback configuration");
    } finally {
      setFetchingData(false);
    }
  }, [matrixId]);

  useEffect(() => {
    fetchPriceMatrixId();
  }, [fetchPriceMatrixId]);

  const handleInputChange = (index, field, value) => {
    const newFormData = [...formData];
    newFormData[index] = {
      ...newFormData[index],
      [field]: value
    };

    // Auto-calculate error if master and uuc are both present
    if (field === "master" || field === "uuc") {
      const master = newFormData[index].master;
      const uuc = newFormData[index].uuc;
      
      if (master && uuc) {
        try {
          const masterNum = parseFloat(master);
          const uucNum = parseFloat(uuc);
          if (!isNaN(masterNum) && !isNaN(uucNum)) {
            // Error = UUC - Master (as per your Postman example)
            const error = (uucNum - masterNum).toFixed(2);
            newFormData[index].error = error;
          }
        } catch (error) {
          console.error("Error calculating error:", error);
        }
      }
    }

    setFormData(newFormData);
  };

  const addNewRow = () => {
    setFormData([
      ...formData,
      {
        parameter: "",
        specification: "",
        setpoint: "",
        uuc: "",
        master: "",
        error: "",
        remark: "",
      }
    ]);
  };

  const removeRow = (index) => {
    if (formData.length > 1) {
      const newFormData = formData.filter((_, i) => i !== index);
      setFormData(newFormData);
    } else {
      toast.error("At least one row is required");
    }
  };

  const validateForm = () => {
    for (const row of formData) {
      if (!row.parameter || !row.setpoint) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Parameter and Setpoint are required for all rows");
      return;
    }

    if (!apiIds.pricematrixid) {
      toast.error("Price Matrix ID not available. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Create arrays for each field
      const parameters = formData.map(row => row.parameter);
      const specifications = formData.map(row => row.specification || "");
      const setpoints = formData.map(row => row.setpoint);
      const uucs = formData.map(row => row.uuc || "");
      const masters = formData.map(row => row.master || "");
      const errors = formData.map(row => row.error || "");
      const remarks = formData.map(row => row.remark || "");

      // Create payload matching the Postman example exactly
      const payload = {
        instid: apiIds.instid,
        matrixid: Number(matrixId),
        pricematrixid: Number(apiIds.pricematrixid),
        parameter: parameters,
        specification: specifications,
        setpoint: setpoints,
        uuc: uucs,
        master: masters,
        error: errors,
        remark: remarks
      };

      console.log("📤 Submitting payload:");
      console.log(JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        "/calibrationoperations/add-new-calibpoint",
        payload
      );
      
      console.log("✅ Success response:", response.data);
      
      if (response.data.status) {
        toast.success("Calibration points added successfully!");
        
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to add calibration points");
      }
      
    } catch (error) {
      console.error("❌ Submission error:", error);
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        
        const errorData = error.response.data;
        
        if (errorData.error) {
          toast.error(`Error: ${errorData.error}`);
        } else if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join(' | ');
          toast.error(`Validation errors: ${errorMessages}`);
        } else if (errorData.message) {
          toast.error(`Error: ${errorData.message}`);
        } else {
          toast.error(`HTTP ${error.response.status}: Request failed`);
        }
      } else if (error.request) {
        console.error("No response received");
        toast.error("No response from server. Check your connection.");
      } else {
        console.error("Request setup error:", error.message);
        toast.error("Failed to send request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-100">
            Add New Calibration Points
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-dark-300">
            Instrument ID: {priceId} | Matrix ID: {matrixId}
            {apiIds.pricematrixid && ` | Price Matrix ID: ${apiIds.pricematrixid}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addNewRow}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={loading || fetchingData}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Row
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-700"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>

      {fetchingData ? (
        <div className="rounded-lg border border-gray-300 bg-white p-8 text-center shadow-sm dark:border-dark-500 dark:bg-dark-750">
          <div className="flex flex-col items-center justify-center gap-3">
            <svg className="h-10 w-10 animate-spin text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
            </svg>
            <span className="font-medium">Loading configuration...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="rounded-lg border border-gray-300 bg-white shadow-sm dark:border-dark-500 dark:bg-dark-750">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-dark-500">
                <thead className="bg-gray-50 dark:bg-dark-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-dark-200">
                      Parameter *
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-dark-200">
                      Specification
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-dark-200">
                      Setpoint *
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-dark-200">
                      UUC
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-dark-200">
                      Master
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-dark-200">
                      Error
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-dark-200">
                      Remark
                    </th>
                    {formData.length > 1 && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-dark-200">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-dark-500 dark:bg-dark-750">
                  {formData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="whitespace-nowrap px-4 py-3">
                        <input
                          type="text"
                          value={row.parameter}
                          onChange={(e) => handleInputChange(index, "parameter", e.target.value)}
                          placeholder="e.g., Temperature"
                          className="w-full min-w-[120px] rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                          required
                          disabled={loading}
                        />
                      </td>
                      
                      <td className="whitespace-nowrap px-4 py-3">
                        <input
                          type="text"
                          value={row.specification}
                          onChange={(e) => handleInputChange(index, "specification", e.target.value)}
                          placeholder="e.g., ±1°C"
                          className="w-full min-w-[100px] rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                          disabled={loading}
                        />
                      </td>
                      
                      <td className="whitespace-nowrap px-4 py-3">
                        <input
                          type="text"
                          value={row.setpoint}
                          onChange={(e) => handleInputChange(index, "setpoint", e.target.value)}
                          placeholder="e.g., 50"
                          className="w-full min-w-[80px] rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                          required
                          disabled={loading}
                        />
                      </td>
                      
                      <td className="whitespace-nowrap px-4 py-3">
                        <input
                          type="text"
                          value={row.uuc}
                          onChange={(e) => handleInputChange(index, "uuc", e.target.value)}
                          placeholder="e.g., 49.5"
                          className="w-full min-w-[80px] rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                          disabled={loading}
                        />
                      </td>
                      
                      <td className="whitespace-nowrap px-4 py-3">
                        <input
                          type="text"
                          value={row.master}
                          onChange={(e) => handleInputChange(index, "master", e.target.value)}
                          placeholder="e.g., 50.1"
                          className="w-full min-w-[80px] rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                          disabled={loading}
                        />
                      </td>
                      
                      <td className="whitespace-nowrap px-4 py-3">
                        <input
                          type="text"
                          value={row.error}
                          readOnly
                          placeholder="Auto"
                          className="w-full min-w-[80px] cursor-not-allowed rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-300"
                        />
                      </td>
                      
                      <td className="whitespace-nowrap px-4 py-3">
                        <input
                          type="text"
                          value={row.remark}
                          onChange={(e) => handleInputChange(index, "remark", e.target.value)}
                          placeholder="e.g., OK"
                          className="w-full min-w-[100px] rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                          disabled={loading}
                        />
                      </td>
                      
                      {formData.length > 1 && (
                        <td className="whitespace-nowrap px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="border-t border-gray-300 bg-gray-50 px-6 py-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-dark-300">
                  {formData.length} calibration point{formData.length !== 1 ? "s" : ""} ready to add
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-600"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading || !apiIds.pricematrixid}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Add Calibration Points"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddCalibPoint;