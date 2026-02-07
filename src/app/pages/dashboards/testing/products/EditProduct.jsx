import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({ 
    name: "", 
    description: "",
    grades: [],
    sizes: [],
    standard: ""
  });
  
  // ✅ State for dropdown options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [standardOptions, setStandardOptions] = useState([]);

  // ✅ Function to convert string to array
  const stringToArray = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // If not JSON, split by comma and convert to numbers
      return str.toString().split(',').map(item => {
        const num = parseInt(item.trim());
        return isNaN(num) ? item.trim() : num;
      }).filter(item => item !== '');
    }
    
    // If single number/string, return as array
    const num = parseInt(str);
    return isNaN(num) ? [str] : [num];
  };

  // ✅ Fetch product data and options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        
        // Fetch product data and options in parallel
        const [productRes, gradesRes, sizesRes, standardsRes] = await Promise.all([
          axios.get(`/testing/get-products-byid/${id}`),
          axios.get("/testing/get-grades"),
          axios.get("/testing/get-sizes"),
          axios.get("/testing/get-standards")
        ]);
        
        // Set options
        setGradeOptions(gradesRes.data.data || gradesRes.data || []);
        setSizeOptions(sizesRes.data.data || sizesRes.data || []);
        setStandardOptions(standardsRes.data.data || standardsRes.data || []);
        
        // Set product data with proper array conversion
        const productData = productRes.data.data;
        if (productData) {
          console.log("Product Data Received:", productData);
          
          const gradesArray = stringToArray(productData.grades);
          const sizesArray = stringToArray(productData.sizes);
          
          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            grades: gradesArray,
            sizes: sizesArray,
            standard: productData.standard?.toString() || ""
          });
        }
        
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load product data.");
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

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

  // ✅ Multi-select handler for grades
  const handleGradesChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => parseInt(option.value));
    
    setFormData(prev => ({
      ...prev,
      [name]: selectedValues
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
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

  // ✅ Update product - SIMPLIFIED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare payload exactly as shown in your Postman example
      const payload = {
        id: parseInt(id),
        name: formData.name.trim(),
        description: formData.description.trim(),
        grades: formData.grades,
        sizes: formData.sizes,
        standard: parseInt(formData.standard)
      };

      console.log("Sending payload to /testing/update-product:", payload);

      // Use POST method as shown in your API example
      const response = await axios.post("/testing/update-product", payload);

      console.log("Response received:", response.data);

      // Check for success - handle both boolean true and string "true"
      if (response.data.status === true || response.data.status === "true") {
        toast.success(response.data.message || "Product updated successfully ✅");
        
        // Wait a moment before navigating
        setTimeout(() => {
          navigate("/dashboards/testing/products");
        }, 1500);
      } else {
        // If status is false but we got a response
        toast.error(response.data.message || "Update failed");
      }
      
    } catch (err) {
      console.error("Update failed:", err);
      
      // Check if error has response data
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        console.error("Error response data:", errorData);
        
        // Check if it's actually a successful response with status: false
        if (errorData.status === false || errorData.status === "false") {
          toast.error(errorData.message || "No changes detected");
        } else {
          toast.error(errorData.message || errorData.error || "Update failed");
        }
      } else if (err.request) {
        // Request was made but no response
        console.error("No response received:", err.request);
        toast.error("No response from server. Check your connection.");
      } else {
        // Something else happened
        console.error("Error message:", err.message);
        toast.error(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Page title="Edit Product">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
            </svg>
            <p className="text-gray-600 dark:text-gray-400">Loading product data...</p>
          </div>
        </div>
      </Page>
    );
  }

  // Get selected grades display text
  const getSelectedGradesText = () => {
    if (formData.grades.length === 0) {
      return "Select grades...";
    }
    
    const selected = formData.grades.map(gradeId => {
      const grade = gradeOptions.find(g => g.id === gradeId);
      return grade ? (grade.name || grade.grade_name || `Grade ${grade.id}`) : `Grade ${gradeId}`;
    }).join(", ");
    
    // Truncate if too long
    return selected.length > 50 ? selected.substring(0, 50) + "..." : selected;
  };

  // Get selected sizes display
  const getSelectedSizesText = () => {
    if (formData.sizes.length === 0) {
      return "Select sizes...";
    }
    
    const selected = formData.sizes.map(sizeId => {
      const size = sizeOptions.find(s => s.id === sizeId);
      return size ? (size.name || size.size_name || `Size ${size.id}`) : `Size ${sizeId}`;
    }).join(", ");
    
    // Truncate if too long
    return selected.length > 50 ? selected.substring(0, 50) + "..." : selected;
  };

  return (
    <Page title="Edit Product">
      <div className="p-6">
        {/* ✅ Header + Back Button */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit Product
          </h2>
          <Button
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
            onClick={() => navigate("/dashboards/testing/products")}
          >
            ← Back to Products
          </Button>
        </div>

        {/* Debug info - Remove in production */}
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Product ID: {id} | Grades: {JSON.stringify(formData.grades)} | Sizes: {JSON.stringify(formData.sizes)} | Standard: {formData.standard}
          </p>
        </div>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* Product Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <Input
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Grades */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Grades <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer hover:border-blue-500 transition">
                <span className={formData.grades.length === 0 ? "text-gray-500 dark:text-gray-400" : ""}>
                  {getSelectedGradesText()}
                </span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <select
                name="grades"
                multiple
                value={formData.grades.map(String)}
                onChange={handleGradesChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {gradeOptions.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name || grade.grade_name || `Grade ${grade.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {gradeOptions
                .filter(grade => formData.grades.includes(grade.id))
                .map((grade) => (
                  <span 
                    key={grade.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm"
                  >
                    {grade.name || grade.grade_name || `Grade ${grade.id}`}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          grades: prev.grades.filter(id => id !== grade.id)
                        }));
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
            {errors.grades && (
              <p className="text-red-500 text-sm">{errors.grades}</p>
            )}
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sizes <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer hover:border-blue-500 transition">
                <span className={formData.sizes.length === 0 ? "text-gray-500 dark:text-gray-400" : ""}>
                  {getSelectedSizesText()}
                </span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <select
                name="sizes"
                multiple
                value={formData.sizes.map(String)}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.options)
                    .filter(option => option.selected)
                    .map(option => parseInt(option.value));
                  setFormData(prev => ({
                    ...prev,
                    sizes: selectedValues
                  }));
                  
                  if (errors.sizes) {
                    setErrors(prev => ({ ...prev, sizes: "" }));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {sizeOptions.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name || size.size_name || `Size ${size.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {sizeOptions
                .filter(size => formData.sizes.includes(size.id))
                .map((size) => (
                  <span 
                    key={size.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm"
                  >
                    {size.name || size.size_name || `Size ${size.id}`}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          sizes: prev.sizes.filter(id => id !== size.id)
                        }));
                      }}
                      className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Click the dropdown to select multiple sizes
            </p>
            {errors.sizes && (
              <p className="text-red-500 text-sm">{errors.sizes}</p>
            )}
          </div>

          {/* Standard */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Standard <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="standard"
                value={formData.standard}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-500 dark:text-gray-400">
                  Select a standard
                </option>
                {standardOptions.map((standard) => (
                  <option 
                    key={standard.id} 
                    value={standard.id}
                    className="py-2"
                  >
                    {standard.name || standard.standard_name || 
                     standard.code || `Standard ${standard.id}`}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.standard && (
              <p className="text-red-500 text-sm">{errors.standard}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              color="primary"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Updating...
                </div>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Page>
  );
}