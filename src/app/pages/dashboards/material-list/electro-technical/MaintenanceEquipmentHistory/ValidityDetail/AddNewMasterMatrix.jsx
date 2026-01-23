
// import  { useState } from 'react';
// import { Button, Card, Input } from '../../../../../../../components/ui'
// import { useNavigate } from 'react-router';

// const MasterMatrixForm = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     unityType: 'Pressure',
//     mode: 'Not Specified',
//     unit: 'Hectopascal(hPa)',
//     instrumentRangeMin: '',
//     instrumentRangeMax: '',
//     calibratedRangeMin: '',
//     calibratedRangeMax: '',
//     leastCount: '',
//     stability: '',
//     remarks: '',
//     uniformity: '',
//     percentageOfRange: '',
//     percentageOfMeasurement: '',
//     absoluteValue: ''
//   });

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-semibold text-gray-800">Add master Matrix Formssssssssssss</h1>
//           <Button
//            className="h-8 space-x-1.5 rounded-md px-3 text-xs "
//             color="primary"

//           onClick={() => 
//             navigate('/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail')
//           }>
//             ← Back to Master Detail Entry List
//           </Button>
//         </div>

//         {/* Main Form Card */}
//         <Card className="bg-white shadow-sm rounded-lg p-6">
//           <div className="space-y-4">
//             {/* Unity Type */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Unity Type/ parameter
//               </label>
//               <div className="col-span-9">
//                 <select 
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.unityType}
//                   onChange={(e) => handleInputChange('unityType', e.target.value)}
//                 >
//                   <option>Pressure</option>
//                 </select>
//               </div>
//             </div>

//             {/* Mode */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Mode
//               </label>
//               <div className="col-span-9">
//                 <select 
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.mode}
//                   onChange={(e) => handleInputChange('mode', e.target.value)}
//                 >
//                   <option>Not Specified</option>
//                 </select>
//               </div>
//             </div>

//             {/* Unit */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Unit
//               </label>
//               <div className="col-span-9">
//                 <select 
//                   className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.unit}
//                   onChange={(e) => handleInputChange('unit', e.target.value)}
//                 >
//                   <option>Hectopascal(hPa)</option>
//                 </select>
//               </div>
//             </div>

//             {/* Instrument range min */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Instrument range min
//               </label>
//               <div className="col-span-9">
//                 <Input 
//                   type="text"
//                   className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.instrumentRangeMin}
//                   onChange={(e) => handleInputChange('instrumentRangeMin', e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Instrument range max */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Instrument range max
//               </label>
//               <div className="col-span-9">
//                 <Input 
//                   type="text"
//                   className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.instrumentRangeMax}
//                   onChange={(e) => handleInputChange('instrumentRangeMax', e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Calibrated range min */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Calibrated range min
//               </label>
//               <div className="col-span-9">
//                 <Input 
//                   type="text"
//                   className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.calibratedRangeMin}
//                   onChange={(e) => handleInputChange('calibratedRangeMin', e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Calibrated range max */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Calibrated range max
//               </label>
//               <div className="col-span-9">
//                 <Input 
//                   type="text"
//                   className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.calibratedRangeMax}
//                   onChange={(e) => handleInputChange('calibratedRangeMax', e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Leastcount */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Leastcount
//               </label>
//               <div className="col-span-9 ">
//                 <Input 
//                   type="text"
//                   className="flex-1 border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.leastCount}
//                   onChange={(e) => handleInputChange('leastCount', e.target.value)}
//                 />

//               </div>
//             </div>

//             {/* Stability */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Stability
//               </label>
//               <div className="col-span-9 ">
//                 <Input 
//                   type="text"
//                   className="flex-1 border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.stability}
//                   onChange={(e) => handleInputChange('stability', e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Remarks */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Remarks
//               </label>
//               <div className="col-span-9">
//                 <Input 
//                   type="text"
//                   className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.remarks}
//                   onChange={(e) => handleInputChange('remarks', e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Uniformity */}
//             <div className="grid grid-cols-12 gap-4 items-center">
//               <label className="col-span-3 text-right text-gray-700 font-medium">
//                 Uniformity
//               </label>
//               <div className="col-span-9">
//                 <Input 
//                   type="text"
//                   className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                   value={formData.uniformity}
//                   onChange={(e) => handleInputChange('uniformity', e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Accuracy Section */}
//             <div className="mt-6">
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">Accuracy</h2>

//               {/* % of Range */}
//               <div className="grid grid-cols-12 gap-4 items-center mb-4">
//                 <label className="col-span-3 text-right text-gray-700 font-medium">
//                   % of Range
//                 </label>
//                 <div className="col-span-9">
//                   <Input 
//                     type="text"
//                     className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                     value={formData.percentageOfRange}
//                     onChange={(e) => handleInputChange('percentageOfRange', e.target.value)}
//                   />
//                 </div>
//               </div>

//               {/* % of measurement */}
//               <div className="grid grid-cols-12 gap-4 items-center mb-4">
//                 <label className="col-span-3 text-right text-gray-700 font-medium">
//                   % of measurement
//                 </label>
//                 <div className="col-span-9">
//                   <Input 
//                     type="text"
//                     className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                     value={formData.percentageOfMeasurement}
//                     onChange={(e) => handleInputChange('percentageOfMeasurement', e.target.value)}
//                   />
//                 </div>
//               </div>



//               {/* Absolute value */}
//               <div className="grid grid-cols-12 gap-4 items-center">
//                 <label className="col-span-3 text-right text-gray-700 font-medium">
//                   Absolute value
//                 </label>
//                 <div className="col-span-9">
//                   <Input 
//                     type="text"
//                     className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
//                     value={formData.absoluteValue}
//                     onChange={(e) => handleInputChange('absoluteValue', e.target.value)}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Save Button */}
//           <div className="mt-8 flex justify-end">
//             <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium">
//               Save Master Matrix
//             </Button>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default MasterMatrixForm;


















import { useState, useEffect } from 'react';
import { Button, Card, Input } from 'components/ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';

const AddNewMasterMatrix = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get URL params - These will now be available
  const fid = searchParams.get('fid');
  const cid = searchParams.get('cid');
  const labId = searchParams.get('labId');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown data states
  const [unitTypes, setUnitTypes] = useState([]);
  const [modes, setModes] = useState([]);
  const [units, setUnits] = useState([]);

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
      // Fetch all three APIs in parallel
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

      // Set units
      if (unitsRes.data.status && unitsRes.data.data) {
        setUnits(unitsRes.data.data);
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

    if (!formData.instrumentRangeMin) {
      toast.error('Please enter Instrument Range Min');
      return;
    }

    if (!formData.instrumentRangeMax) {
      toast.error('Please enter Instrument Range Max');
      return;
    }

    // Check if fid and cid are available
    if (!fid || !cid) {
      toast.error('Missing required parameters (fid or cid)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare payload with fid as masterid and cid as certificateid
      const payload = {
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
        accuracyabsolute: parseFloat(formData.absoluteValue) || 0,
        masterid: parseInt(fid), // fid is masterid
        certificateid: parseInt(cid), // cid is certificateid
        employeeid: 5 // You might want to get this from auth context
      };

      console.log('Submitting payload:', payload);

      // Make API call
      const response = await axios.post('/material/add-master-matrix', payload);

      if (response.data.status) {
        toast.success(response.data.message || 'Master Matrix added successfully');

        // Navigate back after successful save
        setTimeout(() => {
          handleBackNavigation();
        }, 1500);
      } else {
        toast.error(response.data.message || 'Failed to add master matrix');
      }
    } catch (error) {
      console.error('Error saving master matrix:', error);
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
            <h1 className="text-2xl font-semibold text-gray-800">Add master Matrix Form</h1>
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  className="flex-1 border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.leastCount}
                  onChange={(e) => handleInputChange('leastCount', e.target.value)}
                  placeholder="Enter leastcount"
                  disabled={isSubmitting}
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
                  className="flex-1 border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.stability}
                  onChange={(e) => handleInputChange('stability', e.target.value)}
                  placeholder="Enter stability"
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>
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

export default AddNewMasterMatrix;