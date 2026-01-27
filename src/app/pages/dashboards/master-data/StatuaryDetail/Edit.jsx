import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";

export default function EditStatuaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [statuaryDetail, setStatuaryDetail] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchStatuaryDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/master/get-statuary-detail-byid/${id}`);
        const result = response.data;

        if (result.status === "true" && result.data && result.data.length > 0) {
          // Data is an array, get first element
          const detail = result.data[0];
          setStatuaryDetail({
            name: detail.name || "",
            description: detail.description || "",
          });
        } else {
          toast.error(result.message || "Failed to load statuary detail data.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Something went wrong while loading statuary detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatuaryDetail();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStatuaryDetail((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
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
    
    if (!statuaryDetail.name.trim()) {
      newErrors.name = "This is required field";
    }
    
    if (!statuaryDetail.description.trim()) {
      newErrors.description = "This is required field";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const form = new FormData();
      form.append("name", statuaryDetail.name);
      form.append("description", statuaryDetail.description);

      const response = await axios.post(`/master/update-statuary-detail/${id}`, form);
      const result = response.data;

      console.log("Update response:", result);
      console.log("Status value:", result.status);
      console.log("Status type:", typeof result.status);

      if (result.status === "true" || result.status === true) {
        toast.success("Statuary Detail updated successfully ✅", {
          duration: 1000,
          icon: "✅",
        });
        
        // Force navigation using setTimeout
        setTimeout(() => {
          window.location.href = "/dashboards/master-data/statuary-detail";
        }, 1200);
      } else {
        toast.error(result.message || "Failed to update statuary detail ❌");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Something went wrong while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Edit Statuary Detail">
      <div className="p-6">
        {/* Header + Back Button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Edit Statuary Detail
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/dashboards/master-data/statuary-detail")}
          >
            Back to List
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Statuary Detail Name"
              name="name"
              value={statuaryDetail.name}
              onChange={handleChange}
              // removed required attribute
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Input
              label="Description"
              name="description"
              value={statuaryDetail.description}
              onChange={handleChange}
              // removed required attribute
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <Button type="submit" color="primary" disabled={loading}>
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