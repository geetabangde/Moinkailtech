import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "utils/axios";
import { toast } from "sonner";

const EditVisualTest = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 👈 ID from URL

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVisualTest = async () => {
      try {
        const res = await axios.get(
          `/calibrationoperations/get-visualtest-byid/${id}`,
        );

        console.log("GET RESPONSE 👉", res.data);

        if (res.data?.status) {
          const record = Array.isArray(res.data.data)
            ? res.data.data[0]
            : res.data.data;

          setDescription(record?.description || "");
        } else {
          toast.error("Failed to load visual test");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching data");
      }
    };

    if (id) fetchVisualTest();
  }, [id]);

  // ✅ UPDATE API
  const handleSave = async () => {
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `/calibrationoperations/update-visualtest/${id}`,
        { description },
      );

      console.log("UPDATE RESPONSE 👉", res.data);

      if (res.data?.status === true) {
        toast.success(res.data.message || "Updated successfully ✅");

        setTimeout(() => {
          navigate(
            "/dashboards/calibration-operations/bio-medical-visual-test",
          );
        }, 1000);
      } else {
        toast.error(res.data?.message || "Update failed ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="mb-6 text-3xl font-normal text-gray-800">
        Edit Visual Test
      </h1>

      <button
        onClick={() =>
          navigate("/dashboards/calibration-operations/bio-medical-visual-test")
        }
        className="mb-8 rounded bg-cyan-500 px-6 py-2.5 text-sm text-white hover:bg-cyan-600"
      >
        Back To List
      </button>

      <div className="mb-8 flex items-start">
        <label className="w-40 pt-3 font-medium text-gray-800">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border px-4 py-3 focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="rounded bg-blue-500 px-6 py-2.5 text-white hover:bg-blue-600 disabled:opacity-60"
      >
        {loading ? "Updating..." : "Save changes"}
      </button>
    </div>
  );
};

export default EditVisualTest;
