import { useState, useEffect } from 'react';
import { Button, Card, Input } from 'components/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';

const UncertaintyMatrixForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get URL params
  const fid = searchParams.get('fid');
  const cid = searchParams.get('cid');
  const labId = searchParams.get('labId');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data states
  const [unitTypes, setUnitTypes] = useState([]);
  const [modes, setModes] = useState([]);
  const [units, setUnits] = useState([]);
  const [uncertaintyTerms] = useState([
    { id: 1, name: 'Absolute', value: 'absolute' },
    { id: 2, name: 'Percentage', value: 'percentage' },
    { id: 3, name: 'Relative', value: 'relative' }
  ]);
  const [cmcUnits, setCmcUnits] = useState([]);

  const [formData, setFormData] = useState({
    unityType: '',
    mode: '',
    unit: '',
    point: '',
    cmc: '',
    uncertaintyTerm: '',
    cmcUnit: '',
    drift: '',
    density: ''
  });

  // Check if required params are present
  useEffect(() => {
    if (!fid || !cid) {
      toast.error('Missing required parameters (fid or cid). Redirecting...');
      setTimeout(() => {
        navigate('/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail');
      }, 2000);
    }
  }, [fid, cid, navigate]);

  // Fetch all dropdown data on component mount
  useEffect(() => {
    if (fid && cid) {
      fetchAllDropdownData();
    }
  }, [fid, cid]);

  // Fetch all dropdown data
  const fetchAllDropdownData = async () => {
    setIsLoading(true);
    try {
      // Fetch all APIs in parallel
      const [unitTypesRes, modesRes, unitsRes] = await Promise.all([
        axios.get('/master/unit-type-list'),
        axios.get('/master/mode-list'),
        axios.get('/master/units-list')
      ]);

      // Set unit types
      if (unitTypesRes.data.status && unitTypesRes.data.data) {
        setUnitTypes(unitTypesRes.data.data);
      }

      // Set modes
      if (modesRes.data.status && modesRes.data.data) {
        setModes(modesRes.data.data);
      }

      // Set units (name + description for display) and CMC units (only description)
      if (unitsRes.data.status && unitsRes.data.data) {
        setUnits(unitsRes.data.data);
        setCmcUnits(unitsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Failed to load form data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to handle back navigation with params
  const handleBackNavigation = () => {
    const params = new URLSearchParams();
    if (fid) params.append('fid', fid);
    if (cid) params.append('cid', cid);
    if (labId) params.append('labId', labId);
    
    navigate(`/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail?${params.toString()}`);
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.unityType) {
      toast.error('Please select Unity Type/Parameter');
      return;
    }

    if (!formData.mode) {
      toast.error('Please select Mode');
      return;
    }

    if (!formData.unit) {
      toast.error('Please select Unit');
      return;
    }

    if (!formData.point) {
      toast.error('Please enter Point');
      return;
    }

    if (!formData.cmc) {
      toast.error('Please enter CMC');
      return;
    }

    // Check if fid and cid are available
    if (!fid || !cid) {
      toast.error('Missing required parameters (fid or cid)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload exactly as per your API requirement
      const payload = {
        unittype: formData.unityType,
        mode: formData.mode,
        unit: parseInt(formData.unit),
        point: parseFloat(formData.point) || 0,
        cmc: parseFloat(formData.cmc) || 0,
        uncertaintyTerm: formData.uncertaintyTerm || '',
        cmcunit: parseInt(formData.cmcUnit) || 0,
        drift: parseFloat(formData.drift) || 0,
        density: parseFloat(formData.density) || 0,
        masterid: parseInt(fid),
        certificateid: parseInt(cid)
      };

      console.log('Submitting uncertainty payload:', payload);

      // Make API call to add-masterUncertainty-matrix
      const response = await axios.post('/material/add-masterUncertainty-matrix', payload);

      if (response.data.status) {
        toast.success(response.data.message || 'Uncertainty Matrix added successfully');
        
        // Navigate back after successful save
        setTimeout(() => {
          handleBackNavigation();
        }, 1500);
      } else {
        toast.error(response.data.message || 'Failed to add uncertainty matrix');
      }
    } catch (error) {
      console.error('Error saving uncertainty matrix:', error);
      toast.error(error.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading form data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if params are missing
  if (!fid || !cid) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white shadow-sm rounded-lg p-6">
            <div className="text-center text-red-600">
              <p>Missing required parameters. Please access this page from the validity details page.</p>
              <Button
                className="mt-4"
                color="primary"
                onClick={() => navigate('/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail')}
              >
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast Notifications */}
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

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Add master Uncertainty Matrix Form</h1>
          </div>
          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={handleBackNavigation}
            disabled={isSubmitting}
          >
            ← Back to Master Detail Entry List
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-5">
            {/* Unity Type */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Unity Type/ parameter 
              </label>
              <div className="col-span-9">
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.unityType}
                  onChange={(e) => handleInputChange('unityType', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select Unity Type</option>
                  {unitTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Mode 
              </label>
              <div className="col-span-9">
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.mode}
                  onChange={(e) => handleInputChange('mode', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select Mode</option>
                  {modes.map((mode) => (
                    <option key={mode.id} value={mode.name}>
                      {mode.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unit - Now showing name + description */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Unit 
              </label>
              <div className="col-span-9">
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} {unit.description ? `(${unit.description})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Point */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Point 
              </label>
              <div className="col-span-9">
                <Input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.point}
                  onChange={(e) => handleInputChange('point', e.target.value)}
                  placeholder="Enter point"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* CMC */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                CMC 
              </label>
              <div className="col-span-9">
                <Input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.cmc}
                  onChange={(e) => handleInputChange('cmc', e.target.value)}
                  placeholder="Enter CMC"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Uncertainty Term */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Uncertainty Term
              </label>
              <div className="col-span-9">
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.uncertaintyTerm}
                  onChange={(e) => handleInputChange('uncertaintyTerm', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select Uncertainty Term</option>
                  {uncertaintyTerms.map((term) => (
                    <option key={term.id} value={term.value}>
                      {term.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CMC Unit - Now showing only description */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                CMC Unit
              </label>
              <div className="col-span-9">
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.cmcUnit}
                  onChange={(e) => handleInputChange('cmcUnit', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Select CMC Unit</option>
                  {cmcUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.description || unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drift */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Drift
              </label>
              <div className="col-span-9">
                <Input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.drift}
                  onChange={(e) => handleInputChange('drift', e.target.value)}
                  placeholder="Enter drift"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Density */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Density
              </label>
              <div className="col-span-9">
                <Input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.density}
                  onChange={(e) => handleInputChange('density', e.target.value)}
                  placeholder="Enter density"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Master Matrix'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UncertaintyMatrixForm;