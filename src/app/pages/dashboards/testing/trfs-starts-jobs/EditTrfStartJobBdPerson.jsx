import { useEffect, useState } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function EditBdPerson() {
  const navigate = useNavigate();

  // Get ID from URL path
  const pathParts = window.location.pathname.split("/");
  const id = pathParts[pathParts.length - 1];

  const [bdList, setBdList] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedBd, setSelectedBd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBdList = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/testing/get-trf-bd/${id}`);
        const result = res.data;
        console.log("API response:", result);

        // status is boolean true
        if (result.status === true && result.data) {
          // BD dropdown list lives in result.data.list
          setBdList(result.data.list || []);

          // Customer name lives in result.data.customer
          if (result.data.customer && result.data.customer.length > 0) {
            setCustomerName(result.data.customer[0].name || "");
          } else {
            setCustomerName("");
          }

          // Currently selected BD lives in result.data.trf.bd
          const currentBd = result.data.trf?.bd;
          if (currentBd !== null && currentBd !== "" && typeof currentBd !== "undefined") {
            setSelectedBd(currentBd.toString());
          } else {
            setSelectedBd("");
          }

        } else {
          toast.error(result.message || "Failed to load BD Person list.");
        }
      } catch (err) {
        console.error("Fetch BD error:", err);
        toast.error("Something went wrong while loading BD Person list.");
      } finally {
        setLoading(false);
      }
    };

    fetchBdList();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBd) {
      toast.error("Please select a BD Person");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id: Number(id),
        bd: Number(selectedBd),
      };

      console.log("Sending JSON:", payload);

      const res = await axios.post(`/testing/trf-bd-link`, payload);
      const result = res.data;

      if (result.status === true) {
        toast.success("BD person updated successfully ✅");
        setTimeout(() => {
          navigate("/dashboards/testing/trfs-starts-jobs");
        }, 1000);
      } else {
        toast.error(result.message || "Failed to update BD Person ❌");
      }
    } catch (err) {
      console.error("Save BD error:", err);
      toast.error("Something went wrong while updating BD Person.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Edit BD Person">
      <div className="p-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Link BD Person
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs`)}
          >
            Back List
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <Input value={customerName} readOnly />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Select BD Person
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:border-blue-500"
              value={selectedBd}
              onChange={(e) => setSelectedBd(e.target.value)}
              required
            >
              <option value="">Select BD Person</option>
              {bdList.map((bd) => (
                <option key={bd.id} value={bd.id}>
                  {bd.firstname} {bd.middlename} {bd.lastname}
                </option>
              ))}
            </select>
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
                Linking...
              </div>
            ) : (
              "Link trf"
            )}
          </Button>
        </form>
      </div>
    </Page>
  );
}