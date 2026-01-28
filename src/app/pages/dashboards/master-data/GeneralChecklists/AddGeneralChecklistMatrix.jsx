import { useState, useEffect } from "react";
import { Button, Input } from "components/ui";
import { useNavigate, useParams } from "react-router-dom";
import axios from "utils/axios";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";

const MasterChecklistForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get masterid from URL params

  const [formData, setFormData] = useState({
    discipline: null,
    equipmentForVerification: null,
    generalCheck: "",
    checkPoint: "",
    unit: null,
    acceptanceLimit: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown options state
  const [disciplines, setDisciplines] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Fetch all dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      setLoadingDropdowns(true);

      console.log("Fetching dropdown data...");

      // Fetch disciplines and units first
      const [disciplinesRes, unitsRes] = await Promise.all([
        axios.get("/calibrationoperations/get-disciplines"),
        axios.get("/master/units-list"),
      ]);

      console.log("Disciplines API Response:", disciplinesRes.data);
      console.log("Units API Response:", unitsRes.data);

      // Format disciplines for react-select
      if (disciplinesRes.data && disciplinesRes.data.data) {
        const disciplineOptions = disciplinesRes.data.data.map((item) => ({
          value: item.id,
          label: item.name || item.discipline_name,
        }));
        console.log("Formatted disciplines:", disciplineOptions);
        setDisciplines(disciplineOptions);
      } else {
        console.log("No disciplines data found");
        setDisciplines([]);
      }

      // Format units for react-select
      if (unitsRes.data && unitsRes.data.data) {
        const unitOptions = unitsRes.data.data.map((item) => ({
          value: item.id,
          label: item.unit_description || item.name || item.unit,
        }));
        console.log("Formatted units:", unitOptions);
        setUnits(unitOptions);
      } else {
        console.log("No units data found");
        setUnits([]);
      }

      // Try to fetch all instruments
      try {
        console.log("Fetching instruments...");
        const instrumentsRes = await axios.get("/material/get-mm-instrument");

        console.log("Instruments API Full Response:", instrumentsRes);
        console.log("Instruments API Data:", instrumentsRes.data);
        console.log("Instruments Response Status:", instrumentsRes.status);

        // Check different possible response structures
        let instrumentsData = null;

        if (instrumentsRes.data?.data) {
          instrumentsData = instrumentsRes.data.data;
        } else if (instrumentsRes.data?.instrument) {
          instrumentsData = instrumentsRes.data.instrument;
        } else if (Array.isArray(instrumentsRes.data)) {
          instrumentsData = instrumentsRes.data;
        }

        console.log("Extracted instruments data:", instrumentsData);

        if (
          instrumentsData &&
          Array.isArray(instrumentsData) &&
          instrumentsData.length > 0
        ) {
          const instrumentOptions = instrumentsData.map((item) => ({
            value: item.id,
            label:
              item.name ||
              item.instrument_name ||
              item.description ||
              `Instrument ${item.id}`,
          }));
          console.log("Formatted instruments:", instrumentOptions);
          setInstruments(instrumentOptions);
          toast.success(`Loaded ${instrumentOptions.length} instruments`);
        } else {
          console.log("No instruments data found or empty array");
          setInstruments([]);
          toast.info("No instruments available");
        }
      } catch (instError) {
        console.error("Error fetching instruments:", instError);
        console.error("Instruments error response:", instError.response);
        console.error("Instruments error data:", instError.response?.data);
        console.error("Instruments error status:", instError.response?.status);
        setInstruments([]);
        // Don't show error toast - instruments are optional
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to load dropdown data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const handleSelectChange = (field, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption,
    }));

    // No need to fetch instruments on discipline change - all instruments already loaded
    // Just reset the equipment selection when discipline changes
    if (field === "discipline" && selectedOption) {
      setFormData((prev) => ({
        ...prev,
        discipline: selectedOption,
        equipmentForVerification: null, // Reset instrument when discipline changes
      }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.discipline) {
      newErrors.discipline = "Discipline is required";
    }

    // Equipment for verification is optional (no validation)

    if (!formData.generalCheck.trim()) {
      newErrors.generalCheck = "General check is required";
    }

    if (!formData.checkPoint.trim()) {
      newErrors.checkPoint = "Check point is required";
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }

    if (!formData.acceptanceLimit.trim()) {
      newErrors.acceptanceLimit = "Acceptance limit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        discipline: formData.discipline.value,
        equipformverif: formData.equipmentForVerification?.value || null,
        generalcheck: formData.generalCheck,
        checkpoint: parseInt(formData.checkPoint) || 0,
        unit: formData.unit.value,
        acceptancelimit: parseInt(formData.acceptanceLimit) || 0,
        masterid: parseInt(id) || 96,
      };

      console.log("=== SUBMITTING MASTER CHECKLIST ===");
      console.log("Form Data:", formData);
      console.log("Payload to be sent:", payload);
      console.log("API Endpoint: /material/add-site-checklist");

      const response = await axios.post(
        "/material/add-site-checklist",
        payload,
      );

      console.log("API Response:", response);
      console.log("Response Data:", response.data);
      console.log("Response Status:", response.status);

      toast.success("Master checklist added successfully!");

      // Navigate back to the general checklists list after a short delay
      setTimeout(() => {
        navigate("/dashboards/master-data/general-checklists");
      }, 1000);
    } catch (error) {
      console.error("=== ERROR SUBMITTING MASTER CHECKLIST ===");
      console.error("Error:", error);
      console.error("Error Response:", error.response);
      console.error("Error Data:", error.response?.data);
      console.error("Error Status:", error.response?.status);
      console.error("Error Message:", error.response?.data?.message);

      toast.error(
        error.response?.data?.message ||
          "Failed to add master checklist. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster position="top-right" />
      <div className="mx-auto max-w-6xl rounded-lg bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h1 className="text-lg font-medium text-gray-900">
            Add master Checklist
          </h1>
          <Button
            className="rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-500"
            onClick={() => navigate("/dashboards/master-data/general-checklists")}
          >
            &lt;&lt; Back to Master Check List
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {loadingDropdowns ? (
            <div className="py-8 text-center">
              <p className="text-gray-600">Loading form data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Discipline Field */}
              <div className="flex items-center">
                <label className="w-48 pr-4 text-right font-medium text-gray-700">
                  Discipline <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <Select
                    value={formData.discipline}
                    onChange={(option) =>
                      handleSelectChange("discipline", option)
                    }
                    options={disciplines}
                    placeholder="Select Discipline"
                    className={errors.discipline ? "border-red-500" : ""}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderColor: errors.discipline
                          ? "#ef4444"
                          : provided.borderColor,
                        "&:hover": {
                          borderColor: errors.discipline
                            ? "#ef4444"
                            : provided.borderColor,
                        },
                      }),
                    }}
                  />
                  {errors.discipline && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.discipline}
                    </p>
                  )}
                </div>
              </div>

              {/* Equipment for Verification Field - NO VALIDATION */}
              <div className="flex items-center">
                <label className="w-48 pr-4 text-right font-medium text-gray-700">
                  Equipment for Verification
                </label>
                <div className="flex-1">
                  <Select
                    value={formData.equipmentForVerification}
                    onChange={(option) =>
                      handleSelectChange("equipmentForVerification", option)
                    }
                    options={instruments}
                    placeholder="Select Equipment"
                    noOptionsMessage={() => "No instruments available"}
                  />
                </div>
              </div>

              {/* General check Field */}
              <div className="flex items-start">
                <label className="w-48 pt-2 pr-4 text-right font-medium text-gray-700">
                  General check <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <textarea
                    value={formData.generalCheck}
                    onChange={(e) =>
                      handleInputChange("generalCheck", e.target.value)
                    }
                    className={`w-full resize-none rounded border px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none ${
                      errors.generalCheck ? "border-red-500" : "border-gray-300"
                    }`}
                    rows="4"
                    placeholder="Enter general check details"
                  />
                  {errors.generalCheck && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.generalCheck}
                    </p>
                  )}
                </div>
              </div>

              {/* Check Point Field */}
              <div className="flex items-center">
                <label className="w-48 pr-4 text-right font-medium text-gray-700">
                  Check Point <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <Input
                    type="text"
                    value={formData.checkPoint}
                    onChange={(e) =>
                      handleInputChange("checkPoint", e.target.value)
                    }
                    className={`w-full rounded border px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none ${
                      errors.checkPoint ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter check point"
                  />
                  {errors.checkPoint && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.checkPoint}
                    </p>
                  )}
                </div>
              </div>

              {/* Unit Field */}
              <div className="flex items-center">
                <label className="w-48 pr-4 text-right font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <Select
                    value={formData.unit}
                    onChange={(option) => handleSelectChange("unit", option)}
                    options={units}
                    placeholder="Select Unit"
                    className={errors.unit ? "border-red-500" : ""}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderColor: errors.unit
                          ? "#ef4444"
                          : provided.borderColor,
                        "&:hover": {
                          borderColor: errors.unit
                            ? "#ef4444"
                            : provided.borderColor,
                        },
                      }),
                    }}
                  />
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-500">{errors.unit}</p>
                  )}
                </div>
              </div>

              {/* Acceptance limit Field */}
              <div className="flex items-center">
                <label className="w-48 pr-4 text-right font-medium text-gray-700">
                  Acceptance limit <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                  <Input
                    type="text"
                    value={formData.acceptanceLimit}
                    onChange={(e) =>
                      handleInputChange("acceptanceLimit", e.target.value)
                    }
                    className={`w-full rounded border px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none ${
                      errors.acceptanceLimit
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter acceptance limit"
                  />
                  {errors.acceptanceLimit && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.acceptanceLimit}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              className="rounded bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              onClick={handleSubmit}
              disabled={loading || loadingDropdowns}
            >
              {loading ? "Saving..." : "Save Master Checklist"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterChecklistForm;