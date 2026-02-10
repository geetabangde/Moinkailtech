// AddTrfStartJob.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "utils/axios";
import { toast } from "sonner";

// UI Components
import { Page } from "components/shared/Page";
import { Button } from "components/ui";
import { Input, Textarea, Select as FormSelect } from "components/ui/Form"; // Renamed to avoid conflict
import { Card } from "components/ui/Card";
import ReactSelect from "react-select"; // Using ReactSelect for multi-select

export default function AddTrfStartJob() {
  const navigate = useNavigate();
  
  // Main form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    sample_received_on: "",
    ctype: "",
    customerid: "",
    specificpurpose: "",
    ponumber: "",
    bd: "",
    promoter: "",
    priority: "",
    pcharges: "0",
    pchargestype: "1",
    witness: "",
    wdatetime: "",
    wtime: "",
    wdetail: "",
    wcharges: "0",
    wchargestype: "1",
    wstatus: "1", // Default to "Yes"
    modeofreciept: "1",
    localcontact: "",
    couriername: "",
    dateofdispatch: "",
    docketno: "",
    modeofdispatch: "1",
    paymentstatus: "1",
    modeofpayment: "1",
    detailsofpayment: "",
    paymentamount: "",
    certcollectiondetail: [],
    additionalemail: "",
    certcollectionremark: "",
    returnable: "",
    documents: "",
    deadline: "",
    specialrequest: "",
    notes: "",
    letterrefno: "",
  });

  // Dynamic options state
  const [customerTypes, setCustomerTypes] = useState([]);
  const [specificPurposes, setSpecificPurposes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bds, setBds] = useState([]);
  const [promoters, setPromoters] = useState([]);
  const [choices, setChoices] = useState([]);
  const [modesOfReceipt, setModesOfReceipt] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [certCollectionDetails, setCertCollectionDetails] = useState([]);
  const [workOrderSuggestions] = useState([
    "TRF", "Telephonic", "Email", "Verble", "Letter", "Challan"
  ]);

  // Visibility states
  const [showPriorityCharges, setShowPriorityCharges] = useState(false);
  const [showWitnessDetails, setShowWitnessDetails] = useState(false);
  const [showCourierDetails, setShowCourierDetails] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(true);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");

  // File states
  const [wuploadFile, setWuploadFile] = useState(null);
  const [ruploadFile, setRuploadFile] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Custom styles for react-select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: state.isFocused 
        ? '#3b82f6' 
        : 'rgb(209 213 219)',
      boxShadow: state.isFocused ? '0 0 0 2px rgb(59 130 246 / 0.5)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      },
      backgroundColor: 'white',
      borderRadius: '0.5rem',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#dbeafe',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1e40af',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#3b82f6',
      '&:hover': {
        backgroundColor: '#3b82f6',
        color: 'white',
      },
    }),
  };

  // Fetch all dropdown options
  useEffect(() => {
    fetchAllOptions();
  }, []);

  // Convert dropdown data to react-select format
  const getSelectOptions = (items, labelKey = 'name', valueKey = 'id') => {
    if (!items || !Array.isArray(items)) {
      return [];
    }
    
    return items.map(item => ({
      value: item[valueKey],
      label: item[labelKey] || `Item ${item[valueKey]}`
    }));
  };

  // Get selected values for react-select
  const getSelectedOptions = (selectedIds, options) => {
    if (!selectedIds || !options) return [];
    return options.filter(option => selectedIds.includes(option.value));
  };

  const fetchAllOptions = async () => {
    try {
      setLoadingOptions(true);

      // Fetch all options in parallel
      const [
        customerTypesRes,
        specificPurposesRes,
        customersRes,
        bdsRes,
        promotersRes,
        choicesRes,
        modesOfReceiptRes,
        paymentModesRes,
        certCollectionDetailsRes,
      ] = await Promise.all([
        axios.get("/people/get-customer-type-list"),
        axios.get("/people/get-specific-purpose-list"),
        axios.get("/people/get-all-customers"),
        axios.get("/people/get-customer-bd"),
        axios.get("/people/list-promoters"),
        axios.get("/get-choices"), 
        axios.get("/mode-of-receipt"), 
        axios.get("/mode-of-payment"), 
        axios.get("/certificate-collect-as"), 
      ]);

      // Set states
      if (customerTypesRes.data?.Data) setCustomerTypes(customerTypesRes.data.Data);
      if (specificPurposesRes.data?.data) setSpecificPurposes(specificPurposesRes.data.data);
      if (customersRes.data?.data) setCustomers(customersRes.data.data);
      if (bdsRes.data?.data) setBds(bdsRes.data.data);
      if (promotersRes.data?.data) setPromoters(promotersRes.data.data);
      if (choicesRes.data?.data) setChoices(choicesRes.data.data);
      if (modesOfReceiptRes.data?.data) setModesOfReceipt(modesOfReceiptRes.data.data);
      if (paymentModesRes.data?.data) setPaymentModes(paymentModesRes.data.data);
      if (certCollectionDetailsRes.data?.data) setCertCollectionDetails(certCollectionDetailsRes.data.data);

    } catch (error) {
      console.error("Error fetching options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingOptions(false);
    }
  };

  // Handler for react-select multi-select
  const handleReactSelectChange = (selectedOptions, fieldName) => {
    const selectedValues = selectedOptions 
      ? selectedOptions.map(option => option.value) 
      : [];

    setFormData((prev) => ({
      ...prev,
      [fieldName]: selectedValues,
    }));
  };

  // Handle customer type change
  const handleCustomerTypeChange = (value) => {
    setFormData({ ...formData, ctype: value });
  };

  // Handle customer change
  const handleCustomerChange = async (value) => {
    setFormData({ ...formData, customerid: value });
    
    // Fetch customer details
    if (value) {
      try {
        const response = await axios.get(`/people/get-customer-details?id=${value}`);
        if (response.data?.data) {
          setCustomerDetails(response.data.data);
          setCustomerEmail(response.data.data.email || "");
        }
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    }
  };

  // Handle priority change
  const handlePriorityChange = (value) => {
    setFormData({ ...formData, priority: value });
    setShowPriorityCharges(value !== "2"); // Show if not "No"
  };

  // Handle witness change
  const handleWitnessChange = (value) => {
    setFormData({ ...formData, witness: value });
    setShowWitnessDetails(value !== "2"); // Show if not "No"
  };

  // Handle mode of receipt change
  const handleModeOfReceiptChange = (value) => {
    setFormData({ ...formData, modeofreciept: value });
    setShowCourierDetails(value !== "1"); // Show if not "In Person"
  };

  // Handle payment status change
  const handlePaymentStatusChange = (value) => {
    setFormData({ ...formData, paymentstatus: value });
    setShowPaymentDetails(value !== "2"); // Show if not "No"
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file upload
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (fieldName === 'wupload') {
      setWuploadFile(file);
    } else if (fieldName === 'rupload') {
      setRuploadFile(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = [
      'ctype', 'customerid', 'specificpurpose', 'bd', 'promoter', 
      'priority', 'witness', 'modeofreciept', 'paymentstatus'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'certcollectiondetail') {
          // Handle array for multi-select
          formData[key].forEach(item => {
            submitData.append(`${key}[]`, item);
          });
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append files
      if (wuploadFile) submitData.append('wupload', wuploadFile);
      if (ruploadFile) submitData.append('rupload', ruploadFile);
      
      // Submit to API
      const response = await axios.post('/testing/add-trf-entry', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.status) {
        toast.success("TRF entry created successfully!");
        navigate("/dashboards/testing/trfs-starts-jobs");
      } else {
        toast.error(response.data.message || "Failed to create TRF entry");
      }
      
    } catch (error) {
      console.error("Error creating TRF entry:", error);
      const errorMessage = error.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <Page title="Add TRF Entry">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading form options...</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Add TRF Entry">
      <div className="transition-content w-full pb-5 px-(--margin-x)">
        <div className="mb-4">
          <a 
            href="/dashboards/testing/trfs-starts-jobs" 
            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to TRF Entry List
          </a>
        </div>

        <Card className="mb-6">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">TRF Entry Form</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* 1. SERVICE REQUESTOR */}
            <h4 className="text-md font-semibold mb-4 text-gray-700 border-b pb-2">1. SERVICE REQUESTOR</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  disabled
                  className="w-full"
                />
              </div>

              {/* Sample Received Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sample Received Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="sample_received_on"
                  value={formData.sample_received_on}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Customer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Type <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="ctype"
                  value={formData.ctype}
                  onChange={(e) => handleCustomerTypeChange(e.target.value)}
                  required
                  className="w-full"
                >
                  <option value="">Select Customer Type</option>
                  {customerTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer (Responsible For Payment) <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="customerid"
                  value={formData.customerid}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  required
                  className="w-full"
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.pnumber || customer.phone})
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Specific Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Purpose <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="specificpurpose"
                  value={formData.specificpurpose}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                >
                  <option value="">Select Specific Purpose</option>
                  {specificPurposes.map(purpose => (
                    <option key={purpose.id} value={purpose.id}>
                      {purpose.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Customer Reference */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Reference <span className="text-red-500">*</span>
                </label>
                <Textarea
                  name="letterrefno"
                  value={formData.letterrefno}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  rows={3}
                  placeholder="Enter customer reference details"
                />
              </div>
            </div>

            {/* Customer Details Section - Display when customer is selected */}
            {customerDetails && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">Customer Details:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{customerDetails.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{customerDetails.email}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{customerDetails.phone || customerDetails.pnumber}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Address:</span>
                    <span className="ml-2 font-medium">{customerDetails.address}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. WORK ORDER DETAILS */}
            <h4 className="text-md font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">2. WORK ORDER DETAILS</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Work Order Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Order Number <span className="text-red-500">*</span>
                </label>
                <Input
                  list="workordersuggest"
                  name="ponumber"
                  value={formData.ponumber}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="Enter work order number"
                />
                <datalist id="workordersuggest">
                  {workOrderSuggestions.map(suggestion => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </div>

              {/* Work Order Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Order Upload
                </label>
                <Input
                  type="file"
                  name="wupload"
                  onChange={(e) => handleFileChange(e, 'wupload')}
                  className="w-full"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX</p>
              </div>

              {/* Concerned BD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concerned BD <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="bd"
                  value={formData.bd}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                >
                  <option value="">Select BD</option>
                  {bds.map(bd => (
                    <option key={bd.id} value={bd.id}>
                      {bd.firstname} {bd.lastname}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Engineer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engineer <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="promoter"
                  value={formData.promoter}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                >
                  <option value="">Select Engineer</option>
                  {promoters.map(promoter => (
                    <option key={promoter.id} value={promoter.id}>
                      {promoter.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Priority Sample */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Sample <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="priority"
                  value={formData.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  required
                  className="w-full"
                >
                  <option value="">Select Priority</option>
                  {choices.map(choice => (
                    <option key={choice.id} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Priority Charges - Conditional */}
              {showPriorityCharges && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority Testing Charges
                    </label>
                    <Input
                      type="number"
                      name="pcharges"
                      value={formData.pcharges}
                      onChange={handleInputChange}
                      className="w-full"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Charge Type
                    </label>
                    <FormSelect
                      name="pchargestype"
                      value={formData.pchargestype}
                      onChange={handleInputChange}
                      className="w-full"
                    >
                      <option value="1">₹ (Rupees)</option>
                      <option value="2">% (Percentage)</option>
                    </FormSelect>
                  </div>
                </div>
              )}
            </div>

            {/* 3. WITNESS DETAILS */}
            <h4 className="text-md font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">3. WITNESS DETAILS</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Witness Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Witness Required <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="witness"
                  value={formData.witness}
                  onChange={(e) => handleWitnessChange(e.target.value)}
                  required
                  className="w-full"
                >
                  <option value="">Select</option>
                  {choices.map(choice => (
                    <option key={choice.id} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Witness Details - Conditional */}
              {showWitnessDetails && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Witness Date
                    </label>
                    <Input
                      type="date"
                      name="wdatetime"
                      value={formData.wdatetime}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Witness Time
                    </label>
                    <Input
                      type="time"
                      name="wtime"
                      value={formData.wtime}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Witness Details
                    </label>
                    <Input
                      type="text"
                      name="wdetail"
                      value={formData.wdetail}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Names of persons"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Witness Charges
                      </label>
                      <Input
                        type="number"
                        name="wcharges"
                        value={formData.wcharges}
                        onChange={handleInputChange}
                        className="w-full"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Charge Type
                      </label>
                      <FormSelect
                        name="wchargestype"
                        value={formData.wchargestype}
                        onChange={handleInputChange}
                        className="w-full"
                      >
                        <option value="1">₹ (Rupees)</option>
                        <option value="2">% (Percentage)</option>
                      </FormSelect>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. MODE OF RECEIPT */}
            <h4 className="text-md font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">4. MODE OF RECEIPT</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Mode of Receipt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode Of Receipt <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="modeofreciept"
                  value={formData.modeofreciept}
                  onChange={(e) => handleModeOfReceiptChange(e.target.value)}
                  required
                  className="w-full"
                >
                  {modesOfReceipt.map(mode => (
                    <option key={mode.id} value={mode.id}>
                      {mode.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Local Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Local Contact of Courier/Cargo/Person Name
                </label>
                <Input
                  type="text"
                  name="localcontact"
                  value={formData.localcontact}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Enter local contact name"
                />
              </div>

              {/* Courier Details - Conditional */}
              {showCourierDetails && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Courier/Cargo/Transport
                    </label>
                    <Input
                      type="text"
                      name="couriername"
                      value={formData.couriername}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Enter courier name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Of Dispatch
                    </label>
                    <Input
                      type="date"
                      name="dateofdispatch"
                      value={formData.dateofdispatch}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Docket/Airway Bill Number
                    </label>
                    <Input
                      type="text"
                      name="docketno"
                      value={formData.docketno}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Enter docket/airway bill number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Receipt Document Upload
                    </label>
                    <Input
                      type="file"
                      name="rupload"
                      onChange={(e) => handleFileChange(e, 'rupload')}
                      className="w-full"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload receipt/delivery proof</p>
                  </div>
                </>
              )}
            </div>

            {/* 5. MODE OF PAYMENT */}
            <h4 className="text-md font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">5. MODE OF PAYMENT</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Is Payment Done? */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Is Payment Done? <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="paymentstatus"
                  value={formData.paymentstatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  required
                  className="w-full"
                >
                  {choices.map(choice => (
                    <option key={choice.id} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Payment Details - Conditional */}
              {showPaymentDetails && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode Of Payment <span className="text-red-500">*</span>
                    </label>
                    <FormSelect
                      name="modeofpayment"
                      value={formData.modeofpayment}
                      onChange={handleInputChange}
                      required={showPaymentDetails}
                      className="w-full"
                    >
                      {paymentModes.map(mode => (
                        <option key={mode.id} value={mode.id}>
                          {mode.name}
                        </option>
                      ))}
                    </FormSelect>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Details <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="detailsofpayment"
                      value={formData.detailsofpayment}
                      onChange={handleInputChange}
                      required={showPaymentDetails}
                      className="w-full"
                      placeholder="e.g., Bank transfer, Cheque number, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      name="paymentamount"
                      value={formData.paymentamount}
                      onChange={handleInputChange}
                      required={showPaymentDetails}
                      className="w-full"
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                    />
                  </div>
                </>
              )}
            </div>

            {/* 6. CERTIFICATE COLLECTION DETAILS - Using ReactSelect for multi-select */}
            <h4 className="text-md font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">
              6. CERTIFICATE COLLECTION DETAILS (Please tick)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Certificate Collection Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Collect As <span className="text-red-500">*</span>
                </label>
                
                <ReactSelect
                  isMulti
                  options={getSelectOptions(certCollectionDetails)}
                  value={getSelectedOptions(formData.certcollectiondetail, getSelectOptions(certCollectionDetails))}
                  onChange={(selected) => handleReactSelectChange(selected, 'certcollectiondetail')}
                  styles={customSelectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select certificate collection methods..."
                  isClearable
                  isSearchable
                />
                <p className="text-xs text-gray-500 mt-1">
                  Search and select multiple certificate collection methods
                </p>
              </div>

              {/* Additional Email IDs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Email IDs
                </label>
                <Textarea
                  name="additionalemail"
                  value={formData.additionalemail}
                  onChange={handleInputChange}
                  className="w-full"
                  rows={3}
                  placeholder="Enter comma-separated additional emails"
                />
                {customerEmail && (
                  <p className="text-sm text-gray-600 mt-2">
                    Customer Email: <span className="font-medium">{customerEmail}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="certcollectionremark"
                  value={formData.certcollectionremark}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="Enter description"
                />
              </div>
            </div>

            {/* 7. SPECIAL INSTRUCTIONS */}
            <h4 className="text-md font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">7. SPECIAL INSTRUCTIONS</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Any Returnable Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Any Returnable Items
                </label>
                <FormSelect
                  name="returnable"
                  value={formData.returnable}
                  onChange={handleInputChange}
                  className="w-full"
                >
                  <option value="">Select</option>
                  {choices.map(choice => (
                    <option key={choice.id} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </FormSelect>
              </div>

              {/* Documents Submitted */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documents Submitted, if any (Details)
                </label>
                <Input
                  type="text"
                  name="documents"
                  value={formData.documents}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Enter document details"
                />
              </div>

              {/* Any Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Any Deadline
                </label>
                <Input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* Any Special Request */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Any Special Request
                </label>
                <Textarea
                  name="specialrequest"
                  value={formData.specialrequest}
                  onChange={handleInputChange}
                  className="w-full"
                  rows={3}
                  placeholder="Enter any special requests"
                />
              </div>
            </div>

            {/* 8. NOTES */}
            <h4 className="text-md font-semibold mb-4 text-gray-700 border-b pb-2 mt-8">8. NOTES</h4>
            
            <div className="mb-6">
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full"
                rows={4}
                placeholder="Enter any additional notes or remarks"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate("/dashboards/testing/trfs-starts-jobs")}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={loading}
                className="px-6"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Creating TRF...
                  </>
                ) : (
                  "Add TRF Items >>"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Page>
  );
}