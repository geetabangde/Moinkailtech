import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Button, Input } from 'components/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function AddIntermediateCheck() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fid = searchParams.get('fid');
  const cid = searchParams.get('cid');

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const [monthsList, setMonthsList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [mastersList, setMastersList] = useState([]);

  const [formData, setFormData] = useState({
    instrumentName: '',
    selectedMonths: [],
    acceptanceCriteria: 'Drift',
    remark: '',
    initialMonth: ''
  });

  const [observations, setObservations] = useState([
    {
      id: 1,
      masterUse: '',
      masterUseName: '',
      unit: '',
      unitName: '',
      calibPoint: '',
      obs1Master: '',
      obs1UUC: '',
      obs2Master: '',
      obs2UUC: '',
      obs3Master: '',
      obs3UUC: '',
      masterAvg: '',
      uucAvg: '',
      error: ''
    }
  ]);

  const dropdownRef = useRef(null);

  // Generate dynamic months list based on start and end dates
  const generateMonthsList = (startDate, endDate) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const months = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get the first day of start month
    const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    // Get the last day of end month
    const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);

    // Check if dates are in the same month
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      // If both dates are in same month, check if they span the entire month
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      const isFullMonth = start.getDate() === 1 && end.getDate() === daysInMonth;

      if (isFullMonth) {
        // Include this month
        const monthYear = `${monthNames[start.getMonth()]} ${start.getFullYear()}`;
        months.push({
          id: 1,
          name: monthYear,
          value: monthYear
        });
      }
      // If not full month, return empty array (no months to show)
      return months;
    }

    // Loop through each month from start to end
    let current = new Date(startMonth);
    let id = 1;

    while (current <= endMonth) {
      const currentYear = current.getFullYear();
      const currentMonth = current.getMonth();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      // Check if this is the start month
      const isStartMonth = (currentYear === start.getFullYear() && currentMonth === start.getMonth());
      // Check if this is the end month
      const isEndMonth = (currentYear === end.getFullYear() && currentMonth === end.getMonth());

      let includeMonth = false;

      if (isStartMonth && isEndMonth) {
        // Both start and end in same month (already handled above, but just in case)
        includeMonth = (start.getDate() === 1 && end.getDate() === daysInMonth);
      } else if (isStartMonth) {
        // Start month: include if starts from day 1
        includeMonth = (start.getDate() === 1);
      } else if (isEndMonth) {
        // End month: include if ends on last day
        includeMonth = (end.getDate() === daysInMonth);
      } else {
        // Middle months: always include
        includeMonth = true;
      }

      if (includeMonth) {
        const monthYear = `${monthNames[currentMonth]} ${currentYear}`;
        months.push({
          id: id++,
          name: monthYear,
          value: monthYear
        });
      }

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch all data on component mount
  useEffect(() => {
    fetchInitialData();
  }, [fid, cid]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch units list
      const unitsResponse = await axios.get('/master/units-list');
      if (unitsResponse.data.status) {
        setUnitsList(unitsResponse.data.data);
      }

      // Fetch masters list
      const mastersResponse = await axios.get('/material/get-master-list');
      if (mastersResponse.data.status) {
        setMastersList(mastersResponse.data.data);
      }

      // Fetch instrument data if fid is available
      if (fid) {
        const instrumentResponse = await axios.get(`/material/get-mm-instrument-byid?id=${fid}`);
        if (instrumentResponse.data.status) {
          const instrumentData = instrumentResponse.data.data.instrument;
          setFormData(prev => ({
            ...prev,
            instrumentName: instrumentData.name || ''
          }));
        }
      }

      // Fetch master validity data to generate months and get initial month
      if (cid && fid) {
        const validityResponse = await axios.get(`/material/get-mastervalidity-byid?cid=${cid}&fid=${fid}`);
        if (validityResponse.data.status) {
          const startDate = validityResponse.data.data.startdate;
          const endDate = validityResponse.data.data.enddate;

          // Generate dynamic months list based on start and end dates
          if (startDate && endDate) {
            const generatedMonths = generateMonthsList(startDate, endDate);
            setMonthsList(generatedMonths);

            console.log('Generated months:', generatedMonths);

            // Show info if no months are available
            if (generatedMonths.length === 0) {
              toast.info('No complete months available in the validity period');
            }
          }

          // Set initial month from startdate
          if (startDate) {
            const date = new Date(startDate);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

            setFormData(prev => ({
              ...prev,
              initialMonth: monthYear
            }));
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  // Calculate average for Master observations
  const calculateMasterAverage = (obs1, obs2, obs3) => {
    const val1 = parseFloat(obs1) || 0;
    const val2 = parseFloat(obs2) || 0;
    const val3 = parseFloat(obs3) || 0;
    const avg = (val1 + val2 + val3) / 3;
    return avg.toFixed(2);
  };

  // Calculate average for UUC observations
  const calculateUUCAverage = (obs1, obs2, obs3) => {
    const val1 = parseFloat(obs1) || 0;
    const val2 = parseFloat(obs2) || 0;
    const val3 = parseFloat(obs3) || 0;
    const avg = (val1 + val2 + val3) / 3;
    return avg.toFixed(2);
  };

  // Calculate error (Master Avg - UUC Avg)
  const calculateError = (masterAvg, uucAvg) => {
    const mAvg = parseFloat(masterAvg) || 0;
    const uAvg = parseFloat(uucAvg) || 0;
    const error = mAvg - uAvg;
    return error.toFixed(2);
  };

  // Handle Master observation change
  const handleMasterObsChange = (index, field, value) => {
    const newObservations = [...observations];
    newObservations[index][field] = value;

    // Recalculate master average
    const masterAvg = calculateMasterAverage(
      newObservations[index].obs1Master,
      newObservations[index].obs2Master,
      newObservations[index].obs3Master
    );
    newObservations[index].masterAvg = masterAvg;

    // Recalculate UUC average if it exists
    const uucAvg = newObservations[index].uucAvg || '0.00';

    // Recalculate error
    newObservations[index].error = calculateError(masterAvg, uucAvg);

    setObservations(newObservations);
  };

  // Handle UUC observation change
  const handleUUCObsChange = (index, field, value) => {
    const newObservations = [...observations];
    newObservations[index][field] = value;

    // Recalculate UUC average
    const uucAvg = calculateUUCAverage(
      newObservations[index].obs1UUC,
      newObservations[index].obs2UUC,
      newObservations[index].obs3UUC
    );
    newObservations[index].uucAvg = uucAvg;

    // Recalculate master average if it exists
    const masterAvg = newObservations[index].masterAvg || '0.00';

    // Recalculate error
    newObservations[index].error = calculateError(masterAvg, uucAvg);

    setObservations(newObservations);
  };

  // Handle observation field change
  const handleObservationChange = (index, field, value) => {
    const newObservations = [...observations];
    newObservations[index][field] = value;
    setObservations(newObservations);
  };

  // Handle Master Use selection
  const handleMasterUseChange = (index, masterId) => {
    const selectedMaster = mastersList.find(master => master.id == masterId);
    const newObservations = [...observations];

    if (selectedMaster) {
      newObservations[index].masterUse = selectedMaster.id;
      newObservations[index].masterUseName = selectedMaster.name;
    } else {
      newObservations[index].masterUse = '';
      newObservations[index].masterUseName = '';
    }

    setObservations(newObservations);
  };

  // Handle Unit selection
  const handleUnitChange = (index, unitId) => {
    const selectedUnit = unitsList.find(unit => unit.id == unitId);
    const newObservations = [...observations];

    if (selectedUnit) {
      newObservations[index].unit = selectedUnit.id;
      newObservations[index].unitName = selectedUnit.name;
    } else {
      newObservations[index].unit = '';
      newObservations[index].unitName = '';
    }

    setObservations(newObservations);
  };

  // Add new observation row
  const addObservation = () => {
    setObservations([
      ...observations,
      {
        id: observations.length + 1,
        masterUse: '',
        masterUseName: '',
        unit: '',
        unitName: '',
        calibPoint: '',
        obs1Master: '',
        obs1UUC: '',
        obs2Master: '',
        obs2UUC: '',
        obs3Master: '',
        obs3UUC: '',
        masterAvg: '',
        uucAvg: '',
        error: ''
      }
    ]);
  };

  // Remove observation row
  const removeObservation = (index) => {
    if (observations.length > 1) {
      const newObservations = observations.filter((_, i) => i !== index);
      // Renumber IDs
      newObservations.forEach((obs, idx) => {
        obs.id = idx + 1;
      });
      setObservations(newObservations);
    }
  };

  // Handle month selection/deselection
  const handleMonthToggle = (monthName) => {
    setFormData(prev => ({
      ...prev,
      selectedMonths: prev.selectedMonths.includes(monthName)
        ? prev.selectedMonths.filter(m => m !== monthName)
        : [...prev.selectedMonths, monthName]
    }));
    // Keep dropdown open after selection
    setShowMonthDropdown(true);
  };

  // Remove selected month
  const removeMonth = (monthName) => {
    setFormData(prev => ({
      ...prev,
      selectedMonths: prev.selectedMonths.filter(m => m !== monthName)
    }));
  };

  // Handle form submission
  const handleSubmit = async (actionType = 'Save') => {
    // Validation
    if (!fid || !cid) {
      toast.error('Missing required parameters');
      return;
    }

    if (formData.selectedMonths.length === 0) {
      toast.error('Please select at least one month');
      return;
    }

    // Check if all required fields are filled
    const hasEmptyFields = observations.some(obs =>
      !obs.masterUseName || !obs.unitName || !obs.calibPoint
    );

    if (hasEmptyFields) {
      toast.error('Please fill all required observation fields (Master, Unit, and Calib Point)');
      return;
    }

    // Validate that at least some observation values are entered
    const hasObservationData = observations.some(obs =>
      obs.obs1Master || obs.obs1UUC || obs.obs2Master || obs.obs2UUC || obs.obs3Master || obs.obs3UUC
    );

    if (!hasObservationData) {
      toast.error('Please enter at least one observation value');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload according to API requirements
      const payload = {
        inititalmonth: formData.initialMonth || '',
        month: formData.selectedMonths,
        instid: parseInt(fid),
        acceptance: formData.acceptanceCriteria,
        validityid: parseInt(cid),
        masterforcheck: observations.map(obs => obs.masterUseName),
        unit: observations.map(obs => obs.unitName),
        point: observations.map(obs => String(obs.calibPoint)),
        masterobs1: observations.map(obs => String(obs.obs1Master || '0')),
        masterobs2: observations.map(obs => String(obs.obs2Master || '0')),
        masterobs3: observations.map(obs => String(obs.obs3Master || '0')),
        masteravg: observations.map(obs => String(obs.masterAvg || '0.00')),
        error: observations.map(obs => String(obs.error || '0.00')),
        uucobs1: observations.map(obs => String(obs.obs1UUC || '0')),
        uucobs2: observations.map(obs => String(obs.obs2UUC || '0')),
        uucobs3: observations.map(obs => String(obs.obs3UUC || '0')),
        uucavg: observations.map(obs => String(obs.uucAvg || '0.00')),
        deci: actionType,
        remark: formData.remark || ''
      };

      console.log('Submitting payload:', payload);

      const response = await axios.post('/material/add-intermidiate-check', payload);


      if (response.data.status) {
        toast.success(response.data.message || 'Intermediate Check has been added successfully');

        setTimeout(() => {
          navigate(`/dashboards/material-list/electro-technical/maintenance-equipment-history/view-imc?fid=${fid}&cid=${cid}`);
        }, 1500);
      } else {
        toast.error(response.data.message || 'Failed to add intermediate check');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        const errorMsg = error.response.data?.error || error.response.data?.message || 'Failed to submit. Please try again.';
        toast.error(errorMsg);
      } else {
        toast.error('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600">
        <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
        </svg>
        Loading Add Imc...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-normal text-gray-800">Add Intermediate Check</h1>
          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={() => navigate(`/dashboards/material-list/electro-technical/maintenance-equipment-history/view-imc?fid=${fid}&cid=${cid}`)}
            disabled={isSubmitting}
          >
            Back
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Instrument Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instrument Name
            </label>
            <Input
              type="text"
              value={formData.instrumentName}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              readOnly
              disabled
            />
          </div>

          {/* Month Dropdown with Multi-Select */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <div
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer min-h-[42px] flex items-center justify-between hover:border-gray-400"
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              >
                <div className="flex flex-wrap gap-2">
                  {formData.selectedMonths.length === 0 ? (
                    <span className="text-gray-400">
                      {monthsList.length === 0 ? 'No months available' : 'Select months...'}
                    </span>
                  ) : (
                    formData.selectedMonths.map(month => (
                      <span
                        key={month}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        {month}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMonth(month);
                          }}
                        />
                      </span>
                    ))
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`}
                />
              </div>

              {showMonthDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {monthsList.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No complete months available in the validity period
                    </div>
                  ) : (
                    monthsList.map(month => (
                      <div
                        key={month.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 transition-colors ${formData.selectedMonths.includes(month.name) ? 'bg-blue-50' : ''
                          }`}
                        onClick={() => handleMonthToggle(month.name)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedMonths.includes(month.name)}
                          onChange={() => { }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className={formData.selectedMonths.includes(month.name) ? 'font-medium text-blue-700' : ''}>
                          {month.name}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acceptance Criteria
            </label>
            <div className="relative">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.acceptanceCriteria}
                onChange={(e) => setFormData({ ...formData, acceptanceCriteria: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="Drift">Drift</option>
                <option value="Error">Error</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Remark */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remark
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              disabled={isSubmitting}
              placeholder="Enter remarks (optional)"
            />
          </div>

          {/* Initial Check */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">Initial Check</h2>

            {/* Observation Table */}
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300">S.No</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300">Master Use for Check</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300">Unit</th>
                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 border-b border-r border-gray-300">Calib Point</th>
                    <th colSpan="8" className="px-3 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-300">Observation</th>
                    <th className="px-3 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-300">Action</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border-b border-r border-gray-300"></th>
                    <th className="border-b border-r border-gray-300"></th>
                    <th className="border-b border-r border-gray-300"></th>
                    <th className="border-b border-r border-gray-300"></th>
                    <th colSpan="2" className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r border-gray-300">Observation 1</th>
                    <th colSpan="2" className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r border-gray-300">Observation 2</th>
                    <th colSpan="2" className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r border-gray-300">Observation 3</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r border-gray-300">Average</th>
                    <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 border-b border-r border-gray-300">Error</th>
                    <th className="border-b border-gray-300"></th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border-b border-r border-gray-300"></th>
                    <th className="border-b border-r border-gray-300"></th>
                    <th className="border-b border-r border-gray-300"></th>
                    <th className="border-b border-r border-gray-300"></th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-b border-r border-gray-300">Master</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-b border-r border-gray-300">UUC</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-b border-r border-gray-300">Master</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-b border-r border-gray-300">UUC</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-b border-r border-gray-300">Master</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-b border-r border-gray-300">UUC</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-b border-r border-gray-300">Master/UUC</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-b border-r border-gray-300">Error</th>
                    <th className="border-b border-gray-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {observations.map((obs, index) => (
                    <tr key={obs.id} className="border-b border-gray-300 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-sm text-gray-700 border-r border-gray-300">{obs.id}</td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <div className="relative">
                          <select
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={obs.masterUse}
                            onChange={(e) => handleMasterUseChange(index, e.target.value)}
                            disabled={isSubmitting}
                          >
                            <option value="">Select Master</option>
                            {mastersList.map(master => (
                              <option key={master.id} value={master.id}>{master.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <div className="relative">
                          <select
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={obs.unit}
                            onChange={(e) => handleUnitChange(index, e.target.value)}
                            disabled={isSubmitting}
                          >
                            <option value="">Select unit</option>
                            {unitsList.map(unit => (
                              <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <input
                          type="number"
                          step="any"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={obs.calibPoint}
                          onChange={(e) => handleObservationChange(index, 'calibPoint', e.target.value)}
                          disabled={isSubmitting}
                          placeholder="Point"
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <input
                          type="number"
                          step="any"
                          placeholder="Master"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          value={obs.obs1Master}
                          onChange={(e) => handleMasterObsChange(index, 'obs1Master', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <input
                          type="number"
                          step="any"
                          placeholder="UUC"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          value={obs.obs1UUC}
                          onChange={(e) => handleUUCObsChange(index, 'obs1UUC', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <input
                          type="number"
                          step="any"
                          placeholder="Master"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          value={obs.obs2Master}
                          onChange={(e) => handleMasterObsChange(index, 'obs2Master', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <input
                          type="number"
                          step="any"
                          placeholder="UUC"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          value={obs.obs2UUC}
                          onChange={(e) => handleUUCObsChange(index, 'obs2UUC', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <input
                          type="number"
                          step="any"
                          placeholder="Master"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          value={obs.obs3Master}
                          onChange={(e) => handleMasterObsChange(index, 'obs3Master', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <input
                          type="number"
                          step="any"
                          placeholder="UUC"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          value={obs.obs3UUC}
                          onChange={(e) => handleUUCObsChange(index, 'obs3UUC', e.target.value)}
                          disabled={isSubmitting}
                        />
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <div className="space-y-1">
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={obs.masterAvg}
                            readOnly
                            placeholder="Master Avg"
                          />
                          <input
                            type="text"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={obs.uucAvg}
                            readOnly
                            placeholder="UUC Avg"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2 border-r border-gray-300">
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          value={obs.error}
                          readOnly
                          placeholder="Error"
                        />
                      </td>
                      <td className="px-2 py-2">
                        {observations.length > 1 && (
                          <button
                            onClick={() => removeObservation(index)}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                            disabled={isSubmitting}
                            title="Remove row"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Observation Button */}
            <Button
              onClick={addObservation}
              className="h-8 space-x-1.5 rounded-md px-3 text-xs mt-4"
              color="primary"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              Add Observation
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              className="h-8 space-x-1.5 rounded-md px-3 text-xs"
              color="primary"
              onClick={() => handleSubmit('Save')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button
              className="h-8 space-x-1.5 rounded-md px-3 text-xs"
              color="primary"
              onClick={() => handleSubmit('Submit')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}