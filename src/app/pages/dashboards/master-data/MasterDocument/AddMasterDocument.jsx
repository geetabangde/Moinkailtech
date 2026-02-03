import { useState, useEffect } from 'react';
import { Button } from 'components/ui';
import { useNavigate, useSearchParams } from 'react-router';
import axios from 'utils/axios';
import toast, { Toaster } from 'react-hot-toast';

const AddMasterDocument = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeDocId = searchParams.get('resumeId'); // Get resume document ID from URL
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
    deadlineInDays: '',
    reviewedBy: '',
    approvedBy: '',
    reviewedOn: '',
    isTrainingRequired: 'Yes',
    content: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Dropdown data states
  const [documentTypes, setDocumentTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [companyInfo, setCompanyInfo] = useState([]);

  // Fetch all dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
    
    // If resumeId is present, fetch the document data
    if (resumeDocId) {
      fetchResumeDocument(resumeDocId);
    }
  }, [resumeDocId]);

  const fetchResumeDocument = async (docId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/master/resume-document/${docId}`);
      
      if (response.data.status === true || response.data.status === 'true') {
        const doc = response.data.data.document;
        
        // Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
        const formatDate = (dateStr) => {
          if (!dateStr || dateStr === '0000-00-00' || dateStr === '0000-00-00 00:00:00') return '';
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return '';
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        };

        // Pre-fill form with resume document data
        setFormData({
          documentType: doc.documenttype || '',
          category: doc.category || '',
          orientation: doc.orientation || '',
          letterHead: doc.letterhead || 'None',
          name: doc.name || '',
          documentNo: doc.procedureno || '',
          code: doc.code || '',
          department: doc.department || '',
          issueNo: doc.issueno || '01',
          issueDate: formatDate(doc.issuedate) || '16/10/2025',
          effectiveDate: formatDate(doc.effdate) || '',
          reviewBefore: formatDate(doc.revbefore) || '',
          revNo: doc.revno || '00',
          revDate: formatDate(doc.revdate) || 'NA',
          header: doc.header || 'For Standard Operating Procedure',
          footer: doc.footer || 'Standard Operating Procedure',
          deadlineInDays: doc.deadline || '',
          reviewedBy: doc.reviewedby || '',
          approvedBy: doc.approvedby || '',
          reviewedOn: '',
          isTrainingRequired: doc.istrainingrequired || 'Yes',
          content: doc.content || ''
        });

        toast.success('Document loaded successfully for resuming');
      } else {
        toast.error('Failed to load document data');
      }
    } catch (error) {
      console.error('Error fetching resume document:', error);
      toast.error('Error loading document: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dropdown data in parallel
      const [
        documentTypesRes,
        categoriesRes,
        departmentsRes,
        approversRes,
        companyInfoRes
      ] = await Promise.all([
        axios.get('/master/get-typeof-masterdocument'),
        axios.get('/master/get-document-category'),
        axios.get('/hrm/department-list'),
        axios.get('/approved-by'),
        axios.get('/get-company-info')
      ]);

      // Set document types
      if (documentTypesRes.data.status === 'true' || documentTypesRes.data.status === true) {
        setDocumentTypes(documentTypesRes.data.data || []);
      }

      // Set categories
      if (categoriesRes.data.status === 'true' || categoriesRes.data.status === true) {
        setCategories(categoriesRes.data.data || []);
      }

      // Set departments
      if (departmentsRes.data.status === 'true' || departmentsRes.data.status === true) {
        setDepartments(departmentsRes.data.data || []);
      }

      // Set approvers and reviewers (same data source)
      if (approversRes.data.status === 'true' || approversRes.data.status === true) {
        const approversList = approversRes.data.data || [];
        setApprovers(approversList);
        setReviewers(approversList);
      }

      // Set company info
      if (companyInfoRes.data.status === true || companyInfoRes.data.status === 'true') {
        const company = companyInfoRes.data.data?.company;
        if (company && company.name) {
          setCompanyInfo([company]); // Wrap in array for consistent handling
        }
      }

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Error loading form data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      // Prepare payload according to API structure
      const payload = {
        documenttype: parseInt(formData.documentType),
        category: parseInt(formData.category),
        orientation: formData.orientation,
        letterhead: formData.letterHead,
        name: formData.name,
        code: formData.code,
        procedureno: formData.documentNo,
        department: parseInt(formData.department),
        issueno: formData.issueNo,
        issuedate: formData.issueDate,
        effdate: formData.effectiveDate,
        revbefore: formData.reviewBefore,
        revno: formData.revNo,
        revdate: formData.revDate === 'NA' ? formData.effectiveDate : formData.revDate,
        header: formData.header,
        footer: formData.footer,
        deadline: parseInt(formData.deadlineInDays),
        reviewedby: parseInt(formData.reviewedBy),
        approvedby: parseInt(formData.approvedBy),
        reviewed_on: formData.reviewedOn || formData.reviewBefore,
        istrainingrequired: formData.isTrainingRequired,
        content: formData.content
      };

      const response = await axios.post('/master/add-master-document', payload);

      if (response.data.status === true || response.data.status === 'true') {
        const documentId = response.data.document_id;
        toast.success(`Document saved successfully! Document ID: ${documentId}`);
        console.log('Document path:', response.data.docpath);
        
        // If training is required, redirect to training module edit page
        if (formData.isTrainingRequired === 'Yes') {
          setTimeout(() => {
            navigate(`/dashboards/master-data/document-master/edit/${documentId}`);
            
          }, 1500);
        } else {
          // Navigate back to document master list
          setTimeout(() => {
            navigate("/dashboards/master-data/document-master");
          }, 1500);
        }
      } else {
        toast.error('Error saving document: ' + (response.data.message || 'Unknown error'));
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // Save without validation (draft save)
    try {
      setLoading(true);

      const payload = {
        documenttype: formData.documentType ? parseInt(formData.documentType) : 0,
        category: formData.category ? parseInt(formData.category) : 0,
        orientation: formData.orientation,
        letterhead: formData.letterHead,
        name: formData.name,
        code: formData.code,
        procedureno: formData.documentNo,
        department: formData.department ? parseInt(formData.department) : 0,
        issueno: formData.issueNo,
        issuedate: formData.issueDate,
        effdate: formData.effectiveDate,
        revbefore: formData.reviewBefore,
        revno: formData.revNo,
        revdate: formData.revDate === 'NA' ? formData.effectiveDate : formData.revDate,
        header: formData.header,
        footer: formData.footer,
        deadline: formData.deadlineInDays ? parseInt(formData.deadlineInDays) : 0,
        reviewedby: formData.reviewedBy ? parseInt(formData.reviewedBy) : 0,
        approvedby: formData.approvedBy ? parseInt(formData.approvedBy) : 0,
        reviewed_on: formData.reviewedOn || formData.reviewBefore,
        istrainingrequired: formData.isTrainingRequired,
        content: formData.content
      };

      const response = await axios.post('/master/add-master-document', payload);

      if (response.data.status === true || response.data.status === 'true') {
        toast.success('Form saved successfully as draft!');
        console.log('Document path:', response.data.docpath);
      } else {
        toast.error('Error saving form: ' + (response.data.message || 'Unknown error'));
      }

    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Error saving form: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && documentTypes.length === 0) {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {resumeDocId ? 'Resume Master Document' : 'Add Master Document'}
          </h1>
          <Button 
            className="text-blue-600 hover:text-blue-800 font-medium"
            color="primary"
            onClick={() => navigate("/dashboards/master-data/document-master")}
          >
            Back
          </Button>
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
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
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
                <option value="horizontal">Vertical</option>
                <option value="vertical">Horizontal</option>
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
                {companyInfo && companyInfo.length > 0 && companyInfo.map((company, index) => (
                  <option key={index} value={company.name}>
                    {company.name}
                  </option>
                ))}
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
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
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
                placeholder="DD/MM/YYYY"
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
                placeholder="DD/MM/YYYY"
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
                <option value="For Quality Manual">For Quality Manual</option>
              </select>
            </div>

            {/* Footer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer:
              </label>
              <select
                name="footer"
                value={formData.footer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Standard Operating Procedure">Standard Operating Procedure</option>
                <option value="Quality Manual">Quality Manual</option>
              </select>
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
                type="number"
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
                {reviewers.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.prefix} {reviewer.firstname} {reviewer.middlename} {reviewer.lastname}
                  </option>
                ))}
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
                {approvers.map((approver) => (
                  <option key={approver.id} value={approver.id}>
                    {approver.prefix} {approver.firstname} {approver.middlename} {approver.lastname}
                  </option>
                ))}
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
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  Words: {formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className={`px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-md transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMasterDocument;