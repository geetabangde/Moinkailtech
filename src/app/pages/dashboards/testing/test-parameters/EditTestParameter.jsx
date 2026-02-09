import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import Select from "react-select";

export default function EditTestParameter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mintemp: "",
    maxtemp: "",
    minhumidity: "",
    maxhumidity: "",
    time: "",
    mindurationdays: "",
    mindurationhours: "",
    maxdurationdays: "",
    maxdurationhours: "",
    reminderdays: "",
    reminderhours: "",
    department: "",
    nabl: "",
    products: [],
    instruments: [],
    measurements: [],
    results: [],
    cycle: "",
    visible: "",
    resultype: "",
    resultunit: "",
    decimal: "",
    minnabl: "",
    maxnabl: "",
    minqai: "",
    maxqai: "",
    remark: "",
  });

  // Dropdown data states
  const [dropdowns, setDropdowns] = useState({
    products: [],
    instruments: [],
    measurements: [],
    results: [],
    resultTypes: [],
    labs: [],
    units: [],
    choices: [
      { id: 1, name: "Yes" },
      { id: 2, name: "No" },
    ],
  });

  // Helper function to parse string IDs to arrays
  const parseStringToArray = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str.map(item => parseInt(item)).filter(item => !isNaN(item));
    
    // Handle comma-separated string
    if (typeof str === 'string') {
      return str.split(',').map(item => {
        const num = parseInt(item.trim());
        return isNaN(num) ? null : num;
      }).filter(item => item !== null);
    }
    
    return [];
  };

  // Fetch dropdown data and existing parameter data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setFetchLoading(true);
        console.log("Fetching data for ID:", id);

        // Fetch dropdown data
        const [
          productsRes,
          instrumentsRes,
          measurementsRes,
          resultsRes,
          resultTypesRes,
          labsRes,
          unitsRes,
        ] = await Promise.all([
          axios.get("/testing/get-prodcut-list"),
          axios.get("/testing/get-instrument-categories"),
          axios.get("/testing/get-measurement"),
          axios.get("/testing/get-measurement-result"),
          axios.get("/testing/get-resulttypes"),
          axios.get("/master/list-lab"),
          axios.get("/master/units-list"),
        ]);

        // Set dropdowns
        setDropdowns({
          products: productsRes.data?.data || [],
          instruments: instrumentsRes.data?.data || [],
          measurements: measurementsRes.data?.data || [],
          results: resultsRes.data?.data || [],
          resultTypes: resultTypesRes.data?.data || [],
          labs: labsRes.data?.data || [],
          units: unitsRes.data?.data || [],
          choices: [
            { id: 1, name: "Yes" },
            { id: 2, name: "No" },
          ],
        });

        // Fetch existing parameter data
        if (id) {
          console.log("Fetching parameter data with query parameter id=", id);
          
          // ✅ FIXED: Using query parameter instead of path parameter
          const response = await axios.get(`/testing/get-perameter-byid`, {
            params: { id: id }
          });
          
          console.log("API Response:", response.data);
          
          const result = response.data;

          if (result.status === true || result.status === "true") {
            const data = result.data;
            
            console.log("Parameter data received:", data);
            
            // Convert API response to form data format
            setFormData({
              name: data.name || "",
              description: data.description || "",
              mintemp: data.mintemp?.toString() || "",
              maxtemp: data.maxtemp?.toString() || "",
              minhumidity: data.minhumidity?.toString() || "",
              maxhumidity: data.maxhumidity?.toString() || "",
              time: data.time?.toString() || "",
              mindurationdays: data.mindurationdays?.toString() || "",
              mindurationhours: data.mindurationhours?.toString() || "",
              maxdurationdays: data.maxdurationdays?.toString() || "",
              maxdurationhours: data.maxdurationhours?.toString() || "",
              reminderdays: data.reminderdays?.toString() || "",
              reminderhours: data.reminderhours?.toString() || "",
              department: data.department?.toString() || "",
              nabl: data.nabl?.toString() || "",
              // Convert comma-separated strings to arrays
              products: parseStringToArray(data.products),
              instruments: parseStringToArray(data.instruments),
              measurements: parseStringToArray(data.measurements),
              results: parseStringToArray(data.results),
              cycle: data.cycle?.toString() || "",
              visible: data.visible?.toString() || "",
              resultype: data.resultype?.toString() || "",
              resultunit: data.resultunit?.toString() || "",
              decimal: data.decimal?.toString() || "",
              minnabl: data.minnabl?.toString() || "",
              maxnabl: data.maxnabl?.toString() || "",
              minqai: data.minqai?.toString() || "",
              maxqai: data.maxqai?.toString() || "",
              remark: data.remark || "",
            });
          } else {
            toast.error(result.message || "Failed to load test parameter data.");
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        
        if (err.response?.status === 404) {
          toast.error("Test parameter not found. Please check the ID.");
        } else {
          toast.error("Something went wrong while loading data.");
        }
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handler for react-select multi-select
  const handleReactSelectChange = (selectedOptions, fieldName) => {
    const selectedValues = selectedOptions 
      ? selectedOptions.map(option => option.value) 
      : [];

    console.log(`${fieldName} selected:`, selectedValues);

    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedValues,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Parameter name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.department) newErrors.department = "Lab is required";
    if (!formData.nabl) newErrors.nabl = "NABL selection is required";
    if (!formData.visible) newErrors.visible = "Visible selection is required";
    if (!formData.resultype) newErrors.resultype = "Result type is required";
    if (!formData.resultunit) newErrors.resultunit = "Result unit is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        id: parseInt(id),
        name: formData.name,
        description: formData.description,
        mintemp: formData.mintemp ? Number(formData.mintemp) : 0,
        maxtemp: formData.maxtemp ? Number(formData.maxtemp) : 0,
        minhumidity: formData.minhumidity ? Number(formData.minhumidity) : 0,
        maxhumidity: formData.maxhumidity ? Number(formData.maxhumidity) : 0,
        time: formData.time ? Number(formData.time) : 0,
        mindurationdays: formData.mindurationdays ? Number(formData.mindurationdays) : 0,
        mindurationhours: formData.mindurationhours ? Number(formData.mindurationhours) : 0,
        maxdurationdays: formData.maxdurationdays ? Number(formData.maxdurationdays) : 0,
        maxdurationhours: formData.maxdurationhours ? Number(formData.maxdurationhours) : 0,
        reminderdays: formData.reminderdays ? Number(formData.reminderdays) : 0,
        reminderhours: formData.reminderhours ? Number(formData.reminderhours) : 0,
        department: Number(formData.department),
        nabl: Number(formData.nabl),
        products: formData.products,
        instruments: formData.instruments,
        measurements: formData.measurements,
        results: formData.results,
        cycle: formData.cycle ? Number(formData.cycle) : 0,
        visible: Number(formData.visible),
        resultype: Number(formData.resultype),
        resultunit: Number(formData.resultunit),
        decimal: formData.decimal ? Number(formData.decimal) : 0,
        minnabl: formData.minnabl ? Number(formData.minnabl) : 0,
        maxnabl: formData.maxnabl ? Number(formData.maxnabl) : 0,
        minqai: formData.minqai ? Number(formData.minqai) : 0,
        maxqai: formData.maxqai ? Number(formData.maxqai) : 0,
        remark: formData.remark,
      };

      console.log("Update Payload:", payload);

      const res = await axios.post("/testing/update-perameter", payload);

      console.log("Update Response:", res.data);

      if (res.data?.status === true || res.data?.status === "true") {
        toast.success("Test parameter updated successfully ✅", {
          duration: 1000,
        });
        setTimeout(() => {
          navigate("/dashboards/testing/test-parameters");
        }, 1000);
      } else {
        toast.error(res.data?.message || "Failed to update test parameter ❌");
      }
    } catch (err) {
      console.error("Update Parameter Error:", err);
      toast.error(
        err?.response?.data?.message || "Something went wrong while updating parameter"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Convert dropdown data to react-select format
  const getSelectOptions = (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.map(item => ({
      value: item.id,
      label: item.name || item.label || `Item ${item.id}`
    }));
  };

  // Get selected values for react-select
  const getSelectedOptions = (selectedIds, options) => {
    if (!selectedIds || !Array.isArray(selectedIds) || !options) return [];
    
    const selectedIdsNumbers = selectedIds.map(id => parseInt(id));
    return options.filter(option => selectedIdsNumbers.includes(option.value));
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: state.isFocused 
        ? '#3b82f6' 
        : 'rgb(209 213 219)',
      boxShadow: state.isFocused ? '0 0 0 2px rgb(59 130 246 / 0.5)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      },
      backgroundColor: 'white',
      borderRadius: '0.5rem',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#dbeafe',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1e40af',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#3b82f6',
      '&:hover': {
        backgroundColor: '#3b82f6',
        color: 'white',
      },
    }),
  };

  if (fetchLoading) {
    return (
      <Page title="Edit Test Parameter">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
            </svg>
            <p className="text-gray-600 dark:text-gray-300">Loading form data...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Edit Test Parameter">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Test Parameter - ID: {id}
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboards/testing/test-parameters")}
          >
            Back to List
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Parameter Name"
                name="name"
                placeholder="Enter parameter name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Input
                label="Description/Symbol"
                name="description"
                placeholder="Enter symbol"
                value={formData.description}
                onChange={handleChange}
                required
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Temperature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Min Temperature Required (°C)"
                name="mintemp"
                type="number"
                step="0.1"
                placeholder="Min temperature"
                value={formData.mintemp}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Max Temperature Required (°C)"
                name="maxtemp"
                type="number"
                step="0.1"
                placeholder="Max temperature"
                value={formData.maxtemp}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Humidity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Min Humidity Required (%)"
                name="minhumidity"
                type="number"
                placeholder="Min humidity"
                value={formData.minhumidity}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Max Humidity Required (%)"
                name="maxhumidity"
                type="number"
                placeholder="Max humidity"
                value={formData.maxhumidity}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Time Required */}
          <div>
            <Input
              label="Time Required (days)"
              name="time"
              type="number"
              placeholder="Time required in days"
              value={formData.time}
              onChange={handleChange}
            />
          </div>

          {/* Min Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Min Duration (Days)"
                name="mindurationdays"
                type="number"
                placeholder="Minimum duration in days"
                value={formData.mindurationdays}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Min Duration (Hours)"
                name="mindurationhours"
                type="number"
                max="24"
                placeholder="Minimum duration in hours"
                value={formData.mindurationhours}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Max Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Max Duration (Days)"
                name="maxdurationdays"
                type="number"
                placeholder="Maximum duration in days"
                value={formData.maxdurationdays}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Max Duration (Hours)"
                name="maxdurationhours"
                type="number"
                max="24"
                placeholder="Maximum duration in hours"
                value={formData.maxdurationhours}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Reminder Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Reminder Duration (Days)"
                name="reminderdays"
                type="number"
                placeholder="Reminder duration in days"
                value={formData.reminderdays}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Reminder Duration (Hours)"
                name="reminderhours"
                type="number"
                max="24"
                placeholder="Reminder duration in hours"
                value={formData.reminderhours}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Select Lab */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Lab <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Lab</option>
              {dropdowns.labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          {/* Covered Under NABL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Covered Under NABL? <span className="text-red-500">*</span>
            </label>
            <select
              name="nabl"
              value={formData.nabl}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {dropdowns.choices.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.name}
                </option>
              ))}
            </select>
            {errors.nabl && <p className="text-red-500 text-sm mt-1">{errors.nabl}</p>}
          </div>

          {/* Applicable Products */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Applicable Products
            </label>
            <Select
              isMulti
              name="products"
              options={getSelectOptions(dropdowns.products)}
              value={getSelectedOptions(formData.products, getSelectOptions(dropdowns.products))}
              onChange={(selected) => handleReactSelectChange(selected, 'products')}
              styles={customSelectStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select products..."
              isClearable
              isSearchable
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.products.length} product(s)
            </p>
          </div>

          {/* Applicable Instruments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Applicable Instruments
            </label>
            <Select
              isMulti
              name="instruments"
              options={getSelectOptions(dropdowns.instruments)}
              value={getSelectedOptions(formData.instruments, getSelectOptions(dropdowns.instruments))}
              onChange={(selected) => handleReactSelectChange(selected, 'instruments')}
              styles={customSelectStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select instruments..."
              isClearable
              isSearchable
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.instruments.length} instrument(s)
            </p>
          </div>

          {/* Variables (Not used in Calculation) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Variables (Not used in Calculation)
            </label>
            <Select
              isMulti
              name="measurements"
              options={getSelectOptions(dropdowns.measurements)}
              value={getSelectedOptions(formData.measurements, getSelectOptions(dropdowns.measurements))}
              onChange={(selected) => handleReactSelectChange(selected, 'measurements')}
              styles={customSelectStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select measurements..."
              isClearable
              isSearchable
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.measurements.length} measurement(s)
            </p>
          </div>

          {/* Measurement Results */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Measurement Results
            </label>
            <Select
              isMulti
              name="results"
              options={getSelectOptions(dropdowns.results)}
              value={getSelectedOptions(formData.results, getSelectOptions(dropdowns.results))}
              onChange={(selected) => handleReactSelectChange(selected, 'results')}
              styles={customSelectStyles}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select measurement results..."
              isClearable
              isSearchable
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Selected: {formData.results.length} result(s)
            </p>
          </div>

          {/* No. of Cycles */}
          <div>
            <Input
              label="No. of Cycles"
              name="cycle"
              type="number"
              placeholder="Number of cycles"
              value={formData.cycle}
              onChange={handleChange}
            />
          </div>

          {/* Visible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visible <span className="text-red-500">*</span>
            </label>
            <select
              name="visible"
              value={formData.visible}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {dropdowns.choices.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.name}
                </option>
              ))}
            </select>
            {errors.visible && <p className="text-red-500 text-sm mt-1">{errors.visible}</p>}
          </div>

          {/* Type of Result */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type of Result <span className="text-red-500">*</span>
            </label>
            <select
              name="resultype"
              value={formData.resultype}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Result Type</option>
              {dropdowns.resultTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.resultype && (
              <p className="text-red-500 text-sm mt-1">{errors.resultype}</p>
            )}
          </div>

          {/* Unit of Result */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unit of Result <span className="text-red-500">*</span>
            </label>
            <select
              name="resultunit"
              value={formData.resultunit}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Result Unit</option>
              {dropdowns.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
            {errors.resultunit && (
              <p className="text-red-500 text-sm mt-1">{errors.resultunit}</p>
            )}
          </div>

          {/* No. of Decimal Points */}
          <div>
            <Input
              label="No. of Decimal Points"
              name="decimal"
              type="number"
              placeholder="Digits after decimal"
              value={formData.decimal}
              onChange={handleChange}
            />
          </div>

          {/* NABL Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Min NABL Range"
                name="minnabl"
                type="number"
                step="0.01"
                placeholder="Min NABL range"
                value={formData.minnabl}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Max NABL Range"
                name="maxnabl"
                type="number"
                step="0.01"
                placeholder="Max NABL range"
                value={formData.maxnabl}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* QAI Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Min QAI Range"
                name="minqai"
                type="number"
                step="0.01"
                placeholder="Min QAI range"
                value={formData.minqai}
                onChange={handleChange}
              />
            </div>

            <div>
              <Input
                label="Max QAI Range"
                name="maxqai"
                type="number"
                step="0.01"
                placeholder="Max QAI range"
                value={formData.maxqai}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remark
            </label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter remarks"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboards/testing/test-parameters")}
            >
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={submitLoading}>
              {submitLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
                    />
                  </svg>
                  Updating...
                </div>
              ) : (
                "Update Parameter"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}