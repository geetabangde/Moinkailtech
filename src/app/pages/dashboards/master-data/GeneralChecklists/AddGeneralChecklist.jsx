import { useState } from 'react';
import { Button, Input } from 'components/ui';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';

const MasterChecklistForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get masterid from URL params
  
  const [formData, setFormData] = useState({
    accessoriesname: '',
    quantity: '',
    condition: '',
    remark: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.accessoriesname.trim()) {
      newErrors.accessoriesname = 'General Equipment/Accessories is required';
    }
    
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    }
    
    if (!formData.condition.trim()) {
      newErrors.condition = 'General Condition is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        accessoriesname: formData.accessoriesname,
        quantity: parseInt(formData.quantity) || 0,
        condition: formData.condition,
        remark: formData.remark,
        masterid: parseInt(id) || 96 // Use id from params or default to 96
      };

      console.log('=== SUBMITTING GENERAL CHECKLIST ===');
      console.log('Payload:', payload);

      await axios.post('/material/add-general-checklist', payload);
      
      toast.success('General checklist added successfully!');
      
      // Navigate back to the general checklists list after a short delay
      setTimeout(() => {
        navigate('/dashboards/master-data/general-checklists');
      }, 1000);
      
    } catch (error) {
      console.error('Error adding general checklist:', error);
      toast.error(error.response?.data?.message || 'Failed to add general checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h1 className="text-lg font-medium text-gray-900">Add General Checklist</h1>
          <Button 
            className="bg-indigo-500 hover:bg-fuchsia-500 text-white px-4 py-2 rounded text-sm font-medium"
            onClick={() => navigate('/dashboards/master-data/general-checklists')}
          >
            &lt;&lt; Back to Master Check List
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* General Equipment/Accessories Field */}
            <div className="flex items-center">
              <label className="w-48 text-right pr-4 text-gray-700 font-medium">
                General Equipment/Accessories <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <Input 
                  type="text"
                  value={formData.accessoriesname}
                  onChange={(e) => handleInputChange('accessoriesname', e.target.value)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 ${
                    errors.accessoriesname ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter equipment/accessories name"
                />
                {errors.accessoriesname && (
                  <p className="text-red-500 text-sm mt-1">{errors.accessoriesname}</p>
                )}
              </div>
            </div>

            {/* Quantity Field */}
            <div className="flex items-center">
              <label className="w-48 text-right pr-4 text-gray-700 font-medium">
                Quantity <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <Input 
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>
            </div>

            {/* General Condition Field */}
            <div className="flex items-start">
              <label className="w-48 text-right pr-4 text-gray-700 font-medium pt-2">
                General Condition <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <textarea 
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 resize-none ${
                    errors.condition ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows="4"
                  placeholder="Enter general condition"
                />
                {errors.condition && (
                  <p className="text-red-500 text-sm mt-1">{errors.condition}</p>
                )}
              </div>
            </div>

            {/* Remarks Field */}
            <div className="flex items-center">
              <label className="w-48 text-right pr-4 text-gray-700 font-medium">
                Remarks
              </label>
              <div className="flex-1">
                <Input 
                  type="text"
                  value={formData.remark}
                  onChange={(e) => handleInputChange('remark', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Enter remarks (optional)"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save General Checklist'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterChecklistForm;