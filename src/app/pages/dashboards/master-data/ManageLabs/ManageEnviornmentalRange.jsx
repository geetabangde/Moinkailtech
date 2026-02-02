import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import ReactSelect from "react-select";

export default function ManageEnvironmentalRange() {
  const navigate = useNavigate();
  const params = useParams();
  const labId = params.id; // Route uses :id parameter
  
  console.log("URL params:", params);
  console.log("Lab ID:", labId);
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [unitOptions, setUnitOptions] = useState([]);
  const [environmentalSchedule, setEnvironmentalSchedule] = useState([]);
  const [ranges, setRanges] = useState([]);

  const rangeTypeOptions = [
    { label: "Range", value: "Range" },
    { label: "Variable", value: "Variable" }
  ];

  // Fetch units list for dropdown
  const fetchUnits = async () => {
    try {
      const response = await axios.get("/master/units-list");
      
      if (response.data && response.data.data) {
        const unitsFormatted = response.data.data.map((unit) => ({
          label: `${unit.name || unit.unit_name} (${unit.description || ""})`,
          value: unit.id
        }));
        setUnitOptions(unitsFormatted);
      }
    } catch (error) {
      console.error("Failed to fetch units:", error);
      toast.error("Failed to load units");
    }
  };

  // Fetch environmental schedule (types enabled for this lab)
  const fetchEnvironmentalSchedule = useCallback(async () => {
    if (!labId) {
      console.log("No labId provided, skipping schedule fetch");
      setLoading(false);
      return;
    }

    console.log("Fetching environmental schedule for labId:", labId);
    setLoading(true);

    try {
      const response = await axios.get(`/master/get-environmental-schedule/${labId}`);
      console.log("Environmental schedule response:", response.data);

      if (response.data && response.data.data && response.data.data.length > 0) {
        // Remove duplicate types - keep only unique types with their first id
        const uniqueTypes = [];
        const seenTypes = new Set();
        
        response.data.data.forEach((schedule) => {
          if (!seenTypes.has(schedule.type)) {
            uniqueTypes.push(schedule);
            seenTypes.add(schedule.type);
          }
        });
        
        console.log("Unique environmental types:", uniqueTypes);
        setEnvironmentalSchedule(uniqueTypes);
      } else {
        console.log("No environmental schedule data found for lab:", labId);
        setEnvironmentalSchedule([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch environmental schedule:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load environmental types");
      setEnvironmentalSchedule([]);
      setLoading(false);
    }
  }, [labId]);

  // Fetch environmental range data for all types in the schedule
  const fetchEnvironmentalRanges = useCallback(async () => {
    if (!labId || environmentalSchedule.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching ranges for schedule:", environmentalSchedule);

      const allRanges = [];
      
      // Process each type from schedule (matching PHP logic exactly)
      for (const schedule of environmentalSchedule) {
        if (schedule.type === "Temperature Rh") {
          // Temperature Rh has 2 subtypes: Temperature and Humidity
          
          // Fetch Temperature
          try {
            const tempResponse = await axios.get("/master/get-enviornmental-range", {
              params: {
                labid: labId,
                type: "Temperature Rh",
                subtype: "Temperature"
              }
            });

            if (tempResponse.data && tempResponse.data.range) {
              const rangeData = tempResponse.data.range;
              console.log("✓ Temperature:", rangeData);
              
              allRanges.push({
                typeid: schedule.id,
                type: "Temperature Rh",
                subtype: "Temperature",
                rangetype: rangeData.rangetype || "Range",
                minrange: rangeData.minrange || "",
                maxrange: rangeData.maxrange || "",
                unit: rangeData.unit || null
              });
            } else {
              // Empty if no data
              allRanges.push({
                typeid: schedule.id,
                type: "Temperature Rh",
                subtype: "Temperature",
                rangetype: "Range",
                minrange: "",
                maxrange: "",
                unit: null
              });
            }
          } catch (err) {
            console.log("No data for Temperature, adding empty:", err.message);
            allRanges.push({
              typeid: schedule.id,
              type: "Temperature Rh",
              subtype: "Temperature",
              rangetype: "Range",
              minrange: "",
              maxrange: "",
              unit: null
            });
          }

          // Fetch Humidity
          try {
            const humidityResponse = await axios.get("/master/get-enviornmental-range", {
              params: {
                labid: labId,
                type: "Temperature Rh",
                subtype: "Humidity"
              }
            });

            if (humidityResponse.data && humidityResponse.data.range) {
              const rangeData = humidityResponse.data.range;
              console.log("✓ Humidity:", rangeData);
              
              allRanges.push({
                typeid: schedule.id,
                type: "Temperature Rh",
                subtype: "Humidity",
                rangetype: rangeData.rangetype || "Range",
                minrange: rangeData.minrange || "",
                maxrange: rangeData.maxrange || "",
                unit: rangeData.unit || null
              });
            } else {
              // Empty if no data
              allRanges.push({
                typeid: schedule.id,
                type: "Temperature Rh",
                subtype: "Humidity",
                rangetype: "Range",
                minrange: "",
                maxrange: "",
                unit: null
              });
            }
          } catch (err) {
            console.log("No data for Humidity, adding empty:", err.message);
            allRanges.push({
              typeid: schedule.id,
              type: "Temperature Rh",
              subtype: "Humidity",
              rangetype: "Range",
              minrange: "",
              maxrange: "",
              unit: null
            });
          }
        } else {
          // For all other types: subtype = type (PHP: $subtype = $row['type'])
          try {
            const response = await axios.get("/master/get-enviornmental-range", {
              params: {
                labid: labId,
                type: schedule.type,
                subtype: schedule.type // Same as type
              }
            });

            if (response.data && response.data.range) {
              const rangeData = response.data.range;
              console.log(`✓ ${schedule.type}:`, rangeData);
              
              allRanges.push({
                typeid: schedule.id,
                type: schedule.type,
                subtype: schedule.type,
                rangetype: rangeData.rangetype || "Range",
                minrange: rangeData.minrange || "",
                maxrange: rangeData.maxrange || "",
                unit: rangeData.unit || null
              });
            } else {
              // Empty if no data
              allRanges.push({
                typeid: schedule.id,
                type: schedule.type,
                subtype: schedule.type,
                rangetype: "Range",
                minrange: "",
                maxrange: "",
                unit: null
              });
            }
          } catch (err) {
            console.log(`No data for ${schedule.type}, adding empty:`, err.message);
            allRanges.push({
              typeid: schedule.id,
              type: schedule.type,
              subtype: schedule.type,
              rangetype: "Range",
              minrange: "",
              maxrange: "",
              unit: null
            });
          }
        }
      }

      console.log("All ranges:", allRanges);
      setRanges(allRanges);
      
    } catch (error) {
      console.error("Failed to fetch environmental ranges:", error);
      toast.error("Failed to load environmental ranges");
    } finally {
      setLoading(false);
    }
  }, [labId, environmentalSchedule]);

  useEffect(() => {
    console.log("=== Component Mount ===");
    fetchUnits();
  }, []);

  useEffect(() => {
    console.log("=== labId changed ===", labId);
    if (labId) {
      fetchEnvironmentalSchedule();
    }
  }, [labId, fetchEnvironmentalSchedule]);

  useEffect(() => {
    console.log("=== environmentalSchedule changed ===", environmentalSchedule);
    if (environmentalSchedule.length > 0) {
      fetchEnvironmentalRanges();
    } else {
      console.log("Environmental schedule is empty, skipping range fetch");
    }
  }, [environmentalSchedule, fetchEnvironmentalRanges]);

  // Handle range type change
  const handleRangeTypeChange = (index, selectedOption) => {
    const newRanges = [...ranges];
    newRanges[index].rangetype = selectedOption.value;
    setRanges(newRanges);
  };

  // Handle unit change
  const handleUnitChange = (index, selectedOption) => {
    const newRanges = [...ranges];
    newRanges[index].unit = selectedOption ? selectedOption.value : null;
    setRanges(newRanges);
  };

  // Handle input change
  const handleInputChange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index][field] = value;
    setRanges(newRanges);
  };

  // Save environmental ranges (matching PHP insertEnviornmentalRange.php)
  const handleSave = async () => {
    if (!labId) {
      toast.error("Lab ID is required");
      return;
    }

    // Validate ranges
    const hasEmptyFields = ranges.some((range) => {
      if (!range.rangetype || !range.unit) {
        return true;
      }
      if (range.rangetype === "Range") {
        return !range.minrange || !range.maxrange;
      } else {
        return !range.minrange;
      }
    });

    if (hasEmptyFields) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaveLoading(true);
    try {
      // Prepare payload matching PHP structure
      const payload = {
        labid: parseInt(labId),
        ranges: ranges.map((range) => ({
          typeid: range.typeid,
          type: range.type,
          subtype: range.subtype,
          rangetype: range.rangetype,
          minrange: range.minrange,
          maxrange: range.rangetype === "Range" ? range.maxrange : range.minrange,
          unit: range.unit
        }))
      };

      const response = await axios.post("/master/save-enviornmental-range", payload);
      
      toast.success(response.data?.message || "Environmental ranges saved successfully ✅");
      
      // Navigate back to manage labs
      navigate("/dashboards/master-data/manage-labs");
    } catch (error) {
      console.error("Failed to save environmental ranges:", error);
      toast.error(error.response?.data?.message || "Failed to save environmental ranges ❌");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    console.log("Rendering: LOADING state");
    return (
      <Page title="Add Lab">
        <div className="flex h-[60vh] items-center justify-center text-gray-600">
          <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
          </svg>
          Loading...
        </div>
      </Page>
    );
  }

  console.log("Rendering: Main content");
  console.log("- labId:", labId);
  console.log("- environmentalSchedule:", environmentalSchedule);
  console.log("- ranges:", ranges);
  console.log("- ranges.length:", ranges.length);

  return (
    <Page title="Add Lab">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Add Lab</h2>
          <Button
            variant="outline"
            className="text-white bg-cyan-500 hover:bg-cyan-600"
            onClick={() => navigate("/dashboards/master-data/manage-labs")}
          >
            {"Back to Manage Labs"}
          </Button>
        </div>

        {ranges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No environmental types configured for this lab.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {ranges.map((range, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  {/* Subtype Label */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {range.subtype}
                    </label>
                  </div>

                  {/* Range Type Dropdown */}
                  <div className="col-span-2">
                    <ReactSelect
                      value={rangeTypeOptions.find(opt => opt.value === range.rangetype)}
                      onChange={(selected) => handleRangeTypeChange(index, selected)}
                      options={rangeTypeOptions}
                      placeholder="Select type..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>

                  {/* Min Range Input */}
                  <div className="col-span-3">
                    <Input
                      type="number"
                      value={range.minrange}
                      onChange={(e) => handleInputChange(index, "minrange", e.target.value)}
                      placeholder={range.rangetype === "Variable" ? "Value" : "Min"}
                      className="w-full"
                    />
                  </div>

                  {/* Max Range Input - Only show if Range type */}
                  <div className="col-span-3">
                    {range.rangetype === "Range" ? (
                      <Input
                        type="number"
                        value={range.maxrange}
                        onChange={(e) => handleInputChange(index, "maxrange", e.target.value)}
                        placeholder="Max"
                        className="w-full"
                      />
                    ) : (
                      <div className="h-10"></div>
                    )}
                  </div>

                  {/* Unit Dropdown */}
                  <div className="col-span-2">
                    <ReactSelect
                      value={unitOptions.find(opt => opt.value === range.unit)}
                      onChange={(selected) => handleUnitChange(index, selected)}
                      options={unitOptions}
                      placeholder="Select unit..."
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saveLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
              >
                {saveLoading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  "Add Lab"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}