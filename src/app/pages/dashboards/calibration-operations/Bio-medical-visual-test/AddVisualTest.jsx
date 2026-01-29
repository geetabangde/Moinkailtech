import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "utils/axios";
import { toast } from "react-hot-toast";

const AddVisualTest = () => {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ SAVE API
  const handleSave = async () => {
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "/calibrationoperations/add-visualtest",
        {
          description: description,
        },
      );

      console.log("API Response:", response.data);

      if (response.data?.status) {
        toast.success("Visual Test added successfully");

        // redirect after small delay
        setTimeout(() => {
          navigate(
            "/dashboards/calibration-operations/bio-medical-visual-test",
          );
        }, 1000);
      } else {
        toast.error("Failed to add visual test");
      }
    } catch (error) {
      console.error("API Error:", error);

      let message = "Something went wrong while saving";

      if (error.response) {
        message =
          error.response.data?.message ||
          `Server Error (${error.response.status})`;
      } else if (error.request) {
        message = "No response from server";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualTestList = () => {
    navigate("/dashboards/calibration-operations/bio-medical-visual-test");
  };

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <h1 className="mb-6 text-3xl font-normal text-gray-800">
        Add Visual Test
      </h1>

      {/* Visual Test List Button */}
      <button
        onClick={handleVisualTestList}
        className="mb-8 rounded bg-cyan-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
      >
        Visual Test List
      </button>

      {/* Description Field */}
      <div className="mb-8 flex items-start">
        <label className="w-40 pt-3 font-medium text-gray-800">
          Description
        </label>

        <div className="flex-1">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Parameter Description"
            className="w-full rounded border border-gray-300 px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="rounded bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
};

export default AddVisualTest;
