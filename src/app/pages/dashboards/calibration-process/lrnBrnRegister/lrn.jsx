import { useState, useEffect } from 'react';
import { Button } from "components/ui";
import appLogo from "/images/logo.png";
import axios from "utils/axios";

const LrnBrnRegister = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startCustomer, setStartCustomer] = useState('');
  const [endCustomer, setEndCustomer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [registerData, setRegisterData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const response = await axios.get('/people/get-all-customers');
        if (response.data.success) {
          setCustomers(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      days.push(i);
    }
    return days;
  };

  const handleDateSelect = (day, isStart = true) => {
    const formattedDate = `${day.toString().padStart(2, '0')}/09/2025`;
    if (isStart) {
      setStartDate(formattedDate);
      setShowStartCalendar(false);
    } else {
      setEndDate(formattedDate);
      setShowEndCalendar(false);
    }
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for API
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  // Extract customer ID from customer string (e.g., "DILIP BUILDCON LIMITED(826729681)" -> "826729681")
  const extractCustomerId = (customerStr) => {
    if (!customerStr) return '';
    const match = customerStr.match(/\((\d+)\)/);
    return match ? match[1] : '';
  };

  const handleSearch = async () => {
    if (!startDate || !endDate || !startCustomer || !endCustomer) {
      setError('Please fill in all search fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        startdate: formatDateForAPI(startDate),
        enddate: formatDateForAPI(endDate),
        customerid: extractCustomerId(startCustomer),
        reportcustomerid: extractCustomerId(endCustomer)
      };

      const response = await axios.get('/api/calibrationprocess/search-lrn-brn-register', {
        params
      });

      if (response.data.success) {
        setRegisterData(response.data.data || []);
        setShowResults(true);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setShowExport(true);
    
    // Create export content with actual data
    const exportContent = `
LRN BRN Register Export
======================

Search Parameters:
- Start Date: ${startDate}
- End Date: ${endDate}
- Start Customer: ${startCustomer}
- End Customer: ${endCustomer}

Total Records: ${registerData.length}

Records:
${registerData.map((record, index) => `
Record ${index + 1}:
- ID: ${record.id}
- Inward Date: ${record.inwarddate}
- BRN: ${record.bookingrefno}
- LRN: ${record.labreferenceno}
- Customer: ${record.customername}
- Total Amount: ${record.total}
`).join('\n')}
`;
    
    // Create and download file
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lrn_brn_register_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Format date for display (YYYY-MM-DD to DD/MM/YYYY)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  if (showExport) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="text-center">
              <div className="bg-white p-8 border border-gray-200 rounded-lg">
                <div className="space-y-2">
                  <div className="border-b-2 border-black w-full h-1"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                  <div className="border-b border-black w-full h-0.5"></div>
                </div>
                <div className="text-gray-600 text-sm mt-4">
                  Export document generated successfully
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button 
                onClick={() => setShowExport(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Back to Register
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{background:"none"}}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <h1 className="text-lg font-medium text-gray-800" style={{marginLeft:"20px"}}>LRN BRN Register</h1>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm pr-8"
                      onClick={() => setShowStartCalendar(!showStartCalendar)}
                      readOnly
                    />
                    <button
                      onClick={() => setShowStartCalendar(!showStartCalendar)}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      📅
                    </button>
                  </div>
                  
                  {/* Calendar Dropdown */}
                  {showStartCalendar && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
                      <div className="flex justify-between items-center mb-4">
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                          <option>Sep</option>
                        </select>
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                          <option>2025</option>
                        </select>
                        <button
                          onClick={() => setShowStartCalendar(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        <div className="font-medium text-gray-600">Su</div>
                        <div className="font-medium text-gray-600">Mo</div>
                        <div className="font-medium text-gray-600">Tu</div>
                        <div className="font-medium text-gray-600">We</div>
                        <div className="font-medium text-gray-600">Th</div>
                        <div className="font-medium text-gray-600">Fr</div>
                        <div className="font-medium text-gray-600">Sa</div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays().map((day) => (
                          <button
                            key={day}
                            onClick={() => handleDateSelect(day, true)}
                            className="w-8 h-8 text-xs hover:bg-blue-100 rounded flex items-center justify-center"
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    value={startCustomer}
                    onChange={(e) => setStartCustomer(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    disabled={loadingCustomers}
                  >
                    <option value="">
                      {loadingCustomers ? 'Loading customers...' : 'Select Customer'}
                    </option>
                    {customers.map((customer) => (
                      <option 
                        key={customer.id} 
                        value={`${customer.customername}(${customer.id})`}
                      >
                        {customer.customername} ({customer.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm pr-8"
                      onClick={() => setShowEndCalendar(!showEndCalendar)}
                      readOnly
                    />
                    <button
                      onClick={() => setShowEndCalendar(!showEndCalendar)}
                      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    >
                      📅
                    </button>
                  </div>
                  
                  {/* Calendar Dropdown */}
                  {showEndCalendar && (
                    <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
                      <div className="flex justify-between items-center mb-4">
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                          <option>Sep</option>
                        </select>
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                          <option>2025</option>
                        </select>
                        <button
                          onClick={() => setShowEndCalendar(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        <div className="font-medium text-gray-600">Su</div>
                        <div className="font-medium text-gray-600">Mo</div>
                        <div className="font-medium text-gray-600">Tu</div>
                        <div className="font-medium text-gray-600">We</div>
                        <div className="font-medium text-gray-600">Th</div>
                        <div className="font-medium text-gray-600">Fr</div>
                        <div className="font-medium text-gray-600">Sa</div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {generateCalendarDays().map((day) => (
                          <button
                            key={day}
                            onClick={() => handleDateSelect(day, false)}
                            className="w-8 h-8 text-xs hover:bg-blue-100 rounded flex items-center justify-center"
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    value={endCustomer}
                    onChange={(e) => setEndCustomer(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                    disabled={loadingCustomers}
                  >
                    <option value="">
                      {loadingCustomers ? 'Loading customers...' : 'Select Customer'}
                    </option>
                    {customers.map((customer) => (
                      <option 
                        key={customer.id} 
                        value={`${customer.customername}(${customer.id})`}
                      >
                        {customer.customername} ({customer.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button
                onClick={handleExport}
                disabled={!showResults || registerData.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded text-sm disabled:opacity-50"
              >
                Export
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {showResults && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header Section with Logo and Document Info */}
              <div className="grid grid-cols-12 gap-0 border-b border-gray-200">
                {/* Logo Section */}
                <div className="col-span-3 bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-tl-lg flex items-center justify-center" style={{background:"none"}}>
                  <div className="text-center">
                    <img 
                      src={appLogo} 
                      alt="App Logo" 
                      className="h-16 w-auto mx-auto mb-2 bg-white p-2 rounded"
                    />
                    <div className="text-white text-xs">
                      Quality through Research
                    </div>
                    <div className="text-white text-xs">
                      Kaltech Test And Research Centre Pvt. Ltd.
                    </div>
                  </div>
                </div>

                {/* Document Title Section */}
                <div className="col-span-6 p-6 flex items-center justify-center border-l border-r border-gray-200">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      Sample /UUC Received Record and Department Sample Inward Register
                    </h3>
                  </div>
                </div>

                {/* Document Details Section */}
                <div className="col-span-3 p-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">QF. No.</span>
                      <span className="font-medium">KTROCF070401</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issue No.</span>
                      <span className="font-medium">01</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Issue Date</span>
                      <span className="font-medium">01/08/2019</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revision No.</span>
                      <span className="font-medium">01</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revision Date</span>
                      <span className="font-medium">20/08/2021</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Page</span>
                      <span className="font-medium">1 of 1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Scrollable Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Sr no</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">BRN</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">LRN</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Inward No</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Party name</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Contact Person</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Sample Details</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Id no</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Serial no</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Quantity</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Department</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Parameters</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Committed Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Reporting Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">TAT</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 whitespace-nowrap">Remarks</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-700 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="18" className="p-8 text-center text-gray-500">
                          <div className="text-sm">Loading...</div>
                        </td>
                      </tr>
                    ) : registerData.length === 0 ? (
                      <tr>
                        <td colSpan="18" className="p-8 text-center text-gray-500">
                          <div className="text-sm">
                            No records found for the selected criteria.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      registerData.map((record, index) => (
                        <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{index + 1}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{formatDateForDisplay(record.inwarddate)}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.bookingrefno}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.labreferenceno}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.id}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.customername}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.concernpersonname}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.instrumentlocation}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.id}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">-</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">-</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.department || '-'}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">-</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{formatDateForDisplay(record.deadline)}</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">-</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">-</td>
                          <td className="px-3 py-2 text-xs border-r border-gray-200">{record.remark || '-'}</td>
                          <td className="px-3 py-2 text-xs">
                            <span className={`px-2 py-1 rounded text-xs ${
                              record.status === 4 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {record.status === 4 ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LrnBrnRegister;