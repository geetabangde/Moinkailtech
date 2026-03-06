import { useState, useEffect, useCallback } from "react";
import { Button } from "components/ui";
import { useNavigate, useParams, useSearchParams } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";

export default function CalibrationReport() {
  const navigate = useNavigate();
  const { inwardid: pathInwardid, instid: pathInstid } = useParams();
  const [searchParams] = useSearchParams();

  const extractParams = () => {
    const currentUrl = window.location.href;
    let inwardid = pathInwardid;
    let instid = pathInstid;

    if (!instid) instid = searchParams.get("instid");
    if (!inwardid) inwardid = searchParams.get("inwardid");

    const urlMatch = currentUrl.match(/view-rawdata\/(\d+)\/(\d+)/);
    if (urlMatch) {
      if (!inwardid) inwardid = urlMatch[1];
      if (!instid) instid = urlMatch[2];
    }

    return { instid, inwardid };
  };

  const { instid, inwardid } = extractParams();
  const caliblocation = searchParams.get("caliblocation") || "Lab";
  const calibacc = searchParams.get("calibacc") || "Nabl";

  const [equipmentData, setEquipmentData] = useState({});
  const [calibratedByImageUrl, setCalibratedByImageUrl] = useState("");
  const [approvedByImageUrl, setApprovedByImageUrl] = useState("");
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ DYNAMIC OBSERVATION STATES
  const [dynamicHeadings, setDynamicHeadings] = useState(null);
  const [observations, setObservations] = useState([]);
  const [suffix, setSuffix] = useState("");
  const [thermalCoeff, setThermalCoeff] = useState({});

  // ✅ FETCH DYNAMIC HEADINGS - USING AXIOS
  const fetchDynamicHeadings = useCallback(
    async (suffix) => {
      if (!suffix) return null;

      try {
        console.log("🔍 Fetching dynamic headings for suffix:", suffix);

        const response = await axios.post(
          "/observationsetting/get-custome-observation",
          {
            inwardid: inwardid,
            instid: instid,
            suffix: suffix,
          },
        );

        console.log("📊 Dynamic Headings API Response:", response.data);

        if (response.data.status === true) {
          return {
            heading: response.data.heading,
            data: response.data.data,
          };
        }
        return null;
      } catch (error) {
        console.error("Error fetching dynamic headings:", error);
        return null;
      }
    },
    [instid, inwardid],
  );

  // ✅ GENERATE DYNAMIC TABLE STRUCTURE - SAME AS CALIBRATE STEP3
  const generateDynamicTableStructure = useCallback(
    (headings) => {
      if (!headings || !Array.isArray(headings)) return null;

      const calibrationSettings = headings.filter(
        (col) => col.checkbox === "yes",
      );
      const observationFrom = dynamicHeadings?.observation_from || "master";
      const observationSettings =
        dynamicHeadings?.observation_heading?.observation_settings || [];
      const enabledObsSettings = observationSettings.filter(
        (obs) => obs.checkbox === "yes",
      );

      const headers = [];
      const subHeadersRow = [];

      // SR NO column
      headers.push({ name: "SR NO", colspan: 1 });
      subHeadersRow.push(null);

      calibrationSettings.forEach((heading) => {
        const headerName = heading.field_heading || heading.fieldname;
        const fieldname = heading.fieldname;

        if (observationFrom === "master" && fieldname === "master") {
          if (enabledObsSettings.length > 0) {
            headers.push({
              name: headerName,
              colspan: enabledObsSettings.length,
            });
            enabledObsSettings.forEach((obsSetting) => {
              subHeadersRow.push(
                obsSetting.field_heading || obsSetting.fieldname,
              );
            });
          } else {
            headers.push({ name: headerName, colspan: 1 });
            subHeadersRow.push(null);
          }
        } else if (observationFrom === "uuc" && fieldname === "uuc") {
          if (enabledObsSettings.length > 0) {
            headers.push({
              name: headerName,
              colspan: enabledObsSettings.length,
            });
            enabledObsSettings.forEach((obsSetting) => {
              subHeadersRow.push(
                obsSetting.field_heading || obsSetting.fieldname,
              );
            });
          } else {
            headers.push({ name: headerName, colspan: 1 });
            subHeadersRow.push(null);
          }
        } else if (observationFrom === "separate") {
          if (fieldname === "master" || fieldname === "uuc") {
            if (enabledObsSettings.length > 0) {
              headers.push({
                name: headerName,
                colspan: enabledObsSettings.length,
              });
              enabledObsSettings.forEach((obsSetting) => {
                subHeadersRow.push(
                  obsSetting.field_heading || obsSetting.fieldname,
                );
              });
            } else {
              headers.push({ name: headerName, colspan: 1 });
              subHeadersRow.push(null);
            }
          } else {
            headers.push({ name: headerName, colspan: 1 });
            subHeadersRow.push(null);
          }
        } else {
          headers.push({ name: headerName, colspan: 1 });
          subHeadersRow.push(null);
        }
      });

      console.log("✅ Generated Headers:", headers);
      console.log("✅ Generated Sub-headers:", subHeadersRow);

      return { headers, subHeadersRow };
    },
    [dynamicHeadings],
  );

  // ✅ CREATE OBSERVATION ROWS - SAME AS CALIBRATE STEP3
  const createObservationRows = useCallback(
    (observationData) => {
      if (!observationData || !Array.isArray(observationData)) {
        console.log("❌ No observation data provided");
        return [];
      }

      const rows = [];
      const observationFrom = dynamicHeadings?.observation_from || "master";
      const calibrationSettings =
        dynamicHeadings?.mainhading?.calibration_settings?.filter(
          (col) => col.checkbox === "yes",
        ) || [];
      const observationSettings =
        dynamicHeadings?.observation_heading?.observation_settings || [];
      const enabledObsSettings = observationSettings.filter(
        (obs) => obs.checkbox === "yes",
      );

      console.log("🔄 Creating observation rows...");
      console.log("📊 Observation From:", observationFrom);
      console.log("📊 Calibration Settings:", calibrationSettings.length);
      console.log("📊 Enabled Obs Settings:", enabledObsSettings.length);

      observationData.forEach((point, index) => {
        const row = [(index + 1).toString()];

        calibrationSettings.forEach((setting) => {
          const fieldname = setting.fieldname;

          // ✅ Handle mode field
          if (fieldname === "mode") {
            const modeData = point.summary_data?.mode;
            if (modeData && Array.isArray(modeData) && modeData.length > 0) {
              row.push(modeData[0]?.value || "");
            } else {
              row.push(point.mode || "");
            }
          }
          // ✅ Handle range field
          else if (fieldname === "range") {
            const rangeData = point.summary_data?.range;
            if (rangeData && Array.isArray(rangeData) && rangeData.length > 0) {
              row.push(rangeData[0]?.value || "");
            } else {
              row.push(point.range || "");
            }
          }
          // ✅ Handle UUC field
          else if (fieldname === "uuc") {
            if (observationFrom === "uuc" || observationFrom === "separate") {
              const uucData = point.summary_data?.uuc || [];

              if (uucData.length === 0) {
                enabledObsSettings.forEach(() => row.push(""));
              } else if (
                uucData.length === 1 &&
                uucData[0].repeatable === "0"
              ) {
                const uucValue = uucData[0]?.value || "";
                // ✅ FIXED - Dynamic length
                enabledObsSettings.forEach(() => {
                  row.push(uucValue);
                });
              } else {
                const sortedUucData = [...uucData].sort(
                  (a, b) => parseInt(a.repeatable) - parseInt(b.repeatable),
                );

                // ✅ FIXED - Dynamic length
                enabledObsSettings.forEach((_, idx) => {
                  if (idx < sortedUucData.length) {
                    row.push(sortedUucData[idx]?.value || "");
                  } else {
                    row.push("");
                  }
                });
              }
            } else {
              const uucData = point.summary_data?.uuc;
              if (uucData && Array.isArray(uucData) && uucData.length > 0) {
                const calculatedUuc = uucData.find(
                  (item) => item.repeatable === "0",
                );
                row.push(calculatedUuc?.value || "");
              } else {
                row.push("");
              }
            }
          }
          // ✅ Handle calculatedmaster field
          else if (fieldname === "calculatedmaster") {
            const calcMasterData = point.summary_data?.calculatedmaster;
            if (
              calcMasterData &&
              Array.isArray(calcMasterData) &&
              calcMasterData.length > 0
            ) {
              row.push(calcMasterData[0]?.value || "");
            } else {
              row.push(point.converted_point || point.calculated_master || "");
            }
          }
          // ✅ Handle MASTER field
          else if (fieldname === "master") {
            if (
              observationFrom === "master" ||
              observationFrom === "separate"
            ) {
              const masterData = point.summary_data?.master || [];
              const sortedMasterData = [...masterData].sort(
                (a, b) => parseInt(a.repeatable) - parseInt(b.repeatable),
              );

              enabledObsSettings.forEach((obsSetting, obsIndex) => {
                const masterValue = sortedMasterData[obsIndex]?.value || "";
                row.push(masterValue);
              });
            } else if (observationFrom === "uuc") {
              const masterData = point.summary_data?.master;
              if (
                masterData &&
                Array.isArray(masterData) &&
                masterData.length > 0
              ) {
                const masterSingleValue = masterData.find(
                  (item) => item.repeatable === "0",
                );
                row.push(
                  masterSingleValue?.value ||
                    point.point ||
                    point.converted_point ||
                    "",
                );
              } else {
                const masterValue = point.point || point.converted_point || "";
                row.push(masterValue);
              }
            } else {
              const masterData = point.summary_data?.master;
              if (
                masterData &&
                Array.isArray(masterData) &&
                masterData.length > 0
              ) {
                row.push(masterData[0]?.value || "");
              } else {
                row.push(point.point || point.converted_point || "");
              }
            }
          }
          // ✅ For all other fields (average, error, etc.)
          else {
            const summaryFieldData = point.summary_data?.[fieldname];
            if (
              summaryFieldData &&
              Array.isArray(summaryFieldData) &&
              summaryFieldData.length > 0
            ) {
              row.push(summaryFieldData[0]?.value || "");
            } else {
              row.push("");
            }
          }
        });

        console.log(`✅ Row ${index} complete:`, row);
        rows.push(row);
      });

      console.log("✅ Total rows created:", rows.length);
      return rows;
    },
    [dynamicHeadings],
  );

  // ✅ FETCH ALL DATA ON MOUNT
  useEffect(() => {
    const fetchAllData = async () => {
      if (!instid || !inwardid) {
        setError(
          `Missing parameters - instid: ${instid}, inwardid: ${inwardid}`,
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Starting data fetch...");
        console.log("📊 Parameters:", {
          instid,
          inwardid,
          caliblocation,
          calibacc,
        });

        // ✅ STEP 1: Fetch step3 details to get suffix
        const step3Response = await axios.get(
          "/calibrationprocess/get-calibration-step3-details",
          {
            params: {
              inward_id: inwardid,
              instid: instid,
              caliblocation: caliblocation,
              calibacc: calibacc,
            },
          },
        );

        const step3Data = step3Response.data;
        console.log("📊 Step3 Data:", step3Data);

        if (step3Data?.listOfInstrument?.suffix) {
          const foundSuffix = step3Data.listOfInstrument.suffix;
          setSuffix(foundSuffix);
          console.log("✅ Found suffix:", foundSuffix);

          // ✅ STEP 2: Fetch dynamic headings with observations
          const headingsResponse = await fetchDynamicHeadings(foundSuffix);

          if (headingsResponse) {
            console.log(
              "✅ Dynamic headings loaded:",
              headingsResponse.heading,
            );
            setDynamicHeadings(headingsResponse.heading);

            // ✅ STEP 3: Set observations from dynamic API
            if (headingsResponse.data?.calibration_points) {
              console.log(
                "✅ Observations loaded:",
                headingsResponse.data.calibration_points.length,
              );
              setObservations(headingsResponse.data.calibration_points);
            }

            // ✅ STEP 4: Set thermal coefficients
            if (headingsResponse.data?.thermal_coeff) {
              console.log("✅ Thermal coefficients loaded");
              setThermalCoeff(headingsResponse.data.thermal_coeff);
            }
          }
        }

        // ✅ STEP 5: Fetch main calibration report data
        const reportResponse = await axios.get(
          "/calibrationprocess/view-raw-data",
          {
            params: {
              instid: instid,
              inwardid: inwardid,
            },
          },
        );

        const reportData = reportResponse.data;
        console.log("📊 Report Data:", reportData);

        if (reportData?.success === true && reportData?.data) {
          const { uuc_details, master_details } = reportData.data;

          // Map equipment details
          if (uuc_details) {
            let referenceStandards = "N/A";
            if (
              reportData.data.standards &&
              Array.isArray(reportData.data.standards)
            ) {
              referenceStandards = reportData.data.standards
                .map((std) => std.name)
                .filter((name) => name)
                .join(", ");
            }

            const mappedEquipmentData = {
              name: uuc_details.equipment_name || uuc_details.name || "N/A",
              make: uuc_details.make || "N/A",
              model: uuc_details.model || "N/A",
              serialNo: uuc_details.serial_no || "N/A",
              idNo: uuc_details.id_no || "N/A",
              brnNo: uuc_details.brn_no || "N/A",
              inwarddate: reportData.data.timestamps?.inward_date || uuc_details.receive_date || "N/A",
              range: uuc_details.range || "N/A",
              leastCount: uuc_details.least_count || "N/A",
              condition: uuc_details.condition || "N/A",
              performedAt: caliblocation,
              calibratedon: uuc_details.calibrated_on || reportData.data.timestamps?.calibrated_on || "N/A",
              suggestedDueDate: uuc_details.due_date || reportData.data.timestamps?.due_date || "N/A",
              referenceStd: referenceStandards,
              temperature: uuc_details.temperature || "N/A",
              humidity: uuc_details.humidity || "N/A",
            };
            setEquipmentData(mappedEquipmentData);

            if (reportData.data.calibrated_by) {
              setCalibratedByImageUrl(reportData.data.calibrated_by);
            }

            if (reportData.data.approvedby) {
              setApprovedByImageUrl(reportData.data.approvedby);
            }
          }

          // Map master details
          if (master_details && Array.isArray(master_details)) {
            const mappedMasterData = master_details.map((master) => ({
              reference: master.name || master.reference_standard || "N/A",
              serialno: master.serialno || master.serial_no || "N/A",
              idNo: master.idno || master.newidno || master.id_no || "N/A",
              certificate:
                master.certificateno || master.certificate_no || "N/A",
              enddate:
                master.enddate ||
                master.cert_end_date ||
                master.valid_upto ||
                "N/A",
            }));

            console.log("🔍 Mapped Master Data: ", mappedMasterData);
            setMasterData(mappedMasterData);
          }
        }

        console.log("✅ All data fetched successfully");
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to load calibration report");
        toast.error("Failed to load calibration report");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [instid, inwardid, caliblocation, calibacc, fetchDynamicHeadings]);

  const handleBackToPerformCalibration = () => {
    navigate(
      `/dashboards/calibration-process/inward-entry-lab/perform-calibration/${inwardid}?caliblocation=${caliblocation}&calibacc=${calibacc}`,
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !error) {
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
        Loading Report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 text-sm">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <div className="mb-4 text-lg text-red-600">
            ⚠️ Error loading calibration report
          </div>
          <div className="mb-4 text-sm text-gray-600">{error}</div>
          <Button
            onClick={handleBackToPerformCalibration}
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            ← Back to Perform Calibration
          </Button>
        </div>
      </div>
    );
  }

  const tableStructure = dynamicHeadings
    ? generateDynamicTableStructure(
        dynamicHeadings.mainhading?.calibration_settings || [],
      )
    : null;
  const observationRows = createObservationRows(observations);

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-content, #printable-content * { visibility: visible; }
            #printable-content { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div className="bg-white p-6 text-sm">
        {/* Header */}
        <div className="no-print mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            View Raw Data - Calibration Report
          </h2>
          <Button
            variant="outline"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleBackToPerformCalibration}
          >
            ← Back to Perform Calibration
          </Button>
        </div>

        <div id="printable-content">
          {/* Logo and Title */}
          <div className="mb-4 flex items-center">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="mr-4 h-14"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <h2 className="text-lg font-semibold">(Details Of UUC)</h2>
          </div>

          {/* Equipment Details */}
          <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <p>
              <b>Name Of The Equipment:</b> {equipmentData.name}
            </p>
            <p>
              <b>BRN No:</b> {equipmentData.brnNo}
            </p>
            <p>
              <b>Make:</b> {equipmentData.make}
            </p>
            <p>
              <b>Receive Date:</b> {equipmentData.inwarddate}
            </p>
            <p>
              <b>Model:</b> {equipmentData.model}
            </p>
            <p>
              <b>Range:</b> {equipmentData.range}
            </p>
            <p>
              <b>Serial No:</b> {equipmentData.serialNo}
            </p>
            <p>
              <b>Least Count:</b> {equipmentData.leastCount}
            </p>
            <p>
              <b>ID No:</b> {equipmentData.idNo}
            </p>
            <p>
              <b>Condition Of UUC:</b> {equipmentData.condition}
            </p>
            <p>
              <b>Calibration Performed At:</b> {equipmentData.performedAt}
            </p>
            <p>
              <b>Calibrated On:</b> {equipmentData.calibratedon}
            </p>
            <p>
              <b>Suggested Due Date:</b> {equipmentData.suggestedDueDate}
            </p>
            <p>
              <b>Reference Standard:</b> {equipmentData.referenceStd}
            </p>
            <p>
              <b>Temperature (°C):</b> {equipmentData.temperature}
            </p>
            <p>
              <b>Humidity (%RH):</b> {equipmentData.humidity}
            </p>
          </div>

          {/* ✅ THERMAL COEFFICIENTS - ONLY IF EXISTS */}
          {Object.keys(thermalCoeff).length > 0 && (
            <div className="mb-6 rounded bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold">Thermal Coefficients</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {thermalCoeff.uuc && (
                  <p>
                    <b>UUC Thermal Coefficient:</b> {thermalCoeff.uuc}
                  </p>
                )}
                {thermalCoeff.master && (
                  <p>
                    <b>Master Thermal Coefficient:</b> {thermalCoeff.master}
                  </p>
                )}
                {thermalCoeff.thickness_of_graduation && (
                  <p>
                    <b>Thickness of Graduation:</b>{" "}
                    {thermalCoeff.thickness_of_graduation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Master Standards */}
          <h3 className="mb-2 text-base font-semibold">
            Master Standards Used For Calibration
          </h3>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Reference Standard
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    S.w/o
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    LD No.
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Certificate No.
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left">
                    Valid Upto
                  </th>
                </tr>
              </thead>
              <tbody>
                {masterData.length > 0 ? (
                  masterData.map((master, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-3 py-2">
                        {master.reference}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {master.serialno}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {master.idNo}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {master.certificate}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {master.enddate}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="border border-gray-300 px-3 py-2 text-center text-gray-500"
                      colSpan="5"
                    >
                      No master standard data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ DYNAMIC OBSERVATION TABLE - USING CUSTOM HEADINGS */}
          {tableStructure && observationRows.length > 0 ? (
            <>
              <h3 className="mb-2 text-base font-semibold">
                Calibration Results {suffix && `(Suffix: ${suffix})`}
              </h3>
              <div className="mb-6 overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                  <thead>
                    {/* Main headers */}
                    <tr className="bg-gray-100">
                      {tableStructure.headers.map((header, index) => (
                        <th
                          key={index}
                          colSpan={header.colspan}
                          className="border border-gray-300 px-3 py-2 text-left font-medium tracking-wider text-gray-700 uppercase"
                        >
                          {header.name}
                        </th>
                      ))}
                    </tr>
                    {/* Sub headers */}
                    {tableStructure.subHeadersRow.some(
                      (item) => item !== null,
                    ) && (
                      <tr className="bg-gray-50">
                        {tableStructure.subHeadersRow.map(
                          (subHeader, index) => (
                            <th
                              key={index}
                              className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600"
                            >
                              {subHeader || ""}
                            </th>
                          ),
                        )}
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {observationRows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={
                          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }
                      >
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className="border border-gray-300 px-3 py-2"
                          >
                            {cell || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="mb-6 rounded border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-yellow-800">
                ⚠️ No calibration observation data available
              </p>
            </div>
          )}

          {/* Environmental Conditions */}
          {(equipmentData.temperature !== "N/A" ||
            equipmentData.humidity !== "N/A") && (
            <div className="mb-6 rounded bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold">
                Environmental Conditions During Calibration
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <b>Temperature:</b> {equipmentData.temperature}°C
                </p>
                <p>
                  <b>Humidity:</b> {equipmentData.humidity}% RH
                </p>
              </div>
            </div>
          )}

          {/* Footer - Signatures */}
          <div className="mt-12 flex justify-between border-t pt-8 text-xs">
            {calibratedByImageUrl && (
              <div>
                <p className="mb-1 font-semibold">Calibrated By</p>
                <img
                  src={calibratedByImageUrl}
                  alt="Calibrated By Signature"
                  className="mb-1 h-16 w-auto"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            {approvedByImageUrl && (
              <div className="text-right">
                <p
                  className="mb-1 font-semibold"
                  style={{ marginRight: "303px" }}
                >
                  Authorized By
                </p>
                <img
                  src={approvedByImageUrl}
                  alt="Authorized By Signature"
                  className="mb-1 h-16 w-auto"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}
          </div>
        </div>

        <hr className="my-4 border-t" />

        {/* Action Buttons */}
        <div className="no-print mt-6 flex gap-3">
          <Button
            className="rounded bg-indigo-500 px-6 py-2 text-white hover:bg-fuchsia-500"
            onClick={handlePrint}
          >
            Print Report
          </Button>
        </div>
      </div>
    </>
  );
}
