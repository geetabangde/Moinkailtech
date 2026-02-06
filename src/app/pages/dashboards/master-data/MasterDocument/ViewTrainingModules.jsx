import { useState, useEffect } from 'react';
import { Button } from 'components/ui';
import { useNavigate } from 'react-router-dom';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';
import { Eye, Edit } from 'lucide-react';

const ViewTrainingModules = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch training modules data
  const fetchTrainingModules = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/master/view-training-module-list');
      
      if (response.data.status === true || response.data.status === 'true') {
        setModules(response.data.data || []);
      } else {
        toast.error('Failed to load training modules');
      }
    } catch (error) {
      console.error('Error fetching training modules:', error);
      toast.error('Error loading data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingModules();
  }, []);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = () => {
    if (!sortConfig.key) return modules;

    return [...modules].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter data based on search
  const getFilteredData = () => {
    const sortedData = getSortedData();
    
    if (!searchTerm) return sortedData;

    return sortedData.filter(module => 
      (module.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (module.code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (module.category_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  };

  // Pagination
  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = getPaginatedData();

  // FIXED: Handle Edit Question button click - use documentid from API response
  const handleEditQuestion = (documentId) => {
    console.log('Navigating to edit training with documentId:', documentId);
    navigate(`/dashboards/master-data/document-master/edit-training/${documentId}`);
  };

  // Handle View File
  const handleViewFile = (filePath) => {
    if (filePath) {
      // Construct the full URL - adjust based on your backend setup
      const fileUrl = filePath.startsWith('http') 
        ? filePath 
        : `${axios.defaults.baseURL}/${filePath}`;
      window.open(fileUrl, '_blank');
    } else {
      toast.error('No file available');
    }
  };

  // Sort indicator
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold text-gray-800">View Training Modules</h3>
            <div className="flex gap-2">
              <Button
                className="bg-gray-600 hover:bg-gray-700 text-white"
                onClick={() => navigate('/dashboards/master-data/document-master')}
              >
                &lt;&lt; Back
              </Button>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => navigate('/dashboards/master-data/document-master')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label className="text-sm text-gray-600">entries</label>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('module_id')}
                    >
                      S No <SortIndicator columnKey="module_id" />
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('name')}
                    >
                      Name <SortIndicator columnKey="name" />
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('code')}
                    >
                      Code no <SortIndicator columnKey="code" />
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('revno')}
                    >
                      Rev <SortIndicator columnKey="revno" />
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('category_name')}
                    >
                      Category <SortIndicator columnKey="category_name" />
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleSort('question_count')}
                    >
                      Total No of que <SortIndicator columnKey="question_count" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      File
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No training modules found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((module, index) => (
                      <tr key={module.module_id || index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {module.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {module.code || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {module.revno || '00'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {module.category_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                          {module.question_count || 0}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {module.file_path ? (
                            <button
                              onClick={() => handleViewFile(module.file_path)}
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              <Eye size={16} />
                              View
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {/* FIXED: Use documentid instead of module_id */}
                          <button
                            onClick={() => handleEditQuestion(module.documentid)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded text-sm font-medium transition flex items-center gap-1"
                          >
                            <Edit size={14} />
                            Edit Question
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1"
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1"
              >
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTrainingModules;