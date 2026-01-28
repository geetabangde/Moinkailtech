import  { useState } from 'react';
import { Button } from 'components/ui';
import { useNavigate } from 'react-router';

const AddMasterDocument = () => {
  const navigate= useNavigate();
  const [formData, setFormData] = useState({
    documentType: '',
    category: '',
    orientation: '',
    letterHead: 'None',
    name: '',
    documentNo: '',
    code: '',
    department: '',
    issueNo: '01',
    issueDate: '16/10/2025',
    effectiveDate: '',
    reviewBefore: '',
    revNo: '00',
    revDate: 'NA',
    header: 'For Standard Operating Procedure',
    footer: 'Standard Operating Procedure',
    deadline: '',
    reviewedBy: '',
    approvedBy: '',
    isTrainingRequired: 'Yes',
    content: ''
  });

  const [errors, setErrors] = useState({});



  const validateForm = () => {
    const newErrors = {};

    if (!formData.documentType) newErrors.documentType = 'This field is required';
    if (!formData.category) newErrors.category = 'This field is required';
    if (!formData.orientation) newErrors.orientation = 'This field is required';
    if (!formData.name) newErrors.name = 'This field is required';
    if (!formData.documentNo) newErrors.documentNo = 'This field is required';
    if (!formData.department) newErrors.department = 'This field is required';
    if (!formData.effectiveDate) newErrors.effectiveDate = 'This field is required';
    if (!formData.reviewBefore) newErrors.reviewBefore = 'This field is required';
    if (!formData.deadlineInDays) newErrors.deadlineInDays = 'This field is required';
    if (!formData.reviewedBy) newErrors.reviewedBy = 'This field is required';
    if (!formData.approvedBy) newErrors.approvedBy = 'This field is required';
    if (!formData.isTrainingRequired) newErrors.isTrainingRequired = 'This field is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRadioChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isTrainingRequired: e.target.value
    }));
    if (errors.isTrainingRequired) {
      setErrors(prev => ({
        ...prev,
        isTrainingRequired: ''
      }));
    }
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log('Form saved:', formData);
    alert('Form saved successfully!');
  };

  const handlePreview = (e) => {
    e.preventDefault();
    console.log('Form preview:', formData);
    alert('Preview opened!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Master Document</h1>
           <Button className="text-blue-600 hover:text-blue-800 font-medium"
           color = "primary"
             onClick={() =>
                 navigate("/dashboards/master-data/document-master")
             }
          
          
          
           >&lt;&lt; Back</Button>
         </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-4">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type:
              </label>
              <div className={errors.documentType ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.documentType && `This field is required x`}
              </div>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.documentType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select</option>
                <option value="SOP">Standard Operating Procedure</option>
                <option value="POLICY">Policy</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category:
              </label>
              <div className={errors.category ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.category && `This field is required x`}
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="COMPLIANCE">Compliance</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientation of the document:
              </label>
              <div className={errors.orientation ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.orientation && `This field is required x`}
              </div>
              <select
                name="orientation"
                value={formData.orientation}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.orientation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select</option>
                <option value="PORTRAIT">Portrait</option>
                <option value="LANDSCAPE">Landscape</option>
              </select>
            </div>

            {/* Letter Head */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Letter Head:
              </label>
              <select
                name="letterHead"
                value={formData.letterHead}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="None">None</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name:
              </label>
              <div className={errors.name ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.name && `This field is required x`}
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500 bg-yellow-50' : 'border-gray-300 bg-yellow-50'
                }`}
              />
            </div>

            {/* Document No/Procedure No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document No./Procedure No:
              </label>
              <div className={errors.documentNo ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.documentNo && `This field is required x`}
              </div>
              <input
                type="text"
                name="documentNo"
                value={formData.documentNo}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.documentNo ? 'border-red-500 bg-yellow-50' : 'border-gray-300 bg-yellow-50'
                }`}
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code:
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department:
              </label>
              <div className={errors.department ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.department && `This field is required x`}
              </div>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select</option>
                <option value="HR">HR</option>
                <option value="OPERATIONS">Operations</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-4 gap-4">
            {/* Issue No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue No:
              </label>
              <input
                type="text"
                name="issueNo"
                value={formData.issueNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date:
              </label>
              <input
                type="text"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date:
              </label>
              <div className={errors.effectiveDate ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.effectiveDate && `This field is required x`}
              </div>
              <input
                type="text"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleInputChange}
                placeholder="DD/MM/YYYY"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.effectiveDate ? 'border-red-500 bg-yellow-50' : 'border-gray-300 bg-yellow-50'
                }`}
              />
            </div>

            {/* Review Before */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Before:
              </label>
              <div className={errors.reviewBefore ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.reviewBefore && `This field is required x`}
              </div>
              <input
                type="text"
                name="reviewBefore"
                value={formData.reviewBefore}
                onChange={handleInputChange}
                placeholder="DD/MM/YYYY"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.reviewBefore ? 'border-red-500 bg-yellow-50' : 'border-gray-300 bg-yellow-50'
                }`}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-4 gap-4">
            {/* Rev No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rev No:
              </label>
              <input
                type="text"
                name="revNo"
                value={formData.revNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Rev Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rev Date:
              </label>
              <input
                type="text"
                name="revDate"
                value={formData.revDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Header */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Header:
              </label>
              <select
                name="header"
                value={formData.header}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="For Standard Operating Procedure">For Standard Operating Procedure</option>
              </select>
            </div>

            {/* Footer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer:
              </label>
              <input
                type="text"
                name="footer"
                value={formData.footer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-4 gap-4">
            {/* Dead line(in days) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dead line(in days):
              </label>
              <div className={errors.deadlineInDays ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.deadlineInDays && `This field is required x`}
              </div>
              <input
                type="text"
                name="deadlineInDays"
                value={formData.deadlineInDays}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.deadlineInDays ? 'border-red-500 bg-yellow-50' : 'border-gray-300 bg-yellow-50'
                }`}
              />
            </div>

            {/* Reviewed by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reviewed by:
              </label>
              <div className={errors.reviewedBy ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.reviewedBy && `This field is required x`}
              </div>
              <select
                name="reviewedBy"
                value={formData.reviewedBy}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.reviewedBy ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select</option>
                <option value="MANAGER">Manager</option>
                <option value="DIRECTOR">Director</option>
              </select>
            </div>

            {/* Approved BY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approved BY:
              </label>
              <div className={errors.approvedBy ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.approvedBy && `This field is required x`}
              </div>
              <select
                name="approvedBy"
                value={formData.approvedBy}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.approvedBy ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select</option>
                <option value="HEAD_DEPARTMENT">Head of Department</option>
                <option value="CEO">CEO</option>
              </select>
            </div>

            {/* Is Training Required */}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Is Training Required:
              </label>
              <div className={errors.isTrainingRequired ? 'text-red-600 text-xs mb-1' : ''}>
                {errors.isTrainingRequired && `This field is required x`}
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="trainingRequired"
                    value="Yes"
                    checked={formData.isTrainingRequired === 'Yes'}
                    onChange={handleRadioChange}
                    className="w-4 h-4"
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="trainingRequired"
                    value="No"
                    checked={formData.isTrainingRequired === 'No'}
                    onChange={handleRadioChange}
                    className="w-4 h-4"
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content:
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              {/* Toolbar */}
              <div className="bg-gray-50 border-b border-gray-300 p-3">
                {/* Row 1 - File, Edit, Insert, View, Format, Table, Tools */}
                <div className="flex gap-4 mb-3 border-b border-gray-300 pb-3">
                  <button type="button" className="text-sm font-medium text-gray-700 hover:text-gray-900">File</button>
                  <button type="button" className="text-sm font-medium text-gray-700 hover:text-gray-900">Edit</button>
                  <button type="button" className="text-sm font-medium text-gray-700 hover:text-gray-900">Insert</button>
                  <button type="button" className="text-sm font-medium text-gray-700 hover:text-gray-900">View</button>
                  <button type="button" className="text-sm font-medium text-gray-700 hover:text-gray-900">Format</button>
                  <button type="button" className="text-sm font-medium text-gray-700 hover:text-gray-900">Table</button>
                  <button type="button" className="text-sm font-medium text-gray-700 hover:text-gray-900">Tools</button>
                </div>

                {/* Row 2 - Formatting buttons */}
                <div className="flex gap-2 items-center flex-wrap mb-3">
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Undo">←</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Redo">→</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded font-bold" title="Bold">B</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded italic" title="Italic">I</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded underline" title="Underline">U</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded line-through" title="Strikethrough">S</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-sm" title="Superscript">x²</button>
                  <button type="button" className="px-2 py-1 hover:bg-gray-200 rounded text-sm" title="Subscript">x₂</button>
                  <div className="border-l border-gray-300 mx-2 h-5"></div>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Left align">⬅</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Center align">⬌</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Right align">➡</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Justify">≡</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Bullet list">•</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Numbered list">1.</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Decrease indent">«</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Increase indent">»</button>
                  <div className="border-l border-gray-300 mx-2 h-5"></div>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Horizontal line">—</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Table">□</button>
                </div>

                {/* Row 3 - Font options */}
                <div className="flex gap-2 items-center flex-wrap">
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Image">🖼</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded" title="Chart">📊</button>
                  <select className="px-2 py-1 border border-gray-300 rounded text-sm" title="Font Color">
                    <option>A</option>
                  </select>
                  <select className="px-2 py-1 border border-gray-300 rounded text-sm" title="Highlight">
                    <option>A ▼</option>
                  </select>
                  <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                    <option>Font Sizes</option>
                  </select>
                  <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                    <option>Font Family</option>
                  </select>
                  <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                    <option>Formats</option>
                  </select>
                </div>
              </div>

              {/* Editor Content Area */}
              <div className="relative">
                <textarea
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full h-96 px-4 py-3 border-0 focus:outline-none focus:ring-0 resize-none font-sans"
                  placeholder="Enter document content here..."
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">Words: 0</div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-md transition"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-md transition"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-md transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMasterDocument;