import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "utils/axios";
import { toast } from "sonner";
import { Button } from "components/ui";

export default function ViewInwardEntrySrf() {
  const { id: inwardId, itemId: instId } = useParams();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const caliblocation = searchParams.get("caliblocation") || "Lab";
  const calibacc = searchParams.get("calibacc") || "Nabl";

  const [data, setData] = useState([]);
  const [headings, setHeadings] = useState([]);
  const [fieldKeys, setFieldKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Formatting Function - Display exact values from API
  const formatValue = (value, key) => {
    if (value === null || value === undefined) return "-";

    if (key === "dof" && (value === 0 || value === "0")) return "0";

    // ✅ Return string values as-is (like "1.00000")
    if (typeof value !== "number") return value;

    // ✅ Return exact numeric values without adding extra zeros
    return value.toString();
  };

  // ✅ Fetch API Data
  useEffect(() => {
    const fetchUncertainty = async () => {
      try {
        const response = await axios.post(
          `/observationsetting/calculateuncertinty`,
          {
            instid: instId,
            inwardid: inwardId,
          }
        );

        if (response.data?.status === true) {
          let apiHeadings = response.data.data?.heading || [];
          const calibrationPoints = response.data.data?.calibration_points || [];

          if (calibrationPoints.length > 0) {
            const firstPoint = calibrationPoints[0];
            
            // ✅ Get uncertainty calculation keys
            const keys = Object.keys(firstPoint.uncertainty_calculations || {});
            setFieldKeys(keys);

            // ✅ FIX: DOF auto-insert if missing
            if (apiHeadings.length === keys.length - 1) {
              apiHeadings.splice(12, 0, "DOF");
            }
          }

          setHeadings(apiHeadings);

          const mappedData = calibrationPoints.map((point, index) => ({
            srNo: index + 1,
            id: point.id,
            uncertaintyCalculations: point.uncertainty_calculations || {},
          }));

          console.log('📊 Mapped Data:', mappedData);

          setData(mappedData);
        } else {
          toast.error("No data found");
        }
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUncertainty();
  }, [inwardId, instId]);

  const handleBackToPerformCalibration = () => {
    navigate(
      `/dashboards/calibration-process/inward-entry-lab/perform-calibration/${inwardId}?caliblocation=${caliblocation}&calibacc=${calibacc}`
    );
  };

  const handleBackToInwardList = () => {
    navigate(
      `/dashboards/calibration-process/inward-entry-lab?caliblocation=${caliblocation}&calibacc=${calibacc}`
    );
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 1000);
  };

  // ✅ NEW: Get UUC observation value from uncertainty_calculations
  const getUucObservationValue = (row, obsIndex) => {
    // ✅ Observation values are in uncertainty_calculations as uuc1, uuc2, etc.
    const uucKey = `uuc${obsIndex + 1}`;
    const value = row.uncertaintyCalculations[uucKey];
    
    console.log(`🔍 Row ${row.srNo}, Obs ${obsIndex + 1}:`, {
      uucKey,
      value,
      uncertaintyCalculations: row.uncertaintyCalculations
    });
    
    return formatValue(value, uucKey);
  };

  // ✅ Render Table (WITH UUC OBSERVATIONS) - FIXED VERSION
  const renderMgTable = () => {
    // ✅ Detect observation columns pattern
    const observationPattern = /^observation\d+$/i;
    const observationIndices = [];
    let firstObsIndex = -1;
    
    headings.forEach((heading, idx) => {
      if (observationPattern.test(heading)) {
        if (firstObsIndex === -1) firstObsIndex = idx;
        observationIndices.push(idx);
      }
    });

    const hasObservationColumns = observationIndices.length > 0;

    console.log('🔍 Observation detection:', {
      hasObservationColumns,
      observationIndices,
      firstObsIndex,
      headings
    });

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-[12px] text-gray-700">
          <thead>
            <tr className="bg-gray-200 text-center text-xs font-medium">
              <th rowSpan="2" className="border border-gray-300 px-2 py-2">
                Sr no
              </th>
              {headings.map((heading, index) => {
                // ✅ Skip individual observation columns (they'll be merged)
                if (hasObservationColumns && index > firstObsIndex && observationIndices.includes(index)) {
                  return null;
                }
                
                // ✅ First observation column - merge all
                if (hasObservationColumns && index === firstObsIndex) {
                  return (
                    <th
                      key={`heading-${index}`}
                      colSpan={observationIndices.length}
                      className="border border-gray-300 px-2 py-2 capitalize"
                    >
                      Observation on UUC
                    </th>
                  );
                }
                
                // ✅ Regular column
                return (
                  <th
                    key={`heading-${index}`}
                    rowSpan="2"
                    className="border border-gray-300 px-2 py-2 capitalize"
                  >
                    {heading}
                  </th>
                );
              })}
            </tr>
            <tr className="bg-gray-200 text-center text-xs font-medium">
              {/* ✅ Add sub-headers for merged observations */}
              {hasObservationColumns && observationIndices.map((_, obsIdx) => (
                <th
                  key={`obs-subheader-${obsIdx}`}
                  className="border border-gray-300 px-2 py-1"
                >
                  Observation {obsIdx + 1}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="text-center hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-2">{row.srNo}</td>

                {headings.map((heading, colIndex) => {
                  // ✅ Skip individual observation columns (they'll be merged)
                  if (hasObservationColumns && colIndex > firstObsIndex && observationIndices.includes(colIndex)) {
                    return null;
                  }

                  // ✅ First observation column - show all UUC values
                  if (hasObservationColumns && colIndex === firstObsIndex) {
                    return observationIndices.map((_, obsIdx) => (
                      <td
                        key={`${rowIndex}-obs-${obsIdx}`}
                        className="border border-gray-300 px-2 py-2"
                      >
                        {getUucObservationValue(row, obsIdx)}
                      </td>
                    ));
                  }

                  // ✅ Regular column
                  const fieldKey = fieldKeys[colIndex];
                  const value = row.uncertaintyCalculations[fieldKey];
                  return (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className="border border-gray-300 px-2 py-2"
                    >
                      {formatValue(value, fieldKey)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600">
        <svg
          className="mr-2 h-6 w-6 animate-spin text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
          ></path>
        </svg>
        Loading Uncertainty Calculation...
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between rounded-lg border-b bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">
          Uncertainty Calculation
        </h1>

        <div className="space-x-2">
          <Button
            onClick={handleBackToInwardList}
            className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          >
            &lt;&lt; Back to Inward Entry List
          </Button>

          <Button
            onClick={handleBackToPerformCalibration}
            className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          >
            &lt;&lt; Back to Perform Calibration
          </Button>
        </div>
      </div>

      <div className="rounded bg-white p-4 shadow">
        {data.length > 0 ? (
          renderMgTable()
        ) : (
          <div className="py-8 text-center text-gray-500">No data available</div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Download CRF
        </button>
      </div>
    </div>
  );
}