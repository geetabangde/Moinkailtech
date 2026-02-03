import { useState, useEffect, useCallback } from 'react';
import { Button } from 'components/ui';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';
import { X, Plus } from 'lucide-react';

const EditTrainingModule = () => {
  const navigate = useNavigate();
  const { documentId } = useParams(); // Get documentId from URL params
  
  const [loading, setLoading] = useState(false);
  const [moduleData, setModuleData] = useState(null);
  
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

  // Existing questions from database
  const [existingQuestions, setExistingQuestions] = useState([]);
  
  // New questions to be added
  const [newQuestions, setNewQuestions] = useState([
    {
      question: '',
      opt1: '',
      opt2: '',
      opt3: '',
      opt4: '',
      ans: 'opt1',
      expaination: ''
    }
  ]);

  // FIX 1: wrapped in useCallback so the reference is stable and can be
  // listed in the useEffect dependency array without causing an infinite loop.
  const fetchTrainingModule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/master/get-training-module-byid/${documentId}`);
      
      if (response.data.status === true || response.data.status === 'true') {
        const data = response.data; // API returns document/module/questions at top level directly

        // Set module basic data
        setModuleData(data.document);
        setFormData({
          modulename: data.document?.name || '',
          modulecode: data.document?.code || '',
          revno: data.document?.revno || '',
          frequency: data.module?.frequency || '',       // key is "module", not "training_module"
          repeatcycle: data.module?.repeatcycle || '',
          time: data.module?.time || '',
          video: data.module?.video || '',
          file: null
        });

        // Set existing questions
        if (data.questions && data.questions.length > 0) {
          setExistingQuestions(data.questions);
        }

        toast.success('Training module loaded successfully');
      } else {
        toast.error('Failed to load training module');
      }
    } catch (error) {
      console.error('Error fetching training module:', error);
      toast.error('Error loading data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [documentId]); // only re-created when documentId changes

  useEffect(() => {
    if (documentId) {
      fetchTrainingModule();
    }
  }, [documentId, fetchTrainingModule]); // exhaustive deps satisfied

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  // Handle new question change
  const handleNewQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuestions];
    updatedQuestions[index][field] = value;
    setNewQuestions(updatedQuestions);
  };

  // Add new question
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

  // Remove new question
  const removeNewQuestion = (index) => {
    const updatedQuestions = newQuestions.filter((_, i) => i !== index);
    setNewQuestions(updatedQuestions);
  };

  // Delete existing question
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

    // Validate new questions
    for (let i = 0; i < newQuestions.length; i++) {
      const q = newQuestions[i];
      if (!q.question || !q.opt1 || !q.opt2 || !q.opt3 || !q.opt4 || !q.expaination) {
        toast.error(`Please fill all fields in question ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('documentid', documentId);
      formDataToSend.append('modulename', formData.modulename);
      formDataToSend.append('frequency', formData.frequency);
      formDataToSend.append('repeatcycle', formData.repeatcycle);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('video', formData.video);
      
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      // FIX 2: removed the unused `index` parameter from the callback
      newQuestions.forEach((q) => {
        formDataToSend.append('question[]', q.question);
        formDataToSend.append('opt1[]', q.opt1);
        formDataToSend.append('opt2[]', q.opt2);
        formDataToSend.append('opt3[]', q.opt3);
        formDataToSend.append('opt4[]', q.opt4);
        formDataToSend.append('ans[]', q.ans);
        formDataToSend.append('expaination[]', q.expaination);
      });

      const response = await axios.post('/master/add-training-module', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === true || response.data.status === 'true') {
        toast.success('Training module updated successfully!');
        setTimeout(() => {
          navigate('/dashboards/training/training-modules');
        }, 1500);
      } else {
        toast.error('Error updating training module: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !moduleData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
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
            className="text-blue-600 hover:text-blue-800 font-medium"
            color="primary"
            onClick={() => navigate('/dashboards/training/training-modules')}
          >
            Back to Training module list
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Training Module Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Training Module</h3>

              {/* Module Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Name
                </label>
                <input
                  type="text"
                  name="modulename"
                  value={formData.modulename}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              {/* Module Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Code
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {formData.modulecode}
                </div>
              </div>

              {/* Rev no */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rev no
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                  {formData.revno}
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Frequency</option>
                  {[...Array(36)].map((_, i) => (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Cycle Repeat Interval</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right Column - Existing Questions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Existing Questions</h3>
              
              {existingQuestions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-lg shadow p-6 relative">
                  <button
                    type="button"
                    onClick={() => deleteExistingQuestion(question.id)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>

                  <h4 className="text-md font-semibold mb-4 border-b pb-2">Question {index + 1}</h4>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                      {question.question}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                        <strong>A:</strong> {question.opt1}
                      </div>
                    </div>
                    <div>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                        <strong>B:</strong> {question.opt2}
                      </div>
                    </div>
                    <div>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                        <strong>C:</strong> {question.opt3}
                      </div>
                    </div>
                    <div>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                        <strong>D:</strong> {question.opt4}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded font-semibold">
                        {question.ans === 'opt1' ? 'A' : question.ans === 'opt2' ? 'B' : question.ans === 'opt3' ? 'C' : 'D'}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                        {question.expaination}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Questions Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Questions</h3>
              <Button
                type="button"
                onClick={addNewQuestion}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={18} />
                Add Question
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {newQuestions.map((question, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 relative">
                  {newQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeNewQuestion(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  )}

                  <h4 className="text-md font-semibold mb-4 border-b pb-2">Question {existingQuestions.length + index + 1}</h4>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleNewQuestionChange(index, 'question', e.target.value)}
                      placeholder="Enter question"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <input
                        type="text"
                        value={question.opt1}
                        onChange={(e) => handleNewQuestionChange(index, 'opt1', e.target.value)}
                        placeholder="Option A"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={question.opt2}
                        onChange={(e) => handleNewQuestionChange(index, 'opt2', e.target.value)}
                        placeholder="Option B"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={question.opt3}
                        onChange={(e) => handleNewQuestionChange(index, 'opt3', e.target.value)}
                        placeholder="Option C"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={question.opt4}
                        onChange={(e) => handleNewQuestionChange(index, 'opt4', e.target.value)}
                        placeholder="Option D"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTrainingModule;