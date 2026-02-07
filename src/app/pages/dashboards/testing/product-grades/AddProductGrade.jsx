import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios"; 
import { toast } from "sonner";
import Select from 'react-select';

export default function AddModes() {
  const navigate = useNavigate();

  // ✅ State for form, loading, and errors
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "",
    grades: [],
    sizes: [],
    standard: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // ✅ State for dropdown options (in react-select format)
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [standardOptions, setStandardOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // ✅ Fetch grades, sizes, and standards on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        
        // Fetch all options in parallel
        const [gradesRes, sizesRes, standardsRes] = await Promise.all([
          axios.get("/testing/get-grades"),
          axios.get("/testing/get-sizes"),
          axios.get("/testing/get-standards")
        ]);
        
        // Transform grades data for react-select
        const gradesData = gradesRes.data.data || gradesRes.data || [];
        const transformedGrades = gradesData.map(grade => ({
          value: grade.id,
          label: grade.name || grade.grade_name || `Grade ${grade.id}`
        }));
        setGradeOptions(transformedGrades);
        
        // Transform sizes data for react-select
        const sizesData = sizesRes.data.data || sizesRes.data || [];
        const transformedSizes = sizesData.map(size => ({
          value: size.id,
          label: size.name || size.size_name || `Size ${size.id}`
        }));
        setSizeOptions(transformedSizes);
        
        // Transform standards data for react-select
        const standardsData = standardsRes.data.data || standardsRes.data || [];
        const transformedStandards = standardsData.map(standard => ({
          value: standard.id,
          label: standard.name || standard.standard_name || 
                standard.code || `Standard ${standard.id}`
        }));
        setStandardOptions(transformedStandards);
        
      } catch (err) {
        console.error("Error fetching options:", err);
        toast.error("Failed to load form options");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // ✅ Input handler with error clearing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ✅ Handler for react-select multi-select (grades)
  const handleGradesChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({
      ...prev,
      grades: selectedValues
    }));
    
    if (errors.grades) {
      setErrors(prev => ({
        ...prev,
        grades: "",
      }));
    }
  };

  // ✅ Handler for react-select multi-select (sizes)
  const handleSizesChange = (selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({
      ...prev,
      sizes: selectedValues
    }));
    
    if (errors.sizes) {
      setErrors(prev => ({
        ...prev,
        sizes: "",
      }));
    }
  };

  // ✅ Handler for react-select single select (standard)
  const handleStandardChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      standard: selectedOption ? selectedOption.value : ""
    }));
    
    if (errors.standard) {
      setErrors(prev => ({
        ...prev,
        standard: "",
      }));
    }
  };

  // Custom validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "This is required field";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "This is required field";
    }
    
    if (formData.grades.length === 0) {
      newErrors.grades = "Please select at least one grade";
    }
    
    if (formData.sizes.length === 0) {
      newErrors.sizes = "Please select at least one size";
    }
    
    if (!formData.standard) {
      newErrors.standard = "Please select a standard";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        grades: formData.grades,
        sizes: formData.sizes,
        standard: formData.standard
      };

      await axios.post("/testing/add-product", payload);

      toast.success("Product created successfully ✅", {
        duration: 1000,
        icon: "✅",
      });

      navigate("/dashboards/testing/products");
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error(err?.response?.data?.message || "Failed to create product ❌");
    } finally {
      setLoading(false);
    }
  };

  // Get selected values for display in react-select
  const getSelectedGrades = () => {
    return gradeOptions.filter(option => formData.grades.includes(option.value));
  };

  const getSelectedSizes = () => {
    return sizeOptions.filter(option => formData.sizes.includes(option.value));
  };

  const getSelectedStandard = () => {
    return standardOptions.find(option => option.value === formData.standard) || null;
  };

  if (loadingOptions) {
    return (
      <Page title="Add Product">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
            </svg>
            <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
          </div>
        </div>
      </Page>
    );
  }

  

  return (
    <Page title="Add Product">
      <div className="p-6">
        {/* ✅ Header + Back Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Add Product
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboards/testing/products")}
          >
            Back to Products
          </Button>
        </div>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div>
            <Input
              label="Product Name"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Input
              label="Description"
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* ✅ Grades Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grades *
            </label>
            <Select
              isMulti
              name="grades"
              options={gradeOptions}
              value={getSelectedGrades()}
              onChange={handleGradesChange}
              placeholder="Select grades..."
            
              className="react-select-container"
              classNamePrefix="react-select"
            />
            {errors.grades && (
              <p className="text-red-500 text-sm mt-1">{errors.grades}</p>
            )}
          </div>

          {/* ✅ Sizes Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sizes *
            </label>
            <Select
              isMulti
              name="sizes"
              options={sizeOptions}
              value={getSelectedSizes()}
              onChange={handleSizesChange}
              placeholder="Select sizes..."
            
              className="react-select-container"
              classNamePrefix="react-select"
            />
            {errors.sizes && (
              <p className="text-red-500 text-sm mt-1">{errors.sizes}</p>
            )}
          </div>

          {/* ✅ Standard Single Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Standard *
            </label>
            <Select
              name="standard"
              options={standardOptions}
              value={getSelectedStandard()}
              onChange={handleStandardChange}
              placeholder="Select a standard..."
              
              className="react-select-container"
              classNamePrefix="react-select"
            />
            {errors.standard && (
              <p className="text-red-500 text-sm mt-1">{errors.standard}</p>
            )}
          </div>

          <Button 
            type="submit" 
            color="primary" 
            disabled={loading}
            className="mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
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
              "Save"
            )}
          </Button>
        </form>
      </div>
    </Page>
  );
}