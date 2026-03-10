import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import Select from "react-select";

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
    standard: null,
  });

  // State for dropdown options (react-select format)
  const [gradeOptions, setGradeOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [standardOptions, setStandardOptions] = useState([]);

  // Function to convert string to array
  const stringToArray = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return str
        .toString()
        .split(",")
        .map((item) => {
          const num = parseInt(item.trim());
          return isNaN(num) ? item.trim() : num;
        })
        .filter((item) => item !== "");
    }
    const num = parseInt(str);
    return isNaN(num) ? [str] : [num];
  };

  // Fetch product data and options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);

        const [productRes, gradesRes, sizesRes, standardsRes] =
          await Promise.all([
            axios.get(`/testing/get-products-byid/${id}`),
            axios.get("/testing/get-grades"),
            axios.get("/testing/get-sizes"),
            axios.get("/testing/get-standards"),
          ]);

        // Transform to react-select format
        const gradesData = gradesRes.data.data || gradesRes.data || [];
        const transformedGrades = gradesData.map((grade) => ({
          value: grade.id,
          label: grade.name || grade.grade_name || `Grade ${grade.id}`,
        }));
        setGradeOptions(transformedGrades);

        const sizesData = sizesRes.data.data || sizesRes.data || [];
        const transformedSizes = sizesData.map((size) => ({
          value: size.id,
          label: size.name || size.size_name || `Size ${size.id}`,
        }));
        setSizeOptions(transformedSizes);

        const standardsData = standardsRes.data.data || standardsRes.data || [];
        const transformedStandards = standardsData.map((standard) => ({
          value: standard.id,
          label:
            standard.name ||
            standard.standard_name ||
            standard.code ||
            `Standard ${standard.id}`,
        }));
        setStandardOptions(transformedStandards);

        // Set product form data
        const productData = productRes.data.data;
        if (productData) {
          const gradesArray = stringToArray(productData.grades);
          const sizesArray = stringToArray(productData.sizes);

          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            grades: gradesArray,
            sizes: sizesArray,
            standard: productData.standard
              ? parseInt(productData.standard)
              : null,
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load product data.");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // react-select handlers
  const handleGradesChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((o) => o.value)
      : [];
    setFormData((prev) => ({ ...prev, grades: selectedValues }));
    if (errors.grades) setErrors((prev) => ({ ...prev, grades: "" }));
  };

  const handleSizesChange = (selectedOptions) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((o) => o.value)
      : [];
    setFormData((prev) => ({ ...prev, sizes: selectedValues }));
    if (errors.sizes) setErrors((prev) => ({ ...prev, sizes: "" }));
  };

  const handleStandardChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      standard: selectedOption ? selectedOption.value : null,
    }));
    if (errors.standard) setErrors((prev) => ({ ...prev, standard: "" }));
  };

  // Get selected values for react-select display
  const getSelectedGrades = () =>
    gradeOptions.filter((o) => formData.grades.includes(o.value));
  const getSelectedSizes = () =>
    sizeOptions.filter((o) => formData.sizes.includes(o.value));
  const getSelectedStandard = () =>
    standardOptions.find((o) => o.value === formData.standard) || null;

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "This is required field";
    if (!formData.description.trim())
      newErrors.description = "This is required field";
    if (formData.grades.length === 0)
      newErrors.grades = "Please select at least one grade";
    if (formData.sizes.length === 0)
      newErrors.sizes = "Please select at least one size";
    if (!formData.standard) newErrors.standard = "Please select a standard";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        id: parseInt(id),
        name: formData.name.trim(),
        description: formData.description.trim(),
        grades: formData.grades,
        sizes: formData.sizes,
        standard: parseInt(formData.standard),
      };

      const response = await axios.post("/testing/update-product", payload);

      if (response.data.status === true || response.data.status === "true") {
        toast.success(
          response.data.message || "Product updated successfully ✅",
        );
        setTimeout(() => navigate("/dashboards/testing/products"), 1500);
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (err) {
      console.error("Update failed:", err);
      if (err.response?.data) {
        toast.error(
          err.response.data.message ||
            err.response.data.error ||
            "Update failed",
        );
      } else if (err.request) {
        toast.error("No response from server. Check your connection.");
      } else {
        toast.error(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Page title="Edit Product">
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <svg
              className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600"
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
            <p className="text-gray-600 dark:text-gray-400">
              Loading product data...
            </p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Edit Product">
      <div className="p-6">
        {/* Header + Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Edit Product
          </h2>
          <Button
            variant="outline"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => navigate("/dashboards/testing/products")}
          >
            Back to Products
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Product Name */}
          <div>
            <Input
              label="Product Name"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              className="dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Input
              label="Description"
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              className="dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Grades Multi-Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <p className="mt-1 text-sm text-red-500">{errors.grades}</p>
            )}
          </div>

          {/* Sizes Multi-Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <p className="mt-1 text-sm text-red-500">{errors.sizes}</p>
            )}
          </div>

          {/* Standard Single Select */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              <p className="mt-1 text-sm text-red-500">{errors.standard}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            color="primary"
            disabled={loading}
            className="mt-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white"
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
        </form>
      </div>
    </Page>
  );
}
