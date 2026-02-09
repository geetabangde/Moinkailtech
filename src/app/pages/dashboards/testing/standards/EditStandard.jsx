import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";

export default function EditModes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [mode, setMode] = useState({ modeName: "", description: "" });

  useEffect(() => {
    const fetchModes = async () => {
      try {
        setFetchLoading(true);
        const response = await axios.get(`/testing/get-standards-byid/${id}`);
        const result = response.data;

        if (result.status === "true" && result.data) {
          setMode({
            modeName: result.data.name || "",
            description: result.data.description || "",
          });
        } else {
          toast.error(result.message || "Failed to load mode data.");
          // Optionally navigate back if data doesn't exist
          // navigate("/dashboards/testing/product-grades");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Something went wrong while loading data.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchModes();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setMode({ ...mode, [field]: value });
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!mode.modeName.trim()) {
      newErrors.modeName = "Standard name is required";
    }
    
    if (!mode.description.trim()) {
      newErrors.description = "Description is required";
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
        id: id, // 👈 IMPORTANT
        name: mode.modeName,
        description: mode.description,
      };

      const response = await axios.post(
        "/testing/update-standards",
        payload
      );

      const result = response.data;

      if (result.status === "true") {
        toast.success(result.message || "Standard updated successfully ✅", {
          duration: 1000,
        });

        setTimeout(() => {
          navigate("/dashboards/testing/standards");
        }, 1000);
      } else {
        toast.error(result.message || "Failed to update standard ❌");
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
      <Page title="Edit Standard">
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
            </svg>
            <p className="text-gray-600">Loading standard data...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Edit Standard">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Standard
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboards/testing/standards")}
          >
            Back to Standards
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Grade Name"
              value={mode.modeName}
              onChange={(e) => handleInputChange('modeName', e.target.value)}
              placeholder="Enter grade name"
            />
            {errors.modeName && (
              <p className="text-red-500 text-sm mt-1">{errors.modeName}</p>
            )}
          </div>

          <div>
            <Input
              label="Description"
              value={mode.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

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
              "Update "
            )}
          </Button>
        </form>
      </div>
    </Page>
  );
}