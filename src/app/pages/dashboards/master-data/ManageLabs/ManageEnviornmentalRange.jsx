import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import ReactSelect from "react-select";

export default function ManageEnvironmentalRange() {
  const navigate = useNavigate();
  const { labId } = useParams(); // Get labId from URL params
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [unitOptions, setUnitOptions] = useState([]);
  const [ranges, setRanges] = useState([]);

  // Subtypes for Temperature Rh
  const subtypes = [
    { id: 1, name: "Temperature" },
    { id: 2, name: "Humidity" },
    { id: 3, name: "En Voltage" },
    { id: 4, name: "Power Supply" }
  ];

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
          label: unit.name || unit.unit_name,
          value: unit.id
        }));
        setUnitOptions(unitsFormatted);
      }
    } catch (error) {
      console.error("Failed to fetch units:", error);
      toast.error("Failed to load units");
    }
  };

  // Fetch environmental ranges for the lab
  const fetchEnvironmentalRanges = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch for each subtype
      const promises = subtypes.map((subtype) =>
        axios.get("/master/get-enviornmental-range", {
          params: {
            labid: labId,
            type: "Temperature Rh",
            subtype: subtype.name
          }
        })
      );

      const responses = await Promise.all(promises);
      
      // Map responses to ranges
      const fetchedRanges = subtypes.map((subtype, index) => {
        const data = responses[index]?.data;
        
        if (data && Object.keys(data).length > 0) {
          return {
            subtype: subtype.name,
            rangetype: data.rangetype || "Range",
            minrange: data.minrange || "",
            maxrange: data.maxrange || "",
            unit: data.unit || null
          };
        }
        
        // Default empty range
        return {
          subtype: subtype.name,
          rangetype: "Range",
          minrange: "",
          maxrange: "",
          unit: null
        };
      });

      setRanges(fetchedRanges);
    } catch (error) {
      console.error("Failed to fetch environmental ranges:", error);
      toast.error("Failed to load environmental ranges");
    } finally {
      setLoading(false);
    }
  }, [labId]);

  useEffect(() => {
    fetchUnits();
    if (labId) {
      fetchEnvironmentalRanges();
    }
  }, [labId, fetchEnvironmentalRanges]);

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

  // Save environmental ranges
  const handleSave = async () => {
    if (!labId) {
      toast.error("Lab ID is missing");
      return;
    }

    // Validate ranges
    const hasEmptyFields = ranges.some((range) => {
      if (range.rangetype === "Range") {
        return !range.minrange || !range.maxrange || !range.unit;
      } else {
        return !range.minrange || !range.unit;
      }
    });

    if (hasEmptyFields) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaveLoading(true);
    try {
      // Save each range
      const promises = ranges.map((range) =>
        axios.post("/master/save-enviornmental-range", {
          labid: parseInt(labId),
          type: "Temperature Rh",
          subtype: range.subtype,
          rangetype: range.rangetype,
          minrange: range.minrange,
          maxrange: range.rangetype === "Range" ? range.maxrange : range.minrange,
          unit: range.unit
        })
      );

      await Promise.all(promises);
      
      toast.success("Environmental ranges saved successfully ✅");
      navigate("/dashboards/master-data/manage-labs");
    } catch (error) {
      console.error("Failed to save environmental ranges:", error);
      toast.error("Failed to save environmental ranges ❌");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Page title="Manage Environmental Range">
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
             Back to Manage Labs
          </Button>
        </div>

        <div className="space-y-6">
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
                />
              </div>

              {/* Min Range Input */}
              <div className="col-span-2">
                <Input
                  type="number"
                  value={range.minrange}
                  onChange={(e) => handleInputChange(index, "minrange", e.target.value)}
                  placeholder="Min"
                />
              </div>

              {/* Max Range Input - Only show if Range type */}
              <div className="col-span-2">
                {range.rangetype === "Range" && (
                  <Input
                    type="number"
                    value={range.maxrange}
                    onChange={(e) => handleInputChange(index, "maxrange", e.target.value)}
                    placeholder="Max"
                  />
                )}
              </div>

              {/* Unit Dropdown */}
              <div className="col-span-4">
                <ReactSelect
                  value={unitOptions.find(opt => opt.value === range.unit)}
                  onChange={(selected) => handleUnitChange(index, selected)}
                  options={unitOptions}
                  placeholder="Select unit..."
                  isClearable
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
            className="bg-green-600 hover:bg-green-700 text-white px-6"
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
      </div>
    </Page>
  );
}