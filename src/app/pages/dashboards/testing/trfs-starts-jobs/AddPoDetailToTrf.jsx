import { useState, useEffect } from "react";
import { Button, Input } from "components/ui";
import { Page } from "components/shared/Page";
import axios from "utils/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function EditBdPerson() {
  const navigate = useNavigate();

  const pathParts = window.location.pathname.split("/");
  const id = pathParts[pathParts.length - 1];

  const [trfData, setTrfData] = useState(null);
  const [ponumber, setPonumber] = useState("");
  const [wupload, setWupload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchTrfById = async () => {
      try {
        const res = await axios.get(`/testing/get-trf-byid/${id}`);
        const result = res.data;
        if (result.status === true) {
          setTrfData(result.data);
          setPonumber(result.data.ponumber || ""); // ✅ existing ponumber pre-fill
        } else {
          toast.error("Failed to fetch TRF details");
        }
      } catch (err) {
        console.error("Fetch TRF error:", err);
        toast.error("Something went wrong while fetching TRF details.");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) fetchTrfById();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ponumber) {
      toast.error("Please enter PO Number");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("ponumber", ponumber);
      if (wupload) {
        formData.append("wupload", wupload);
      }

      const res = await axios.post(`/testing/update-workorder-detail`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = res.data;

      if (result.status === true) {
        toast.success("PO Details updated successfully ✅");
        setTimeout(() => {
          navigate("/dashboards/testing/trfs-starts-jobs");
        }, 1000);
      } else {
        toast.error(result.message || "Failed to update PO Details ❌");
      }
    } catch (err) {
      console.error("Save PO error:", err);
      toast.error("Something went wrong while updating PO Details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Edit workorder detail">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Add PO Details
          </h2>
          <Button
            variant="outline"
            className="text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate(`/dashboards/testing/trfs-starts-jobs`)}
          >
            Back List
          </Button>
        </div>

        {/* Loading State */}
        {fetchLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
            </svg>
            Loading TRF details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* GET API se aaya TRF data */}
            {trfData && (
              <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">TRF ID:</span> {trfData.id}
                </p>
                <p>
                  <span className="font-medium">Customer:</span> {trfData.customername}
                </p>
                <p>
                  <span className="font-medium">Work Order No:</span>{" "}
                  {trfData.ponumber || "-"}
                </p>
              </div>
            )}

            {/* PO Number Input - pre-filled from API */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Work Order No (PO Number)
              </label>
              <Input
                type="text"
                value={ponumber}
                onChange={(e) => setPonumber(e.target.value)}
                placeholder="Enter PO Number"
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Work Order Upload
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.PNG,.gif,.GIF,.JPEG,.pdf"
                onChange={(e) => setWupload(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Allowed: jpg, jpeg, png, gif, pdf
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z" />
                  </svg>
                  Saving...
                </div>
              ) : (
                "Add Work Order Detail"
              )}
            </Button>
          </form>
        )}
      </div>
    </Page>
  );
}