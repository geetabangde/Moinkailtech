import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";

export default function EditMeasurement() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fetchingUnits, setFetchingUnits] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "",
  });

  const [units, setUnits] = useState([]);

  // ✅ Fetch units dropdown
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setFetchingUnits(true);
        const res = await axios.get("/master/units-list");
        
        console.log("Units API Response:", res.data);
        
        if (res.data?.status === "true" && res.data.data) {
          setUnits(res.data.data || []);
        } else {
          toast.error("Failed to load units");
        }
      } catch (err) {
        console.error("Units API Error:", err);
        toast.error("Failed to load units");
      } finally {
        setFetchingUnits(false);
      }
    };

    fetchUnits();
  }, []);

  // ✅ Fetch measurement data
  useEffect(() => {
    const fetchMeasurement = async () => {
      try {
        setFetchLoading(true);
        const response = await axios.get(`/testing/get-measurement-byid/${id}`);
        const result = response.data;

        console.log("Measurement API Response:", result);

        if (result.status === "true" && result.data) {
          setFormData({
            name: result.data.name || "",
            description: result.data.description || "",
            unit: result.data.unit || "",
          });
        } else {
          toast.error(result.message || "Failed to load measurement data.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Something went wrong while loading data.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchMeasurement();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Measurement name is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.unit) {
      newErrors.unit = "Unit is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        id: Number(id),
        name: formData.name,
        description: formData.description,
        unit: Number(formData.unit),
      };

      console.log("Update Payload:", payload);

      const response = await axios.post("/testing/update-measurement", payload);
      const result = response.data;

      console.log("Update Response:", result);

      // ✅ Handle both boolean true and string "true"
      if (result.status === true || result.status === "true") {
        toast.success(result.message || "Measurement updated successfully ✅", {
          duration: 1000,
        });

        setTimeout(() => {
          navigate("/dashboards/testing/measurements");
        }, 1000);
      } else {
        toast.error(result.message || "Failed to update measurement ❌");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        err.response?.data?.message ||
        "Something went wrong while updating."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Page title="Edit Measurement">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
            </svg>
            <p className="text-gray-600 dark:text-gray-300">Loading measurement data...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Edit Measurement">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Measurement
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboards/testing/measurements")}
          >
            Back to List
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Input
              label="Measurement Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter measurement name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Unit Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>

            {fetchingUnits ? (
              <div className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700">
                <span className="text-gray-500">Loading units...</span>
              </div>
            ) : (
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            )}

            {errors.unit && (
              <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
            )}
            
            {units.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {units.length} units available
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" color="primary" disabled={submitLoading || fetchingUnits}>
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
              "Update Measurement"
            )}
          </Button>
        </form>
      </div>
    </Page>
  );
}