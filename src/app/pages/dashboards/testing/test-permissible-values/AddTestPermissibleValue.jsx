import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button, Input, Select } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";

export default function AddTestPermissibleValue() {
  const navigate = useNavigate();

  // Main form state
  const [formData, setFormData] = useState({
    product: "",
    grade: "",
    size: "",
    standard: "",
    parameter: [],
    method: [],
    clause: [],
    pvaluemin: [],
    pvaluemax: [],
    specification: [],
    added_by: 31,
    updated_by: 31
  });

  // Dropdown data states - initialize as empty arrays
  const [products, setProducts] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [standards, setStandards] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [methods, setMethods] = useState([]);
  const [clauses, setClauses] = useState([]);
  
  // Dynamic parameter inputs
  const [parameterInputs, setParameterInputs] = useState([{ id: 1 }]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState({
    products: true,
    grades: true,
    sizes: true,
    standards: true,
    parameters: true,
    methods: true,
    clauses: true
  });

  // Error states
  const [errors, setErrors] = useState({});

  // Helper function to extract array from API response
  const extractArrayFromResponse = (responseData) => {
    console.log("Raw response data:", responseData);
    
    // First check if response has the standard {status, message, data} structure
    if (responseData && typeof responseData === 'object') {
      // Check for data property first (your API structure)
      if (responseData.data && Array.isArray(responseData.data)) {
        console.log("Extracted from .data:", responseData.data);
        return responseData.data;
      }
      
      // Check for items property
      if (Array.isArray(responseData.items)) {
        console.log("Extracted from .items:", responseData.items);
        return responseData.items;
      }
      
      // Check for results property
      if (Array.isArray(responseData.results)) {
        console.log("Extracted from .results:", responseData.results);
        return responseData.results;
      }
    }
    
    // If responseData is already an array, return it
    if (Array.isArray(responseData)) {
      console.log("Already an array:", responseData);
      return responseData;
    }
    
    // Return empty array if no valid data found
    console.warn("Could not extract array from response:", responseData);
    return [];
  };

  // Fetch all dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Debug: Log dropdown data when it changes
  useEffect(() => {
    console.log("Dropdown Data Status:", {
      products: products.length,
      grades: grades.length,
      sizes: sizes.length,
      standards: standards.length,
      parameters: parameters.length,
      methods: methods.length,
      clauses: clauses.length
    });
  }, [products, grades, sizes, standards, parameters, methods, clauses]);

  const fetchDropdownData = async () => {
    try {
      // Fetch all data in parallel
      const [
        productsRes,
        gradesRes,
        sizesRes,
        standardsRes,
        parametersRes,
        methodsRes,
        clausesRes
      ] = await Promise.allSettled([
        axios.get("/testing/get-prodcut-list"),
        axios.get("/testing/get-grades"),
        axios.get("/testing/get-sizes"),
        axios.get("/testing/get-standards"),
        axios.get("/testing/get-perameter-list"),
        axios.get("/testing/get-methods"),
        axios.get("/testing/get-clauses")
      ]);

      // Process each response with error handling
      const processResponse = (response, setter, name) => {
        setDropdownLoading(prev => ({ ...prev, [name.toLowerCase()]: true }));
        
        if (response.status === 'fulfilled') {
          console.log(`${name} raw response:`, response.value);
          console.log(`${name} response data:`, response.value.data);
          
          const data = extractArrayFromResponse(response.value.data);
          console.log(`${name} extracted data (${data.length} items):`, data);
          
          // Only set data if it's a valid array with items
          if (Array.isArray(data) && data.length > 0) {
            setter(data);
            console.log(`${name} set successfully with ${data.length} items`);
          } else {
            console.warn(`${name} has no valid data`);
            setter([]);
          }
        } else {
          console.error(`${name} API Error:`, response.reason);
          setter([]);
        }
        
        setDropdownLoading(prev => ({ ...prev, [name.toLowerCase()]: false }));
      };

      processResponse(productsRes, setProducts, 'Products');
      processResponse(gradesRes, setGrades, 'Grades');
      processResponse(sizesRes, setSizes, 'Sizes');
      processResponse(standardsRes, setStandards, 'Standards');
      processResponse(parametersRes, setParameters, 'Parameters');
      processResponse(methodsRes, setMethods, 'Methods');
      processResponse(clausesRes, setClauses, 'Clauses');

    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load form data");
      
      // Reset all to empty arrays on error
      setProducts([]);
      setGrades([]);
      setSizes([]);
      setStandards([]);
      setParameters([]);
      setMethods([]);
      setClauses([]);
      
      // Set all loading states to false
      setDropdownLoading({
        products: false,
        grades: false,
        sizes: false,
        standards: false,
        parameters: false,
        methods: false,
        clauses: false
      });
    }
  };

  // Safe options generation function
  const generateOptions = (dataArray, fieldName = 'unknown') => {
    console.log(`Generating options for ${fieldName}:`, dataArray);
    
    if (!Array.isArray(dataArray)) {
      console.error(`${fieldName} data is not an array:`, dataArray);
      return [];
    }
    
    if (dataArray.length === 0) {
      console.warn(`${fieldName} array is empty`);
      return [];
    }
    
    // Filter only active items (status = 1) and create options
    const options = dataArray
      .filter(item => {
        // Check if item has status field and it's 1
        const isActive = item.status === 1 || item.status === '1';
        if (!isActive) {
          console.log(`Filtering out inactive item:`, item);
        }
        return isActive;
      })
      .map(item => {
        // Handle different response structures
        const value = item.id || item.value || item.ID || item.Id;
        const label = item.name || item.label || item.Name || item.text || String(value);
        
        return { 
          value: String(value), // Convert to string for consistency
          label: String(label).trim() // Trim whitespace
        };
      })
      .filter(option => {
        // Filter out invalid options
        const isValid = option.value && 
                       option.label && 
                       option.value !== 'undefined' && 
                       option.label !== 'undefined';
        if (!isValid) {
          console.warn(`Filtering out invalid option:`, option);
        }
        return isValid;
      });
    
    console.log(`Generated ${options.length} options for ${fieldName}:`, options.slice(0, 5)); // Log first 5
    return options;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Field changed: ${name} = ${value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle array field changes (parameters, methods, clauses)
  const handleArrayChange = (index, field, value) => {
    console.log(`Array field changed: ${field}[${index}] = ${value}`);
    
    setFormData(prev => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      
      return {
        ...prev,
        [field]: updatedArray
      };
    });
  };

  // Handle min/max value changes
  const handleParameterValueChange = (index, type, value) => {
    const field = type === 'min' ? 'pvaluemin' : 'pvaluemax';
    
    setFormData(prev => {
      const updatedArray = [...prev[field]];
      updatedArray[index] = value;
      
      return {
        ...prev,
        [field]: updatedArray
      };
    });
  };

  // Handle specification changes
  const handleSpecificationChange = (index, value) => {
    setFormData(prev => {
      const updatedArray = [...prev.specification];
      updatedArray[index] = value;
      
      return {
        ...prev,
        specification: updatedArray
      };
    });
  };

  // Add new parameter row
  const addParameterRow = () => {
    const newId = parameterInputs.length + 1;
    setParameterInputs(prev => [...prev, { id: newId }]);
    
    // Initialize arrays with empty values for new row
    setFormData(prev => ({
      ...prev,
      parameter: [...prev.parameter, ""],
      method: [...prev.method, ""],
      clause: [...prev.clause, ""],
      pvaluemin: [...prev.pvaluemin, ""],
      pvaluemax: [...prev.pvaluemax, ""],
      specification: [...prev.specification, ""]
    }));
  };

  // Remove parameter row
  const removeParameterRow = (index) => {
    if (parameterInputs.length === 1) {
      toast.error("At least one parameter is required");
      return;
    }

    setParameterInputs(prev => prev.filter((_, i) => i !== index));
    
    // Remove corresponding data from all arrays
    setFormData(prev => {
      const newFormData = { ...prev };
      ['parameter', 'method', 'clause', 'pvaluemin', 'pvaluemax', 'specification'].forEach(key => {
        newFormData[key] = newFormData[key].filter((_, i) => i !== index);
      });
      return newFormData;
    });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required single fields
    const requiredFields = ['product', 'grade', 'size', 'standard'];
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    // Validate parameter arrays
    formData.parameter.forEach((param, index) => {
      if (!param) {
        newErrors[`parameter_${index}`] = "Parameter is required";
      }
    });

    formData.method.forEach((method, index) => {
      if (!method) {
        newErrors[`method_${index}`] = "Method is required";
      }
    });

    // Validate min/max values
    formData.pvaluemin.forEach((min, index) => {
      const max = formData.pvaluemax[index];
      if (min && max && parseFloat(min) > parseFloat(max)) {
        newErrors[`value_${index}`] = "Min value cannot be greater than max value";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    setLoading(true);

    try {
      // Prepare data as FormData (similar to PHP's $_POST)
      const formDataToSend = new FormData();
      
      // Append all fields
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          // For arrays, append each value with same key (PHP will receive as array)
          formData[key].forEach(value => {
            formDataToSend.append(`${key}[]`, value);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post("/testing/add-permissible-value", formDataToSend);

      toast.success("Test Permissible Value created successfully ✅", {
        duration: 2000,
      });

      // Navigate back after success
      setTimeout(() => {
        navigate("/dashboards/testing/test-permissible-values");
      }, 1500);

    } catch (err) {
      console.error("Error creating permissible value:", err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          "Failed to create test permissible value";
      toast.error(errorMessage + " ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Add Test Permissible Value">
      <div className="p-6">
        {/* Header + Back Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Add Test Permissible Value
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboards/testing/test-permissible-values")}
          >
            ← Back to List
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product */}
            <div>
              <Select
                label="Product"
                name="product"
                value={formData.product}
                onChange={handleChange}
                options={generateOptions(products, 'products')}
                placeholder={dropdownLoading.products ? "Loading..." : "Select Product"}
                disabled={dropdownLoading.products}
                required
              />
              {errors.product && (
                <p className="text-red-500 text-sm mt-1">{errors.product}</p>
              )}
              {!dropdownLoading.products && products.length === 0 && (
                <p className="text-yellow-500 text-sm mt-1">No products available</p>
              )}
              {!dropdownLoading.products && products.length > 0 && (
                <p className="text-green-500 text-sm mt-1">{products.length} products loaded</p>
              )}
            </div>

            {/* Grade */}
            <div>
              <Select
                label="Grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                options={generateOptions(grades, 'grades')}
                placeholder={dropdownLoading.grades ? "Loading..." : "Select Grade"}
                disabled={dropdownLoading.grades}
                required
              />
              {errors.grade && (
                <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
              )}
              {!dropdownLoading.grades && grades.length === 0 && (
                <p className="text-yellow-500 text-sm mt-1">No grades available</p>
              )}
              {!dropdownLoading.grades && grades.length > 0 && (
                <p className="text-green-500 text-sm mt-1">{grades.length} grades loaded</p>
              )}
            </div>

            {/* Size */}
            <div>
              <Select
                label="Size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                options={generateOptions(sizes, 'sizes')}
                placeholder={dropdownLoading.sizes ? "Loading..." : "Select Size"}
                disabled={dropdownLoading.sizes}
                required
              />
              {errors.size && (
                <p className="text-red-500 text-sm mt-1">{errors.size}</p>
              )}
              {!dropdownLoading.sizes && sizes.length === 0 && (
                <p className="text-yellow-500 text-sm mt-1">No sizes available</p>
              )}
              {!dropdownLoading.sizes && sizes.length > 0 && (
                <p className="text-green-500 text-sm mt-1">{sizes.length} sizes loaded</p>
              )}
            </div>

            {/* Standard */}
            <div>
              <Select
                label="Standard"
                name="standard"
                value={formData.standard}
                onChange={handleChange}
                options={generateOptions(standards, 'standards')}
                placeholder={dropdownLoading.standards ? "Loading..." : "Select Standard"}
                disabled={dropdownLoading.standards}
                required
              />
              {errors.standard && (
                <p className="text-red-500 text-sm mt-1">{errors.standard}</p>
              )}
              {!dropdownLoading.standards && standards.length === 0 && (
                <p className="text-yellow-500 text-sm mt-1">No standards available</p>
              )}
              {!dropdownLoading.standards && standards.length > 0 && (
                <p className="text-green-500 text-sm mt-1">{standards.length} standards loaded</p>
              )}
            </div>
          </div>

          {/* Parameters Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Parameters
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParameterRow}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                + Add Parameter
              </Button>
            </div>

            {parameterInputs.map((row, index) => (
              <div key={row.id} className="border p-4 rounded-lg mb-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Parameter #{index + 1}
                  </span>
                  {parameterInputs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParameterRow(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Parameter */}
                  <div>
                    <Select
                      label="Parameter"
                      value={formData.parameter[index] || ""}
                      onChange={(e) => handleArrayChange(index, 'parameter', e.target.value)}
                      options={generateOptions(parameters, 'parameters')}
                      placeholder={dropdownLoading.parameters ? "Loading..." : "Select Parameter"}
                      disabled={dropdownLoading.parameters}
                    />
                    {errors[`parameter_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`parameter_${index}`]}</p>
                    )}
                  </div>

                  {/* Method */}
                  <div>
                    <Select
                      label="Method"
                      value={formData.method[index] || ""}
                      onChange={(e) => handleArrayChange(index, 'method', e.target.value)}
                      options={generateOptions(methods, 'methods')}
                      placeholder={dropdownLoading.methods ? "Loading..." : "Select Method"}
                      disabled={dropdownLoading.methods}
                    />
                    {errors[`method_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`method_${index}`]}</p>
                    )}
                  </div>

                  {/* Clause */}
                  <div>
                    <Select
                      label="Clause"
                      value={formData.clause[index] || ""}
                      onChange={(e) => handleArrayChange(index, 'clause', e.target.value)}
                      options={generateOptions(clauses, 'clauses')}
                      placeholder={dropdownLoading.clauses ? "Loading..." : "Select Clause"}
                      disabled={dropdownLoading.clauses}
                    />
                  </div>

                  {/* Min Value */}
                  <div>
                    <Input
                      label="Min Value"
                      type="number"
                      step="0.01"
                      value={formData.pvaluemin[index] || ""}
                      onChange={(e) => handleParameterValueChange(index, 'min', e.target.value)}
                      placeholder="Enter minimum value"
                    />
                  </div>

                  {/* Max Value */}
                  <div>
                    <Input
                      label="Max Value"
                      type="number"
                      step="0.01"
                      value={formData.pvaluemax[index] || ""}
                      onChange={(e) => handleParameterValueChange(index, 'max', e.target.value)}
                      placeholder="Enter maximum value"
                    />
                  </div>

                  {/* Specification */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <Input
                      label="Specification"
                      value={formData.specification[index] || ""}
                      onChange={(e) => handleSpecificationChange(index, e.target.value)}
                      placeholder="Enter specification details"
                    />
                  </div>
                </div>

                {errors[`value_${index}`] && (
                  <p className="text-red-500 text-sm mt-2">{errors[`value_${index}`]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboards/testing/test-permissible-values")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              color="primary" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Saving...
                </div>
              ) : (
                "Save Permissible Value"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}