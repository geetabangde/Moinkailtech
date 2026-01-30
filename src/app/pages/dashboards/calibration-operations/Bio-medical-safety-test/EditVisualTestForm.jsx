import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import Select from 'react-select';
import axios from 'utils/axios';
import { toast } from 'react-hot-toast';

const EditElectricalTest = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL

  // Form States
  const [description, setDescription] = useState('');
  const [minRange, setMinRange] = useState('');
  const [maxRange, setMaxRange] = useState('');
  const [unit, setUnit] = useState(null);
  const [safetyType, setSafetyType] = useState(null);
  const [tolerance, setTolerance] = useState(null);

  // Loading States
  const [unitOptions, setUnitOptions] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  // Safety Type Options (Static)
  const safetyOptions = [
    { value: 'Basic Safety & Performance Test', label: 'Basic Safety & Performance Test' },
    { value: 'Electrical Safety Test', label: 'Electrical Safety Test' },
  ];

  // Tolerance Options (Static)
  const toleranceOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];

  // ✅ Fetch Units List from API
  useEffect(() => {
    const fetchUnits = async () => {
      setLoadingUnits(true);
      try {
        const response = await axios.get('/master/units-list');
        
        console.log('Units API Response:', response.data);

        if (response.data && response.data.status) {
          const formattedUnits = response.data.data.map((item) => ({
            value: item.id,
            label: item.unitdesc || item.name || item.unit,
          }));
          
          setUnitOptions(formattedUnits);
        } else {
          toast.error('Failed to load units');
        }
      } catch (err) {
        console.error('Error fetching units:', err);
        toast.error('Failed to load units list');
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, []);

  // ✅ Fetch Electrical Test Data by ID
  useEffect(() => {
    const fetchElectricalTest = async () => {
      if (!id) {
        toast.error('No ID provided');
        navigate('/dashboards/calibration-operations/bio-medical-safety-test');
        return;
      }

      // Wait for units to load first
      if (loadingUnits || unitOptions.length === 0) {
        return;
      }

      setLoadingData(true);
      try {
        const response = await axios.get(
          `/calibrationoperations/get-electricaltest-byid/${id}`
        );

        console.log('Electrical Test API Response:', response.data);

        if (response.data && response.data.status) {
          // ✅ Check if data is array or object
          const data = Array.isArray(response.data.data) 
            ? response.data.data[0] 
            : response.data.data;

          console.log('Fetched Data:', data);

          // ✅ Set form fields
          setDescription(data.description || '');
          setMinRange(data.minrange?.toString() || '');
          setMaxRange(data.maxrange?.toString() || '');

          // ✅ Set unit using unit ID (not unitdesc)
          if (data.unit) {
            console.log('Looking for unit ID:', data.unit);
            console.log('Available units:', unitOptions);
            
            const selectedUnit = unitOptions.find(
              (opt) => opt.value === data.unit
            );
            
            console.log('Selected Unit:', selectedUnit);
            
            if (selectedUnit) {
              setUnit(selectedUnit);
            } else {
              console.warn('Unit not found in options:', data.unit);
            }
          }

          // ✅ Set safety type (test field)
          if (data.test) {
            const selectedSafety = safetyOptions.find(
              (opt) => opt.value.trim() === data.test.trim()
            );
            console.log('Selected Safety:', selectedSafety);
            if (selectedSafety) {
              setSafetyType(selectedSafety);
            }
          }

          // ✅ Set tolerance
          if (data.tolerance) {
            const selectedTolerance = toleranceOptions.find(
              (opt) => opt.value === data.tolerance
            );
            console.log('Selected Tolerance:', selectedTolerance);
            if (selectedTolerance) {
              setTolerance(selectedTolerance);
            }
          }

          toast.success('Electrical test data loaded');
        } else {
          toast.error('Failed to load electrical test data');
          navigate('/dashboards/calibration-operations/bio-medical-safety-test');
        }
      } catch (err) {
        console.error('Error fetching electrical test:', err);
        
        let errorMessage = 'Failed to load electrical test data';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        toast.error(errorMessage);
      } finally {
        setLoadingData(false);
      }
    };

    fetchElectricalTest();
  }, [id, unitOptions, loadingUnits, navigate]);

  // ✅ Handle Update with API POST
  const handleSave = async () => {
    // Validation
    if (!description.trim()) {
      toast.error('Please enter description');
      return;
    }
    if (!minRange) {
      toast.error('Please enter min range');
      return;
    }
    if (!maxRange) {
      toast.error('Please enter max range');
      return;
    }
    if (!unit) {
      toast.error('Please select unit');
      return;
    }
    if (!safetyType) {
      toast.error('Please select safety type');
      return;
    }
    if (!tolerance) {
      toast.error('Please select tolerance');
      return;
    }

    // ✅ Try to convert to number if possible, otherwise keep as string
    const parseValue = (val) => {
      const num = Number(val);
      return isNaN(num) ? val : num;
    };

    const payload = {
      id: Number(id),
      description: description.trim(),
      minrange: parseValue(minRange),
      maxrange: parseValue(maxRange),
      unit: unit.value,
      test: safetyType.value.trim(),
      tolerance: tolerance.value,
    };

    console.log('Update Payload:', payload);

    setSaving(true);

    try {
      const response = await axios.post(
        '/calibrationoperations/update-electricaltest',
        payload
      );

      console.log('Update Response:', response.data);

      if (response.data && response.data.status) {
        toast.success('Electrical test updated successfully');
        
        // Navigate back to list after 1 second
        setTimeout(() => {
          navigate('/dashboards/calibration-operations/bio-medical-safety-test');
        }, 1000);
      } else {
        toast.error(response.data?.message || 'Update failed or record not found');
      }
    } catch (err) {
      console.error('Error updating electrical test:', err);
      
      let errorMessage = 'Failed to update electrical test';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status) {
        errorMessage = `Server Error (${err.response.status})`;
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToList = () => {
    navigate('/dashboards/calibration-operations/bio-medical-safety-test');
  };

  // ✅ Loading Screen
  if (loadingData || loadingUnits) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="h-8 w-8 animate-spin text-blue-600"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"
              ></path>
            </svg>
            <p className="text-gray-600">Loading electrical test data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <h1 className="text-3xl font-normal text-gray-800 mb-6">
        Edit Electrical Safety Test
      </h1>

      {/* Back Button */}
      <button
        onClick={handleBackToList}
        className="px-6 py-2.5 bg-cyan-500 text-white text-sm font-medium rounded hover:bg-cyan-600 transition-colors mb-8"
      >
        Back To List
      </button>

      {/* Description */}
      <div className="flex items-start mb-6">
        <label className="w-56 pt-3 text-gray-800 font-medium">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Parameter Description"
          className="flex-1 px-4 py-3 border border-blue-600 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Min Range */}
      <div className="flex items-start mb-6">
        <label className="w-56 pt-3 text-gray-800 font-medium">
          Min range specification
        </label>
        <input
          type="text"
          value={minRange}
          onChange={(e) => setMinRange(e.target.value)}
          placeholder="Enter minimum range"
          className="flex-1 px-4 py-3 border border-blue-600 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Max Range */}
      <div className="flex items-start mb-6">
        <label className="w-56 pt-3 text-gray-800 font-medium">
          Max range specification
        </label>
        <input
          type="text"
          value={maxRange}
          onChange={(e) => setMaxRange(e.target.value)}
          placeholder="Enter maximum range"
          className="flex-1 px-4 py-3 border border-blue-600 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Unit (React Select - From API) */}
      <div className="flex items-start mb-6">
        <label className="w-56 pt-3 text-gray-800 font-medium">Unit</label>
        <div className="flex-1">
          <Select
            options={unitOptions}
            value={unit}
            onChange={setUnit}
            placeholder="Select unit"
            className="text-gray-700"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#2563eb',
                padding: '2px',
              }),
            }}
          />
        </div>
      </div>

      {/* Test Type (React Select) */}
      <div className="flex items-start mb-6">
        <label className="w-56 pt-3 text-gray-800 font-medium">
          Test Type
        </label>
        <div className="flex-1">
          <Select
            options={safetyOptions}
            value={safetyType}
            onChange={setSafetyType}
            placeholder="Select test type"
            className="text-gray-700"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#2563eb',
                padding: '2px',
              }),
            }}
          />
        </div>
      </div>

      {/* Tolerance (React Select) */}
      <div className="flex items-start mb-8">
        <label className="w-56 pt-3 text-gray-800 font-medium">Tolerance</label>
        <div className="flex-1">
          <Select
            options={toleranceOptions}
            value={tolerance}
            onChange={setTolerance}
            placeholder="Select tolerance"
            className="text-gray-700"
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#2563eb',
                padding: '2px',
              }),
            }}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors ${
          saving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {saving ? 'Updating...' : 'Update changes'}
      </button>
    </div>
  );
};

export default EditElectricalTest;