import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "utils/axios";

const EditCalibPoint = () => {
  const { priceId, matrixId, calibPointId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    parameter: "",
    specification: "",
    setpoint: "",
    uuc: "",
    master: "",
    error: "",
    remark: "",
  });
  
  const [apiIds, setApiIds] = useState({
    instid: 268, // Default fallback
    pricematrixid: null,
  });

  // Fetch required IDs with fallback strategies
  const fetchRequiredData = useCallback(async () => {
    try {
      setFetchingData(true);
      console.log("📊 Fetching required data...");
      
      // Strategy 1: Try to get data from existing calibration points
      try {
        const calibPointsResponse = await axios.get(
          `/calibrationoperations/get-calibpoint-byid_withmatrixid/${priceId}/${matrixId}`
        );
        
        if (calibPointsResponse.data.status && calibPointsResponse.data.data.length > 0) {
          const firstPoint = calibPointsResponse.data.data[0];
          
          console.log("✅ Got data from calibration points:", {
            instid: firstPoint.instid,
            pricematrixid: firstPoint.matrixid
          });
          
          setApiIds({
            instid: firstPoint.instid || 268,
            pricematrixid: firstPoint.matrixid
          });
          
          setFetchingData(false);
          return;
        }
      } catch (err) {
        console.log("⚠️ Calibration points endpoint failed:", err.message);
      }

      // Strategy 2: Try the instrument endpoint
      let fetchedInstId = 268; // Default
      try {
        const instrumentResponse = await axios.get(
          `/calibrationoperations/get-instrument-bypriceid/${priceId}`
        );
        
        if (instrumentResponse.data.status && instrumentResponse.data.data.length > 0) {
          fetchedInstId = instrumentResponse.data.data[0].instid;
          console.log("✅ Got instid from instrument:", fetchedInstId);
        }
      } catch (err) {
        console.log("⚠️ Instrument endpoint failed, using default instid:", err.message);
      }

      // Strategy 3: Try the matrix endpoint for pricematrixid
      let fetchedPriceMatrixId = Number(matrixId); // Fallback
      try {
        const matrixResponse = await axios.get(
          `/calibrationoperations/get-pricematrix-byid/${matrixId}`
        );
        
        if (matrixResponse.data.status && matrixResponse.data.data.length > 0) {
          fetchedPriceMatrixId = matrixResponse.data.data[0].pricematrixid;
          console.log("✅ Got pricematrixid from matrix:", fetchedPriceMatrixId);
        }
      } catch (err) {
        console.log("⚠️ Matrix endpoint failed, using matrixId as pricematrixid:", err.message);
      }

      setApiIds({
        instid: fetchedInstId,
        pricematrixid: fetchedPriceMatrixId
      });

      console.log("✅ Final IDs:", {
        instid: fetchedInstId,
        pricematrixid: fetchedPriceMatrixId
      });

    } catch (err) {
      console.error("❌ Error in fetchRequiredData:", err);
      
      // Ultimate fallback
      setApiIds({
        instid: 268,
        pricematrixid: Number(matrixId)
      });
      
      toast.warning("Using fallback configuration");
    } finally {
      setFetchingData(false);
    }
  }, [priceId, matrixId]);

  // Fetch the specific calibration point data
  const fetchCalibPoint = useCallback(async () => {
    if (!calibPointId) return;

    try {
      setLoading(true);
      console.log(`📥 Fetching calibration point ${calibPointId}...`);
      
      const response = await axios.get(
        `/calibrationoperations/get-calibpoint-byid/${calibPointId}`
      );
      
      console.log("Calibration point response:", response.data);
      
      if (response.data.status && response.data.data && response.data.data.length > 0) {
        const data = response.data.data[0]; // Access first element of array
        
        setFormData({
          parameter: data.parameter || "",
          specification: data.specification || "",
          setpoint: data.setpoint || "",
          uuc: data.uuc || "",
          master: data.master || "",
          error: data.error || "",
          remark: data.remark || "",
        });
        
        console.log("✅ Loaded calibration point data:", data);
      } else {
        toast.error("Failed to fetch calibration point data");
      }
    } catch (err) {
      console.error("❌ Error fetching calibration point:", err);
      toast.error("Error loading calibration point data");
    } finally {
      setLoading(false);
    }
  }, [calibPointId]);

  useEffect(() => {
    const loadData = async () => {
      await fetchRequiredData();
      await fetchCalibPoint();
    };
    
    loadData();
  }, [fetchRequiredData, fetchCalibPoint]);

  const handleInputChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };

    // Auto-calculate error if master and uuc are both present
    if (field === "master" || field === "uuc") {
      const master = newFormData.master;
      const uuc = newFormData.uuc;
      
      if (master && uuc) {
        try {
          const masterNum = parseFloat(master);
          const uucNum = parseFloat(uuc);
          if (!isNaN(masterNum) && !isNaN(uucNum)) {
            // Error = UUC - Master (matching your Postman pattern)
            const error = (uucNum - masterNum).toFixed(2);
            newFormData.error = error;
          }
        } catch (err) {
          console.error("Error calculating error:", err);
        }
      }
    }

    setFormData(newFormData);
  };

  const validateForm = () => {
    if (!formData.parameter || !formData.setpoint) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Parameter and Setpoint are required");
      return;
    }

    if (!apiIds.instid || !apiIds.pricematrixid) {
      toast.error("Missing required IDs. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Create payload matching Postman example exactly
      const payload = {
        id: Number(calibPointId),
        parameter: formData.parameter,
        specification: formData.specification || "",
        setpoint: formData.setpoint,
        uuc: formData.uuc || "",
        master: formData.master || "",
        error: formData.error || "",
        remark: formData.remark || "",
        instid: Number(apiIds.instid),
        matrixid: Number(matrixId),
        pricematrixid: Number(apiIds.pricematrixid)
      };

      console.log("📤 Sending update payload:");
      console.log(JSON.stringify(payload, null, 2));
      
      const response = await axios.post (
        "/calibrationoperations/update-calibpoint",
        payload
      );
      
      console.log("✅ Update response:", response.data);
      
      if (response.data.status) {
        toast.success("Calibration point updated successfully!");
        
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        toast.error(response.data.message || "Update failed");
      }
      
    } catch (err) {
      console.error("❌ Error updating calibration point:", err);
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
        
        const errorData = err.response.data;
        
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
          toast.error(`HTTP ${err.response.status}: Update failed`);
        }
      } else if (err.request) {
        console.error("No response received");
        toast.error("No response from server. Check your connection.");
      } else {
        console.error("Request setup error:", err.message);
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
            Edit Calibration Point
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-dark-300">
            Instrument ID: {priceId} | Matrix ID: {matrixId} | Point ID: {calibPointId}
            {apiIds.pricematrixid && ` | Price Matrix ID: ${apiIds.pricematrixid}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
            <span className="font-medium">Loading calibration point...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="rounded-lg border border-gray-300 bg-white shadow-sm dark:border-dark-500 dark:bg-dark-750">
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                    Parameter *
                  </label>
                  <input
                    type="text"
                    value={formData.parameter}
                    onChange={(e) => handleInputChange("parameter", e.target.value)}
                    placeholder="e.g., Temperature"
                    className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                    Specification
                  </label>
                  <input
                    type="text"
                    value={formData.specification}
                    onChange={(e) => handleInputChange("specification", e.target.value)}
                    placeholder="e.g., ±1°C"
                    className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                    Setpoint *
                  </label>
                  <input
                    type="text"
                    value={formData.setpoint}
                    onChange={(e) => handleInputChange("setpoint", e.target.value)}
                    placeholder="e.g., 50"
                    className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                    UUC (Unit Under Calibration)
                  </label>
                  <input
                    type="text"
                    value={formData.uuc}
                    onChange={(e) => handleInputChange("uuc", e.target.value)}
                    placeholder="e.g., 49.5"
                    className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                    Master Value
                  </label>
                  <input
                    type="text"
                    value={formData.master}
                    onChange={(e) => handleInputChange("master", e.target.value)}
                    placeholder="e.g., 50.1"
                    className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                    Error (Auto-calculated)
                  </label>
                  <input
                    type="text"
                    value={formData.error}
                    readOnly
                    placeholder="Auto-calculated"
                    className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm dark:border-dark-500 dark:bg-dark-800 dark:text-dark-300"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-300">
                    Remark
                  </label>
                  <input
                    type="text"
                    value={formData.remark}
                    onChange={(e) => handleInputChange("remark", e.target.value)}
                    placeholder="e.g., OK, Within range"
                    className="w-full rounded border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-300 bg-gray-50 px-6 py-4 dark:border-dark-500 dark:bg-dark-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-dark-300">
                  Editing calibration point
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
                        Updating...
                      </span>
                    ) : (
                      "Update Calibration Point"
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

export default EditCalibPoint;