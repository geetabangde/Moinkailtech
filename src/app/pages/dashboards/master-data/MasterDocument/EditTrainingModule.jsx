import { useState, useEffect, useCallback } from 'react';
import { Button } from 'components/ui';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';
import { X, Plus } from 'lucide-react';

const EditTrainingModule = () => {
  const navigate = useNavigate();
  const params = useParams();
  
  // CRITICAL FIX: The route uses :id, not :documentId
  const documentId = params.id || params.documentId;
  
  console.log('=== Component Mount Debug ===');
  console.log('All URL params:', params);
  console.log('documentId extracted:', documentId);
  console.log('============================');
  
  const [loading, setLoading] = useState(false);
  const [moduleData, setModuleData] = useState(null);
  
  // CRITICAL FIX: Initialize with empty strings, not undefined
  const [formData, setFormData] = useState({
    modulename: '',
    modulecode: '',
    revno: '',
    frequency: '',
    repeatcycle: '',
    time: '',
    video: '',
    file: null
  });

  const [existingQuestions, setExistingQuestions] = useState([]);
  const [newQuestions, setNewQuestions] = useState([]);

  const fetchTrainingModule = useCallback(async () => {
    console.log('fetchTrainingModule called with documentId:', documentId);
    
    if (!documentId) {
      console.error('No documentId found!');
      console.error('Available params:', params);
      toast.error('Document ID not found in URL');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Making API call to:', `/master/get-training-module-byid/${documentId}`);
      
      const response = await axios.get(`/master/get-training-module-byid/${documentId}`);
      
      console.log('=== API Response Debug ===');
      console.log('Full Response:', response.data);
      console.log('Document:', response.data.document);
      console.log('Document Name:', response.data.document?.name);
      console.log('Module:', response.data.module);
      console.log('Questions:', response.data.questions);
      console.log('========================');
      
      if (response.data.status === true || response.data.status === 'true') {
        const data = response.data;

        // Store the document data
        const documentData = data.document;
        setModuleData(documentData);
        
        console.log('Document Data extracted:');
        console.log('- name:', documentData?.name);
        console.log('- code:', documentData?.code);
        console.log('- revno:', documentData?.revno);
        
        // CRITICAL FIX: Force React to update by using functional setState
        setFormData(() => {
          const updatedFormData = {
            // Document fields - ALWAYS use document data
            modulename: documentData?.name || '',
            modulecode: documentData?.code || '',
            revno: documentData?.revno || '',
            // Module fields - use module data if exists, otherwise empty
            frequency: data.module?.frequency || '',
            repeatcycle: data.module?.repeatcycle || '',
            time: data.module?.time || '',
            video: data.module?.video || '',
            file: null
          };
          
          console.log('Updated FormData:', updatedFormData);
          return updatedFormData;
        });

        // Set existing questions
        if (data.questions && data.questions.length > 0) {
          setExistingQuestions(data.questions);
        } else {
          setExistingQuestions([]);
        }

        toast.success('Training module loaded successfully');
      } else {
        toast.error('Failed to load training module');
      }
    } catch (error) {
      console.error('Error fetching training module:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Error loading data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [documentId, params]);

  useEffect(() => {
    console.log('useEffect triggered');
    console.log('documentId:', documentId);
    console.log('params:', params);
    
    if (documentId) {
      fetchTrainingModule();
    } else {
      console.error('documentId is missing in useEffect');
      console.error('Available params:', params);
      toast.error('Document ID is missing from the URL');
    }
  }, [documentId, fetchTrainingModule, params]);

  // Debug: Log formData changes
  useEffect(() => {
    console.log('FormData state updated:', formData);
    console.log('- modulename:', formData.modulename);
    console.log('- modulecode:', formData.modulecode);
    console.log('- revno:', formData.revno);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed - ${name}:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPG, PNG, GIF)');
        e.target.value = '';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      toast.success('File selected: ' + file.name);
    }
  };

  const handleNewQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuestions];
    updatedQuestions[index][field] = value;
    setNewQuestions(updatedQuestions);
  };

  const addNewQuestion = () => {
    setNewQuestions([...newQuestions, {
      question: '',
      opt1: '',
      opt2: '',
      opt3: '',
      opt4: '',
      ans: 'opt1',
      expaination: ''
    }]);
  };

  const removeNewQuestion = (index) => {
    const updatedQuestions = newQuestions.filter((_, i) => i !== index);
    setNewQuestions(updatedQuestions);
  };

  const deleteExistingQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/master/delete-training-module-question', {
        queId: questionId,
        documentid: documentId
      });

      if (response.data.status === true || response.data.status === 'true') {
        setExistingQuestions(existingQuestions.filter(q => q.id !== questionId));
        toast.success('Question deleted successfully');
      } else {
        toast.error('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Error deleting question');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== Submit Debug ===');
    console.log('moduleData:', moduleData);
    console.log('formData:', formData);
    console.log('documentId:', documentId);

    // Validation
    if (!formData.frequency) {
      toast.error('Please select frequency');
      return;
    }
    if (!formData.repeatcycle) {
      toast.error('Please select cycle repeat interval');
      return;
    }
    if (!formData.time) {
      toast.error('Please enter time to read');
      return;
    }

    // Validate new questions only if there are any
    if (newQuestions.length > 0) {
      for (let i = 0; i < newQuestions.length; i++) {
        const q = newQuestions[i];
        if (!q.question || !q.opt1 || !q.opt2 || !q.opt3 || !q.opt4 || !q.expaination) {
          toast.error(`Please fill all fields in new question ${i + 1}`);
          return;
        }
      }
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      
      // CRITICAL: Use module name from formData (which has document name)
      const moduleNameToSend = formData.modulename;
      
      console.log('Module name being sent:', moduleNameToSend);
      
      if (!moduleNameToSend) {
        toast.error('Module name is missing. Please refresh and try again.');
        setLoading(false);
        return;
      }
      
      formDataToSend.append('modulename', moduleNameToSend);
      formDataToSend.append('documentid', documentId);
      formDataToSend.append('frequency', formData.frequency);
      formDataToSend.append('repeatcycle', formData.repeatcycle);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('video', formData.video || '');
      
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      // Add new questions if any
      if (newQuestions.length > 0) {
        newQuestions.forEach((q) => {
          formDataToSend.append('question[]', q.question);
          formDataToSend.append('opt1[]', q.opt1);
          formDataToSend.append('opt2[]', q.opt2);
          formDataToSend.append('opt3[]', q.opt3);
          formDataToSend.append('opt4[]', q.opt4);
          formDataToSend.append('ans[]', q.ans);
          formDataToSend.append('expaination[]', q.expaination);
        });
      }

      console.log('Sending FormData to API...');

      const response = await axios.post('/master/add-training-module', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Submit Response:', response.data);

      if (response.data.status === true || response.data.status === 'true') {
        toast.success('Training module updated successfully!');
        
        // Refresh data to show newly added questions
        await fetchTrainingModule();
        
        // Clear new questions form
        setNewQuestions([]);
        
        // Clear file input
        setFormData(prev => ({
          ...prev,
          file: null
        }));
        
        // Reset file input element
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        
      } else {
        toast.error('Error updating training module: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Error submitting form: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Show error if no documentId
  if (!documentId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-300 rounded-lg p-8 max-w-md">
          <div className="text-red-600 text-xl font-bold mb-4">⚠️ Error</div>
          <div className="text-red-700 mb-4">
            Document ID is missing from the URL
          </div>
          <div className="text-sm text-red-600 mb-4">
            Available params: {JSON.stringify(params)}
          </div>
          <Button 
            onClick={() => navigate("/dashboards/master-data/document-master")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Go Back to Document List
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !moduleData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">Loading...</div>
          <div className="text-sm text-gray-500 mt-2">Document ID: {documentId}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Training Module</h1>
          <Button 
            className="flex items-center gap-2"
            color="primary"
            variant="outline"
            onClick={() => navigate("/dashboards/master-data/document-master")}
          >
            &lt;&lt; Back
          </Button>
        </div>

        {/* Enhanced Debug Info */}
        {/* <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p className="text-sm font-semibold mb-2">Debug Info:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <strong>Document ID:</strong> {documentId}
            </div>
            <div>
              <strong>Module Data Loaded:</strong> {moduleData ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Module Name (state):</strong> {formData.modulename || '(empty)'}
            </div>
            <div>
              <strong>Module Code (state):</strong> {formData.modulecode || '(empty)'}
            </div>
            <div>
              <strong>Rev No (state):</strong> {formData.revno || '(empty)'}
            </div>
            <div>
              <strong>API Document Name:</strong> {moduleData?.name || 'N/A'}
            </div>
          </div>
        </div> */}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Training Module Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Training Module</h3>

              {/* Module Name - CRITICAL FIX: Use value prop with fallback */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Name
                </label>
                <input
                  type="text"
                  name="modulename"
                  value={formData.modulename || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  placeholder="Loading..."
                />
              </div>

              {/* Module Code - CRITICAL FIX: Show actual value or N/A */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Code
                </label>
                <input
                  type="text"
                  name="modulecode"
                  value={formData.modulecode || 'N/A'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Rev no - CRITICAL FIX: Show actual value or N/A */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rev no
                </label>
                <input
                  type="text"
                  name="revno"
                  value={formData.revno || 'N/A'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Frequency */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Frequency</option>
                  {[...Array(37)].map((_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>

              {/* Cycle Repeat Interval */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cycle Repeat Interval <span className="text-red-500">*</span>
                </label>
                <select
                  name="repeatcycle"
                  value={formData.repeatcycle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Cycle Repeat Interval</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              {/* File (Image) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File (Image)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.file && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <span>✓</span> Selected: {formData.file.name}
                  </p>
                )}
              </div>

              {/* Time To read */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time To read (in min) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  min="1"
                  max="99"
                  placeholder="Enter time in minutes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Video Link */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Link
                </label>
                <textarea
                  name="video"
                  value={formData.video}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter YouTube or video URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right Column - Existing Questions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                Existing Questions ({existingQuestions.length})
              </h3>
              
              {existingQuestions.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No existing questions found</p>
                  <p className="text-sm text-gray-400 mt-2">Add new questions below</p>
                </div>
              ) : (
                existingQuestions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-lg shadow p-6 relative border-l-4 border-blue-500">
                    <button
                      type="button"
                      onClick={() => deleteExistingQuestion(question.id)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition"
                      title="Delete Question"
                    >
                      <X size={20} />
                    </button>

                    <h4 className="text-md font-semibold mb-4 border-b pb-2 text-blue-700">
                      Question {index + 1}
                    </h4>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                        {question.question}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                          <strong className="text-blue-600">A:</strong> {question.opt1}
                        </div>
                      </div>
                      <div>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                          <strong className="text-blue-600">B:</strong> {question.opt2}
                        </div>
                      </div>
                      <div>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                          <strong className="text-blue-600">C:</strong> {question.opt3}
                        </div>
                      </div>
                      <div>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                          <strong className="text-blue-600">D:</strong> {question.opt4}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer
                        </label>
                        <div className="px-3 py-2 bg-green-50 border border-green-300 rounded font-semibold text-green-700 text-center">
                          {question.ans === 'opt1' ? 'A' : 
                           question.ans === 'opt2' ? 'B' : 
                           question.ans === 'opt3' ? 'C' : 'D'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explanation
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm">
                          {question.expaination}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Questions Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Add New Questions {newQuestions.length > 0 && `(${newQuestions.length})`}
              </h3>
              <Button
                type="button"
                onClick={addNewQuestion}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition shadow-md"
              >
                <Plus size={18} />
                Add Question
              </Button>
            </div>

            {newQuestions.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <p className="text-blue-700 font-medium">
                  Click &quot;Add Question&quot; button to add new questions to this module
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {newQuestions.map((question, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 relative border-l-4 border-yellow-500">
                    <button
                      type="button"
                      onClick={() => removeNewQuestion(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition"
                      title="Remove Question"
                    >
                      <X size={20} />
                    </button>

                    <h4 className="text-md font-semibold mb-4 border-b pb-2 text-yellow-700">
                      New Question {index + 1}
                    </h4>

                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleNewQuestionChange(index, 'question', e.target.value)}
                        placeholder="Enter question"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Option A *</label>
                        <input
                          type="text"
                          value={question.opt1}
                          onChange={(e) => handleNewQuestionChange(index, 'opt1', e.target.value)}
                          placeholder="Option A"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Option B *</label>
                        <input
                          type="text"
                          value={question.opt2}
                          onChange={(e) => handleNewQuestionChange(index, 'opt2', e.target.value)}
                          placeholder="Option B"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Option C *</label>
                        <input
                          type="text"
                          value={question.opt3}
                          onChange={(e) => handleNewQuestionChange(index, 'opt3', e.target.value)}
                          placeholder="Option C"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Option D *</label>
                        <input
                          type="text"
                          value={question.opt4}
                          onChange={(e) => handleNewQuestionChange(index, 'opt4', e.target.value)}
                          placeholder="Option D"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Answer <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={question.ans}
                          onChange={(e) => handleNewQuestionChange(index, 'ans', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        >
                          <option value="opt1">A</option>
                          <option value="opt2">B</option>
                          <option value="opt3">C</option>
                          <option value="opt4">D</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Explanation <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={question.expaination}
                          onChange={(e) => handleNewQuestionChange(index, 'expaination', e.target.value)}
                          placeholder="Enter explanation"
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-3 justify-end border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboards/master-data/document-master")}
              disabled={loading}
              className="px-6"
            >
              Cancel
            </Button>
            <button
              type="submit"
               onClick={() => navigate("/dashboards/master-data/document-master/view-training-modules")}
              disabled={loading}
              className={`px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition shadow-md ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTrainingModule;