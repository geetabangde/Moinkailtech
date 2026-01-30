import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Select from 'react-select';
import axios from 'utils/axios';
import { toast } from 'react-hot-toast';

const AddElectricalTest = () => {
  const navigate = useNavigate();

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
          toast.success('Units loaded successfully');
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

  // ✅ Handle Save with API POST
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

    const payload = {
      description: description,
      minrange: Number(minRange),
      maxrange: Number(maxRange),
      unit: unit.value, // Send ID
      test: safetyType.value,
      tolerance: tolerance.value,
    };

    console.log('Saving Payload:', payload);

    setSaving(true);

    try {
      const response = await axios.post(
        '/calibrationoperations/add-electricaltest',
        payload
      );

      console.log('Save Response:', response.data);

      if (response.data && response.data.status) {
        toast.success('Electrical test added successfully');
        
        // Reset form
        setDescription('');
        setMinRange('');
        setMaxRange('');
        setUnit(null);
        setSafetyType(null);
        setTolerance(null);

        // Navigate to list after 1 second
        setTimeout(() => {
          navigate('/dashboards/calibration-operations/bio-medical-safety-test');
        }, 1000);
      } else {
        toast.error(response.data?.message || 'Failed to add electrical test');
      }
    } catch (err) {
      console.error('Error saving electrical test:', err);
      
      let errorMessage = 'Failed to add electrical test';
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

  const handleElectricalTestList = () => {
    navigate("/dashboards/calibration-operations/bio-medical-safety-test");
  };

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <h1 className="text-3xl font-normal text-gray-800 mb-6">
        Add Electrical Safety Test
      </h1>

      {/* Electrical Safety List Button */}
      <button
        onClick={handleElectricalTestList}
        className="px-6 py-2.5 bg-cyan-500 text-white text-sm font-medium rounded hover:bg-cyan-600 transition-colors mb-8"
      >
        Electrical Safety List
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
          type="number"
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
          type="number"
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
            placeholder={loadingUnits ? 'Loading units...' : 'Select unit'}
            isLoading={loadingUnits}
            isDisabled={loadingUnits}
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

      {/* Basic Safety or Electrical Safety (React Select) */}
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
        style={{ cursor: "pointer" }}
        onClick={handleSave}
        disabled={saving}
        className={`px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors ${
          saving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  );
};

export default AddElectricalTest;