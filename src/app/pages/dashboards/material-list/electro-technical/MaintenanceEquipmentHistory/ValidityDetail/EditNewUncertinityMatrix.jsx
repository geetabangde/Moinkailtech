import { useState, useEffect } from 'react';
import { Button, Card, Input } from '../../../../../../../components/ui';
import { useNavigate, useLocation } from 'react-router';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';

const EditNewUncertaintyMatrix = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [urlParams, setUrlParams] = useState({ fid: '', cid: '', labId: '', id: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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

  // Extract URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fid = params.get("fid") || "";
    const cid = params.get("cid") || "";
    const labId = params.get("labId") || "";
    const id = params.get("id") || "";

    setUrlParams({ fid, cid, labId, id });
  }, [location.search]);

  // Fetch all dropdown data on component mount
  useEffect(() => {
    if (urlParams.fid && urlParams.cid) {
      fetchAllDropdownData();
    }
  }, [urlParams.fid, urlParams.cid]);

  // Fetch all dropdown data
  const fetchAllDropdownData = async () => {
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
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      toast.error("Failed to load dropdown data");
    }
  };

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      if (!urlParams.id || !urlParams.fid || !urlParams.cid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/material/get-masteruncertinity-byid`, {
          params: {
            fid: urlParams.fid,
            cid: urlParams.cid,
            id: urlParams.id
          }
        });
        
        if (response.data && response.data.status) {
          const data = response.data.data;
          setFormData({
            unityType: data.unittype || '',
            mode: data.mode || '',
            unit: data.unit?.toString() || '',
            point: data.point || '',
            cmc: data.cmc || '',
            uncertaintyTerm: data.uncertaintyTerm || '',
            cmcUnit: data.cmcunit?.toString() || '',
            drift: data.drift || '',
            density: data.density || ''
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlParams.id, urlParams.fid, urlParams.cid]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
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

    try {
      setSaving(true);
      
      const payload = {
        id: parseInt(urlParams.id),
        unittype: formData.unityType,
        mode: formData.mode,
        unit: parseInt(formData.unit),
        point: parseFloat(formData.point) || 0,
        cmc: parseFloat(formData.cmc) || 0,
        uncertaintyTerm: formData.uncertaintyTerm,
        cmcunit: parseInt(formData.cmcUnit),
        drift: parseFloat(formData.drift) || 0,
        density: parseFloat(formData.density) || 0,
        masterid: parseInt(urlParams.fid),
        certificateid: parseInt(urlParams.cid)
      };

      const response = await axios.post(`/material/update-masterUncertainty-matrix`, payload);
      
      if (response.data?.status) {
        toast.success(response.data?.message || "Matrix has been updated");
        setTimeout(() => {
          handleBackNavigation();
        }, 1500);
      } else {
        toast.error(response.data?.message || "Failed to update record");
      }
    } catch (err) {
      console.error("Error saving data:", err);
      toast.error(err.response?.data?.message || "Failed to update record");
    } finally {
      setSaving(false);
    }
  };

  const handleBackNavigation = () => {
    const params = new URLSearchParams();
    if (urlParams.fid) params.append('fid', urlParams.fid);
    if (urlParams.cid) params.append('cid', urlParams.cid);
    if (urlParams.labId) params.append('labId', urlParams.labId);

    navigate(`/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-gray-600">
        <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
        </svg>
        Loading...
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

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Master Uncertainty Matrix Form</h1>
          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={handleBackNavigation}
          >
            ← Back to Master Detail Entry List
          </Button>
        </div>

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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
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

export default EditNewUncertaintyMatrix;