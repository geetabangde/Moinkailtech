import { useState, useEffect } from 'react';
import Select from 'react-select';
import { Input } from "components/ui";
import { useNavigate } from 'react-router';
import axios from 'utils/axios';
import { toast } from 'react-hot-toast'; // or your toast library

const AddUnitConversion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitOptions, setUnitOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    fromUnit: null,
    fromValue: '1',
    toUnit: null,
    toValue: ''
  });

  // ✅ Fetch units list from API
  useEffect(() => {
    const fetchUnits = async () => {
      setUnitsLoading(true);
      try {
        const response = await axios.get('master/units-list');
        
        // Transform API data to react-select format
        const transformedUnits = response.data.data.map((unit) => ({
          value: unit.id, // unit ID for API submission
          label: unit.unit_name || unit.name, // display name (adjust field name as per your API)
          ...unit // keep original data if needed
        }));
        
        setUnitOptions(transformedUnits);
      } catch (error) {
        console.error('Error fetching units:', error);
        toast.error('Failed to load units list');
      } finally {
        setUnitsLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '48px',
      borderColor: state.isFocused ? '#06b6d4' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(6, 182, 212, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#06b6d4'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '8px 16px'
    }),
    input: (provided) => ({
      ...provided,
      margin: 0,
      padding: 0
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#374151'
      }
    })
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData({
      ...formData,
      [name]: selectedOption
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fromUnit) {
      toast.error('Please select From Unit');
      return;
    }
    if (!formData.fromValue || formData.fromValue.trim() === '') {
      toast.error('Please enter From Value');
      return;
    }
    if (!formData.toUnit) {
      toast.error('Please select To Unit');
      return;
    }
    if (!formData.toValue || formData.toValue.trim() === '') {
      toast.error('Please enter To Value');
      return;
    }

    // Prepare payload for API
    const payload = {
      fromunit: formData.fromUnit.value, // unit ID
      fromvalue: parseFloat(formData.fromValue),
      tounit: formData.toUnit.value, // unit ID
      tovalue: parseFloat(formData.toValue)
    };

    setLoading(true);
    try {
      const response = await axios.post('master/create-unitconversion', payload);
      
      if (response.data.status === 'true' || response.data.status === true) {
        toast.success('Unit conversion added successfully!');
        // Navigate back to list
        navigate('/dashboards/master-data/units-conversion');
      } else {
        toast.error(response.data.message || 'Failed to add unit conversion');
      }
    } catch (error) {
      console.error('Error creating unit conversion:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to add unit conversion. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-normal text-gray-800">Add Unit Conversion</h1>
        <button 
          className="px-6 py-2 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 transition-colors"
          onClick={() => navigate("/dashboards/master-data/units-conversion")}
        >
          &lt;&lt; Back to Units Conversion List
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* From Unit */}
        <div className="flex items-center mb-6">
          <label className="w-48 text-right mr-6 text-gray-700 font-medium">
            From Unit <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <Select
              value={formData.fromUnit}
              onChange={(option) => handleSelectChange('fromUnit', option)}
              options={unitOptions}
              styles={customStyles}
              isSearchable={true}
              isLoading={unitsLoading}
              placeholder={unitsLoading ? "Loading units..." : "Select unit..."}
              isDisabled={unitsLoading}
            />
          </div>
        </div>

        {/* From Value */}
        <div className="flex items-center mb-6">
          <label className="w-48 text-right mr-6 text-gray-700 font-medium">
            From Value <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <Input
              type="number"
              step="any"
              name="fromValue"
              value={formData.fromValue}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* To Unit */}
        <div className="flex items-center mb-6">
          <label className="w-48 text-right mr-6 text-gray-700 font-medium">
            To Unit <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <Select
              value={formData.toUnit}
              onChange={(option) => handleSelectChange('toUnit', option)}
              options={unitOptions}
              styles={customStyles}
              isSearchable={true}
              isLoading={unitsLoading}
              placeholder={unitsLoading ? "Loading units..." : "Select unit..."}
              isDisabled={unitsLoading}
            />
          </div>
        </div>

        {/* To Value */}
        <div className="flex items-center mb-8">
          <label className="w-48 text-right mr-6 text-gray-700 font-medium">
            To Value <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <Input
              type="number"
              step="any"
              name="toValue"
              value={formData.toValue}
              onChange={handleChange}
              placeholder="To Value"
              className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            style={{ cursor: "pointer" }}
            onClick={handleSubmit}
            disabled={loading || unitsLoading}
            className="px-8 py-3 bg-green-600 text-white text-base font-medium rounded hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Unit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUnitConversion;