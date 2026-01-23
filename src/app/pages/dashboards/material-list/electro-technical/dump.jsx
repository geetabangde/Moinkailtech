import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from 'components/ui';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';

const Dump = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const instrumentId = id;
  
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    serialNo: '',
    quantity: '',
    location: '', 
    reasonForDumping: ''
  });

  const [apiData, setApiData] = useState({
    instrumentId: null,
    locationId: null,
    typeofuse: null,
    quantity: null,
    issueStatus: null
  });

  const [loading, setLoading] = useState({
    page: true,
    submitting: false
  });
  const [errors, setErrors] = useState({});

  // Function to fetch location name from labs table
  const fetchLocationName = async (locationId) => {
    if (!locationId) return 'N/A';
    
    try {
      console.log('🔍 Fetching location name for ID:', locationId);
      
      const response = await axios.get(`/master/get-lab-byid/${locationId}`);
      
      console.log('✅ Location API Response:', response.data);
      
      const locationName = response.data?.data?.name;
      
      console.log('📍 Extracted location name:', locationName);
      
      if (locationName && locationName !== 'Not Applicable' && locationName !== '') {
        return locationName;
      }
      
      console.warn('⚠️ No valid location name found, using ID');
      return locationId;
    } catch (err) {
      console.error('❌ Error fetching location name:', err.message);
      return locationId;
    }
  };

  useEffect(() => {
    const loadInstrumentData = async () => {
      if (!instrumentId) {
        toast.error('No instrument ID provided in URL');
        setTimeout(() => navigate(-1), 1500);
        return;
      }

      try {
        setLoading(prev => ({ ...prev, page: true }));
        
        console.log('📡 Fetching instrument data for ID:', instrumentId);
        
        const response = await axios.get(`/material/get-mm-instrument-byid?id=${instrumentId}`);
        const instrumentData = response.data?.data?.instrument || {};
        
        console.log('✅ Full API Response:', response.data);
        console.log('✅ Instrument Data:', instrumentData);
        
        if (!instrumentData || Object.keys(instrumentData).length === 0) {
          toast.error('Instrument not found');
          setTimeout(() => navigate(-1), 2000);
          return;
        }
        
        // ✅ Extract exact values from API response
        const extractedData = {
          id: instrumentData.id,                              // 96
          typeofuse: parseInt(instrumentData.typeofuse),      // 2
          quantity: instrumentData.quantity || '1',           // "1"
          instrumentlocation: instrumentData.instrumentlocation, // "1"
          issuestatus: parseInt(instrumentData.issuestatus)   // 0
        };
        
        console.log('📊 Extracted Data:', extractedData);
        
        // Fetch location name
        let locationName = 'N/A';
        if (extractedData.instrumentlocation) {
          locationName = await fetchLocationName(extractedData.instrumentlocation);
          console.log('🏢 Final location name:', locationName);
        }
        
        // Set form data for display
        setFormData({
          name: instrumentData.name || '',
          idNumber: instrumentData.idno || '',
          serialNo: instrumentData.serialno || '',
          quantity: extractedData.quantity,
          location: locationName,
          reasonForDumping: ''
        });
        
        // ✅ Set API data for submission - these exact values will be sent
        setApiData({
          instrumentId: extractedData.id,                                    // mminstid
          locationId: parseInt(extractedData.instrumentlocation),            // location
          typeofuse: extractedData.typeofuse,                                // typeofuse
          quantity: parseInt(extractedData.quantity) || 1,                   // qty
          issueStatus: extractedData.issuestatus
        });
        
        console.log('✅ Form data prepared successfully');
        console.log('📦 API Data that will be sent:', {
          mminstid: extractedData.id,
          location: parseInt(extractedData.instrumentlocation),
          typeofuse: extractedData.typeofuse,
          qty: parseInt(extractedData.quantity) || 1
        });
        
      } catch (error) {
        console.error('❌ Error loading instrument:', error);
        console.error('❌ Error details:', error.response?.data);
        
        const errorMsg = error.response?.data?.message || 'Failed to load instrument data';
        toast.error(errorMsg);
        
        setTimeout(() => navigate(-1), 2000);
      } finally {
        setLoading(prev => ({ ...prev, page: false }));
      }
    };

    loadInstrumentData();
  }, [instrumentId, navigate]);

  const handleBackToElectroTechnical = () => {
    navigate(-1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = async () => {
    // Validation
    const newErrors = {};
    
    if (!formData.reasonForDumping.trim()) {
      newErrors.reasonForDumping = 'This field is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in the reason for dumping');
      return;
    }
    
    // Validate required API data
    if (!apiData.instrumentId) {
      toast.error('Instrument ID is missing. Cannot submit dump request.');
      console.error('❌ Missing instrumentId. API Data:', apiData);
      return;
    }
    
    if (!apiData.locationId) {
      toast.error('Location ID is missing. Cannot submit dump request.');
      console.error('❌ Missing locationId. API Data:', apiData);
      return;
    }
    
    if (!apiData.typeofuse) {
      toast.error('Type of use is missing. Cannot submit dump request.');
      console.error('❌ Missing typeofuse. API Data:', apiData);
      return;
    }
    
    const loadingToast = toast.loading('Submitting dump request...');
    
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      
      // ✅ Prepare exact payload as per your requirement
      const requestData = {
        mminstid: apiData.instrumentId,        // 96
        location: apiData.locationId,          // 1
        typeofuse: apiData.typeofuse,          // 2
        qty: apiData.quantity,                 // 1
        reason: formData.reasonForDumping.trim() // "This is for test"
      };
      
      console.log('📤 Submitting dump request with payload:', requestData);
      
      // ✅ Make POST request with proper error handling
      const response = await axios.post('/material/dump-instrument', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Dump response:', response.data);
      
      toast.dismiss(loadingToast);
      
      // ✅ Check response status
      if (response.data?.status === true) {
        toast.success(
          response.data?.message || 'Dump request submitted successfully',
          { duration: 3000 }
        );
        
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      } else {
        toast.error(response.data?.message || 'Failed to add dump request');
      }
      
    } catch (error) {
      console.error('❌ Error submitting dump:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error details:', error.response?.data);
      
      toast.dismiss(loadingToast);
      
      // Better error handling for CORS and network issues
      let errorMessage = 'Failed to submit dump request. Please try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error.request) {
        // Request made but no response (CORS, network issues)
        errorMessage = 'Network error. Please check your connection and try again.';
        console.error('❌ No response received. Possible CORS issue or network problem.');
      } else {
        // Something else went wrong
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { duration: 4000 });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  if (loading.page) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex h-[60vh] items-center justify-center text-gray-600">
          <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 000 8v4a8 8 0 01-8-8z"></path>
          </svg>
          Loading Instrument Data...
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            maxWidth: '500px',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-gray-900 ml-12">Add Dump MM Instrument</h1>
            <Button
              variant="outline"
              onClick={handleBackToElectroTechnical}
              className="flex items-center space-x-2 text-white bg-indigo-500 hover:bg-fuchsia-500"
            >
              <span>←</span>
              <span>Back to Electro Technical</span>
            </Button>
          </div>
        </div>


        {/* Form */}
        <div className="p-6 bg-white">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed"
                  placeholder="Enter name"
                />
              </div>

              {/* Id Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Id Number
                </label>
                <Input
                  type="text"
                  value={formData.idNumber}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed"
                  placeholder="Enter ID number"
                />
              </div>

              {/* Serial No Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial No
                </label>
                <Input
                  type="text"
                  value={formData.serialNo}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed"
                  placeholder="Enter serial number"
                />
              </div>

              {/* Quantity Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <Input
                  type="text"
                  value={formData.quantity}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Location Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  value={formData.location}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed"
                  placeholder="Enter location"
                />
              </div>

              {/* Reason For Dumping Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason For Dumping <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reasonForDumping}
                  onChange={(e) => handleInputChange('reasonForDumping', e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical bg-yellow-50"
                  placeholder="Enter reason for dumping"
                 
                />
                {errors.reasonForDumping && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.reasonForDumping}
                  </p>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-start pt-4">
                <Button
                  onClick={handleSave}
                  disabled={loading.submitting}
                  className="bg-indigo-500 hover:bg-fuchsia-500 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.submitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dump;