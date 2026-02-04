import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "utils/axios";
import { Button } from "components/ui";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ConfirmModal } from "components/shared/ConfirmModal";

const confirmMessages = {
  pending: {
    description:
      "Are you sure you want to delete this calibration point? Once deleted, it cannot be restored.",
  },
  success: {
    title: "Calibration Point Deleted",
  },
};

export default function ViewCalibPoints() {
  const { priceId, matrixId } = useParams();
  const navigate = useNavigate();
  
  const [calibPointsData, setCalibPointsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  
  // Search states - Updated to match all 8 columns
  const [searchFilters, setSearchFilters] = useState({
    id: "",
    parameter: "",
    setpoint: "",
    uuc: "",
    master: "",
    error: "",
    specification: "",
    remark: "",
  });

  // Global search
  const [globalSearch, setGlobalSearch] = useState("");

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [selectedCalibPointId, setSelectedCalibPointId] = useState(null);

  const fetchCalibPointsData = useCallback(async () => {
    console.log("=== Fetching calib points ===");
    console.log("priceId:", priceId, "matrixId:", matrixId);
    
    if (!priceId || !matrixId) return;
    
    setLoading(true);
    try {
      const url = `/calibrationoperations/get-calibpoint-byid_withmatrixid/${priceId}/${matrixId}`;
      console.log("Fetching from:", url);
      
      const response = await axios.get(url);
      console.log("Response:", response.data);
      
      if (response.data.status) {
        const data = response.data.data || [];
        console.log("Data count:", data.length);
        setCalibPointsData(data);
        setFilteredData(data);
      } else {
        toast.error("Failed to fetch calibration points data");
        setCalibPointsData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching calibration points data:", error);
      toast.error("Error loading calibration points data");
      setCalibPointsData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, [priceId, matrixId]);

  const filterData = useCallback(() => {
    let filtered = [...calibPointsData];

    // Apply column filters
    Object.keys(searchFilters).forEach((key) => {
      const searchValue = searchFilters[key].toLowerCase().trim();
      if (searchValue) {
        filtered = filtered.filter((item) => {
          const itemValue = String(item[key] || "").toLowerCase();
          return itemValue.includes(searchValue);
        });
      }
    });

    // Apply global search
    if (globalSearch.trim()) {
      const search = globalSearch.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        return (
          String(item.id || "").toLowerCase().includes(search) ||
          String(item.parameter || "").toLowerCase().includes(search) ||
          String(item.setpoint || "").toLowerCase().includes(search) ||
          String(item.uuc || "").toLowerCase().includes(search) ||
          String(item.master || "").toLowerCase().includes(search) ||
          String(item.error || "").toLowerCase().includes(search) ||
          String(item.specification || "").toLowerCase().includes(search) ||
          String(item.remark || "").toLowerCase().includes(search)
        );
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [calibPointsData, searchFilters, globalSearch]);

  useEffect(() => {
    fetchCalibPointsData();
  }, [fetchCalibPointsData]);

  useEffect(() => {
    filterData();
  }, [filterData]);

  const handleSearchChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const openDeleteModal = (calibPointId) => {
    console.log("🗑️ Opening delete modal for calibPointId:", calibPointId);
    setSelectedCalibPointId(calibPointId);
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const closeDeleteModal = () => {
    console.log("✖️ Closing delete modal");
    setDeleteModalOpen(false);
    setSelectedCalibPointId(null);
  };

  const handleDelete = async () => {
    if (!selectedCalibPointId) {
      console.error("❌ No calibPointId selected!");
      toast.error("No calibration point selected");
      return;
    }

    console.log("🗑️ Attempting to delete calibration point:");
    console.log("  - Selected Calib Point ID:", selectedCalibPointId);
    console.log("  - Delete URL:", `/calibrationoperations/delete-matrix-calibpoint/${selectedCalibPointId}`);

    setConfirmDeleteLoading(true);
    try {
      const response = await axios.delete(
        `/calibrationoperations/delete-Calibration-point/${selectedCalibPointId}`
      );
      
      console.log("✅ Delete response:", response.data);
      
      if (response.data.status) {
        setDeleteSuccess(true);
        toast.success("Calibration point deleted successfully ✅", {
          duration: 1000,
          icon: "🗑️",
        });
        
        // Remove from local state
        setCalibPointsData((prev) => prev.filter((item) => item.id !== selectedCalibPointId));
        
        setTimeout(() => {
          closeDeleteModal();
          fetchCalibPointsData(); 
        }, 1000);
      } else {
        throw new Error(response.data.message || "Delete failed");
      }
    } catch (error) {
      console.error("❌ Delete failed:", error);
      console.error("  - Error response:", error.response?.data);
      console.error("  - Error status:", error.response?.status);
      
      setDeleteError(true);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          "Failed to delete calibration point";
      
      toast.error(`Delete failed: ${errorMessage} ❌`, {
        duration: 3000,
      });
    } finally {
      setConfirmDeleteLoading(false);
    }
  };

  const deleteState = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  // Pagination calculations
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentEntries = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-100">
              Calibration Points
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-300">
              Price ID: {priceId} | Matrix ID: {matrixId}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            onClick={() =>
              navigate(`/dashboards/calibration-operations/instrument-list/view-matrix/${priceId}/${matrixId}`)
            }
          >
            Back to List
          </Button>
         
          <button
            onClick={() => navigate(`/dashboards/calibration-operations/instrument-list/add-calib-point/${priceId}/${matrixId}`)}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            + Add Calib Point
          </button>
        </div>
      </div>

      {/* Stats and Search Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-dark-300">
          Showing {totalEntries > 0 ? startIndex + 1 : 0} to {endIndex} of {totalEntries} entries
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-dark-300">Search:</span>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search..."
            className="w-64 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-300 bg-white shadow-sm dark:border-dark-500 dark:bg-dark-750">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex items-center gap-2">
              <svg
                className="h-6 w-6 animate-spin text-blue-600"
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
              <span className="text-gray-600 dark:text-dark-300">
                Loading calibration points...
              </span>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300 dark:divide-dark-500">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:border-dark-500 dark:text-dark-200">
                  ID ▼
                </th>
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:border-dark-500 dark:text-dark-200">
                  Parameter ^
                </th>
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:border-dark-500 dark:text-dark-200">
                  Setpoint ^
                </th>
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:border-dark-500 dark:text-dark-200">
                  UUC ^
                </th>
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:border-dark-500 dark:text-dark-200">
                  Master ^
                </th>
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:border-dark-500 dark:text-dark-200">
                  Error ^
                </th>
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:border-dark-500 dark:text-dark-200">
                  Specification ^
                </th>
                <th className="border-r border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-700 dark:border-dark-500 dark:text-dark-200">
                  Remark ^
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-dark-200">
                  Actions ^
                </th>
              </tr>
              {/* Search Row */}
              <tr className="bg-white dark:bg-dark-750">
                <td className="border-r border-gray-300 px-2 py-2 dark:border-dark-500">
                  <input
                    type="text"
                    placeholder="Search ID"
                    value={searchFilters.id}
                    onChange={(e) => handleSearchChange("id", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
                <td className="border-r border-gray-300 px-2 py-2 dark:border-dark-500">
                  <input
                    type="text"
                    placeholder="Search Param"
                    value={searchFilters.parameter}
                    onChange={(e) => handleSearchChange("parameter", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
                <td className="border-r border-gray-300 px-2 py-2 dark:border-dark-500">
                  <input
                    type="text"
                    placeholder="Search Setpoi"
                    value={searchFilters.setpoint}
                    onChange={(e) => handleSearchChange("setpoint", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
                <td className="border-r border-gray-300 px-2 py-2 dark:border-dark-500">
                  <input
                    type="text"
                    placeholder="Search UUC"
                    value={searchFilters.uuc}
                    onChange={(e) => handleSearchChange("uuc", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
                <td className="border-r border-gray-300 px-2 py-2 dark:border-dark-500">
                  <input
                    type="text"
                    placeholder="Search Master"
                    value={searchFilters.master}
                    onChange={(e) => handleSearchChange("master", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
                <td className="border-r border-gray-300 px-2 py-2 dark:border-dark-500">
                  <input
                    type="text"
                    placeholder="Search Error"
                    value={searchFilters.error}
                    onChange={(e) => handleSearchChange("error", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
                <td className="border-r border-gray-300 px-2 py-2 dark:border-dark-500">
                  <input
                    type="text"
                    placeholder="Search Specif"
                    value={searchFilters.specification}
                    onChange={(e) => handleSearchChange("specification", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
                <td className="border-r border-gray-300 px-2 py-2 dark:border-dark-500">
                  <input
                    type="text"
                    placeholder="Search Remar"
                    value={searchFilters.remark}
                    onChange={(e) => handleSearchChange("remark", e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="Search Action"
                    disabled
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm opacity-50 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
                  />
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 bg-white dark:divide-dark-500 dark:bg-dark-750">
              {currentEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-dark-400"
                  >
                    No calibration points available
                  </td>
                </tr>
              ) : (
                currentEntries.map((calibPoint) => (
                  <tr
                    key={calibPoint.id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-700"
                  >
                    <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900 dark:border-dark-500 dark:text-dark-100">
                      {calibPoint.id}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900 dark:border-dark-500 dark:text-dark-100">
                      {calibPoint.parameter || "N/A"}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900 dark:border-dark-500 dark:text-dark-100">
                      {calibPoint.setpoint || "N/A"}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900 dark:border-dark-500 dark:text-dark-100">
                      {calibPoint.uuc || "N/A"}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900 dark:border-dark-500 dark:text-dark-100">
                      {calibPoint.master || "N/A"}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900 dark:border-dark-500 dark:text-dark-100">
                      {calibPoint.error || "N/A"}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-600 dark:border-dark-500 dark:text-dark-300">
                      {calibPoint.specification || "N/A"}
                    </td>
                    <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-600 dark:border-dark-500 dark:text-dark-300">
                      {calibPoint.remark || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/dashboards/calibration-operations/instrument-list/edit-calib-point/${priceId}/${matrixId}/${calibPoint.id}`)}
                          className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(calibPoint.id)}
                          className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 flex items-center justify-between">
        {/* Show entries selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-dark-300">Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none dark:border-dark-500 dark:bg-dark-700 dark:text-dark-100"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-dark-300">entries</span>
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700"
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700"
          >
            Previous
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`rounded border px-3 py-1 text-sm ${
                  currentPage === pageNum
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700"
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-500 dark:text-dark-300 dark:hover:bg-dark-700"
          >
            Last
          </button>
        </div>
      </div>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeDeleteModal}
        messages={confirmMessages}
        onOk={handleDelete}
        confirmLoading={confirmDeleteLoading}
        state={deleteState}
      />
    </div>
  );
}