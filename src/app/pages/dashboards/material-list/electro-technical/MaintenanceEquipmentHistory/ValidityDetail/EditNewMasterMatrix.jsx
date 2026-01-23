import { useState, useEffect } from 'react';
import { Button, Card, Input } from '../../../../../../../components/ui';
import { useNavigate, useLocation } from 'react-router';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';

const EditMasterMatrixForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [urlParams, setUrlParams] = useState({ fid: '', cid: '', labId: '', id: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    unityType: '',
    mode: '',
    unit: '',
    instrumentRangeMin: '',
    instrumentRangeMax: '',
    calibratedRangeMin: '',
    calibratedRangeMax: '',
    leastCount: '',
    stability: '',
    remarks: '',
    uniformity: '',
    percentageOfRange: '',
    percentageOfMeasurement: '',
    absoluteValue: ''
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

  // Dropdown data states
  const [unitTypes, setUnitTypes] = useState([]);
  const [modes, setModes] = useState([]);
  const [units, setUnits] = useState([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [unitTypesRes, modesRes, unitsRes] = await Promise.all([
          axios.get('/master/unit-type-list'),
          axios.get('/master/mode-list'),
          axios.get('/master/units-list')
        ]);

        if (unitTypesRes.data.status && unitTypesRes.data.data) {
          setUnitTypes(unitTypesRes.data.data);
        }

        if (modesRes.data.status && modesRes.data.data) {
          setModes(modesRes.data.data);
        }

        if (unitsRes.data.status && unitsRes.data.data) {
          setUnits(unitsRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        toast.error("Failed to load dropdown data");
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      if (!urlParams.id || !urlParams.fid || !urlParams.cid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/material/get-mastermatrix-byid`, {
          params: {
            masterid: urlParams.fid,
            certificateid: urlParams.cid,
            id: urlParams.id
          }
        });
        
        if (response.data && response.data.status) {
          const data = response.data.data;
          setFormData({
            unityType: data.unittype || '',
            mode: data.mode || '',
            unit: data.unit || '',
            instrumentRangeMin: data.instrangemin || '',
            instrumentRangeMax: data.instrangemax || '',
            calibratedRangeMin: data.calibratedrangemin || '',
            calibratedRangeMax: data.calibratedrangemax || '',
            leastCount: data.leastcount || '',
            stability: data.stability || '',
            remarks: data.remark || '',
            uniformity: data.uniformity || '',
            percentageOfRange: data.accuracyrange || '',
            percentageOfMeasurement: data.accuracymeasrement || '',
            absoluteValue: data.accuracyabsolute || ''
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

    if (!formData.instrumentRangeMin) {
      toast.error('Please enter Instrument Range Min');
      return;
    }

    if (!formData.instrumentRangeMax) {
      toast.error('Please enter Instrument Range Max');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        id: parseInt(urlParams.id),
        masterid: parseInt(urlParams.fid),
        certificateid: parseInt(urlParams.cid),
        unittype: formData.unityType,
        mode: formData.mode,
        unit: parseInt(formData.unit),
        instrangemin: parseFloat(formData.instrumentRangeMin) || 0,
        instrangemax: parseFloat(formData.instrumentRangeMax) || 0,
        calibratedrangemin: parseFloat(formData.calibratedRangeMin) || 0,
        calibratedrangemax: parseFloat(formData.calibratedRangeMax) || 0,
        leastcount: parseFloat(formData.leastCount) || 0,
        stability: parseFloat(formData.stability) || 0,
        remark: formData.remarks || '',
        uniformity: parseFloat(formData.uniformity) || 0,
        accuracyrange: parseFloat(formData.percentageOfRange) || 0,
        accuracymeasrement: parseFloat(formData.percentageOfMeasurement) || 0,
        accuracyabsolute: parseFloat(formData.absoluteValue) || 0
      };

      const response = await axios.post(`/material/update-mastermatrix`, payload);
      
      if (response.data?.status) {
        toast.success(response.data?.message || "Matrix has been updated successfully");
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
          <h1 className="text-2xl font-semibold text-gray-800">Edit Master Matrix Form</h1>
          <Button
            className="h-8 space-x-1.5 rounded-md px-3 text-xs"
            color="primary"
            onClick={handleBackNavigation}
          >
            ← Back to Master Detail Entry List
          </Button>
        </div>

        <Card className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-4">
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

            {/* Unit */}
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

            {/* Instrument range min */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Instrument range min
              </label>
              <div className="col-span-9">
                <Input 
                  type="text"
                  className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.instrumentRangeMin}
                  onChange={(e) => handleInputChange('instrumentRangeMin', e.target.value)}
                  placeholder="Enter instrument range min"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Instrument range max */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Instrument range max
              </label>
              <div className="col-span-9">
                <Input 
                  type="text"
                  className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.instrumentRangeMax}
                  onChange={(e) => handleInputChange('instrumentRangeMax', e.target.value)}
                  placeholder="Enter instrument range max"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Calibrated range min */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Calibrated range min
              </label>
              <div className="col-span-9">
                <Input 
                  type="text"
                  className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.calibratedRangeMin}
                  onChange={(e) => handleInputChange('calibratedRangeMin', e.target.value)}
                  placeholder="Enter calibrated range min"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Calibrated range max */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Calibrated range max
              </label>
              <div className="col-span-9">
                <Input 
                  type="text"
                  className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.calibratedRangeMax}
                  onChange={(e) => handleInputChange('calibratedRangeMax', e.target.value)}
                  placeholder="Enter calibrated range max"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Leastcount */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Leastcount
              </label>
              <div className="col-span-9">
                <Input 
                  type="text"
                  className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.leastCount}
                  onChange={(e) => handleInputChange('leastCount', e.target.value)}
                  placeholder="Enter leastcount"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Stability */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Stability
              </label>
              <div className="col-span-9">
                <Input 
                  type="text"
                  className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.stability}
                  onChange={(e) => handleInputChange('stability', e.target.value)}
                  placeholder="Enter stability"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Remarks
              </label>
              <div className="col-span-9">
                <Input 
                  type="text"
                  className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Enter remarks"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Uniformity */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Uniformity
              </label>
              <div className="col-span-9">
                <Input 
                  type="text"
                  className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.uniformity}
                  onChange={(e) => handleInputChange('uniformity', e.target.value)}
                  placeholder="Enter uniformity"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Accuracy Section */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Accuracy</h2>
              
              {/* % of Range */}
              <div className="grid grid-cols-12 gap-4 items-center mb-4">
                <label className="col-span-3 text-right text-gray-700 font-medium">
                  % of Range
                </label>
                <div className="col-span-9">
                  <Input 
                    type="text"
                    className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                    value={formData.percentageOfRange}
                    onChange={(e) => handleInputChange('percentageOfRange', e.target.value)}
                    placeholder="Enter % of range"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* % of measurement */}
              <div className="grid grid-cols-12 gap-4 items-center mb-4">
                <label className="col-span-3 text-right text-gray-700 font-medium">
                  % of measurement
                </label>
                <div className="col-span-9">
                  <Input 
                    type="text"
                    className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                    value={formData.percentageOfMeasurement}
                    onChange={(e) => handleInputChange('percentageOfMeasurement', e.target.value)}
                    placeholder="Enter % of measurement"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Absolute value */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <label className="col-span-3 text-right text-gray-700 font-medium">
                  Absolute value
                </label>
                <div className="col-span-9">
                  <Input 
                    type="text"
                    className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                    value={formData.absoluteValue}
                    onChange={(e) => handleInputChange('absoluteValue', e.target.value)}
                    placeholder="Enter absolute value"
                    disabled={saving}
                  />
                </div>
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

export default EditMasterMatrixForm;