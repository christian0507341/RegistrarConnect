import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import {
  FileText,
  Upload,
  Send,
  AlertCircle,
  CheckCircle,
  Info,
  DollarSign,
  CreditCard,
  FileImage,
  Plus,
  ArrowLeft,
  Save,
  Eye,
  Shield
} from "lucide-react";
import "../styles/screens/StudentNewRequestScreen.css";

interface FormData {
  document_type: string;
  purpose: string;
  notes: string;
  payment_method: string;
  semester?: number;
  school_year?: string;
}

const DOCUMENT_TYPES = [
  { value: 'OTR', label: 'Official Transcript of Records (OTR)' },
  { value: 'COG', label: 'Certificate of Grades (COG)' },
  { value: 'COE', label: 'Certificate of Enrollment (COE)' },
  { value: 'OTHERS', label: 'Other Certifications' }
];

const PAYMENT_METHODS = [
  { value: 'personal', label: 'Personal (Finance)' },
  { value: 'gcash', label: 'Online (GCash)' }
];

export default function StudentNewRequestScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    document_type: '',
    purpose: '',
    notes: '',
    payment_method: '',
    semester: undefined,
    school_year: ''
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }
  }, [navigate]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const validateForm = () => {
    if (!formData.document_type) {
      setError('Please select a document type');
      return false;
    }
    if (!formData.purpose.trim()) {
      setError('Please provide a purpose for the request');
      return false;
    }
    if (!formData.payment_method) {
      setError('Please select a payment method');
      return false;
    }
    // Validate semester and school_year for COG/COE
    if ((formData.document_type === 'COG' || formData.document_type === 'COE') && !formData.semester) {
      setError('Please select a semester for this document type');
      return false;
    }
    if ((formData.document_type === 'COG' || formData.document_type === 'COE') && !formData.school_year) {
      setError('Please enter the school year for this document type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const requestData = {
        document_type: formData.document_type,
        purpose: formData.purpose.trim(),
        notes: formData.notes.trim(),
        payment_method: formData.payment_method,
        // Add semester and school_year if needed for COG/COE
        ...(formData.document_type === 'COG' || formData.document_type === 'COE' ? {
          semester: formData.semester,
          school_year: formData.school_year
        } : {})
      };

      await apiService.createDocumentRequest(requestData);
      
      setSuccess(true);
      setFormData({
        document_type: '',
        purpose: '',
        notes: '',
        payment_method: '',
        semester: undefined,
        school_year: ''
      });
      setUploadedFile(null);
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      console.error('Error creating document request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      document_type: '',
      purpose: '',
      notes: '',
      payment_method: '',
      semester: undefined,
      school_year: ''
    });
    setUploadedFile(null);
    setError(null);
    setSuccess(false);
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (success) {
    return (
      <div className="student-new-request-screen">
        <div className="success-container">
          <div className="success-header">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h1>Request Submitted Successfully!</h1>
            <p>Your document request has been submitted and is now under review.</p>
          </div>
          
          <div className="success-details">
            <div className="detail-card">
              <h3>What happens next?</h3>
              <ul>
                <li>Your request will be reviewed by our staff</li>
                <li>You'll receive email notifications about status updates</li>
                <li>Payment instructions will be sent if required</li>
                <li>You can track progress in your dashboard</li>
              </ul>
            </div>
          </div>
          
          <div className="success-actions">
            <button onClick={resetForm} className="action-btn primary">
              <Plus size={16} />
              Submit Another Request
            </button>
            <button onClick={() => navigate('/student/requests')} className="action-btn secondary">
              <Eye size={16} />
              View My Requests
            </button>
            <button onClick={() => navigate('/student/dashboard')} className="action-btn secondary">
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-new-request-screen">
      {/* Professional Header */}
      <div className="request-header">
        <div className="header-content">
          <div className="header-info">
            <button 
              onClick={() => navigate('/student/requests')}
              className="back-btn"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="header-text">
              <h1>New Document Request</h1>
              <p>Submit a request for academic documents and certificates</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={resetForm}
              className="action-btn secondary"
            >
              <Save size={16} />
              Save Draft
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-section">
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Document Details</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Payment Info</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Review & Submit</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="form-container">
        <form onSubmit={handleSubmit} className="request-form">
          {/* Step 1: Document Details */}
          {currentStep === 1 && (
            <div className="form-step">
              <div className="step-header">
                <h2>Document Details</h2>
                <p>Tell us about the document you need</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="document_type" className="form-label">
                  <FileText size={20} />
                  Document Type *
                </label>
                <select
                  id="document_type"
                  value={formData.document_type}
                  onChange={(e) => handleInputChange('document_type', e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select document type</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="purpose" className="form-label">
                  <Info size={20} />
                  Purpose *
                </label>
                <textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="form-textarea"
                  placeholder="Please describe the purpose of this document request..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  <FileText size={20} />
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="form-textarea"
                  placeholder="Any additional information or special requirements..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === 2 && (
            <div className="form-step">
              <div className="step-header">
                <h2>Payment Information</h2>
                <p>Provide payment details for your request</p>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="payment_method" className="form-label">
                    <CreditCard size={20} />
                    Payment Method *
                  </label>
                  <select
                    id="payment_method"
                    value={formData.payment_method}
                    onChange={(e) => handleInputChange('payment_method', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select payment method</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester and School Year fields for COG/COE */}
                {(formData.document_type === 'COG' || formData.document_type === 'COE') && (
                  <>
                    <div className="form-group">
                      <label htmlFor="semester" className="form-label">
                        <BookOpen size={20} />
                        Semester *
                      </label>
                      <select
                        id="semester"
                        value={formData.semester || ''}
                        onChange={(e) => handleInputChange('semester', parseInt(e.target.value) || undefined)}
                        className="form-input"
                        required
                      >
                        <option value="">Select Semester</option>
                        <option value={1}>1st Semester</option>
                        <option value={2}>2nd Semester</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="school_year" className="form-label">
                        <Calendar size={20} />
                        School Year *
                      </label>
                      <input
                        type="text"
                        id="school_year"
                        value={formData.school_year}
                        onChange={(e) => handleInputChange('school_year', e.target.value)}
                        className="form-input"
                        placeholder="e.g., 2024-2025"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="payment-info">
                <div className="info-card">
                  <Shield size={20} />
                  <div>
                    <h4>Secure Payment</h4>
                    <p>Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="form-step">
              <div className="step-header">
                <h2>Review & Submit</h2>
                <p>Review your request before submitting</p>
              </div>
              
              <div className="review-section">
                <div className="review-card">
                  <h3>Document Request Summary</h3>
                  <div className="review-details">
                    <div className="detail-row">
                      <span className="label">Document Type:</span>
                      <span className="value">{formData.document_type}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Purpose:</span>
                      <span className="value">{formData.purpose}</span>
                    </div>
                    {formData.notes && (
                      <div className="detail-row">
                        <span className="label">Notes:</span>
                        <span className="value">{formData.notes}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="label">Payment Method:</span>
                      <span className="value">{formData.payment_method}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Amount:</span>
                      <span className="value">₱{formData.payment_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="form-group">
                  <label htmlFor="file_upload" className="form-label">
                    <FileImage size={20} />
                    Supporting Documents (Optional)
                  </label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file_upload"
                      onChange={handleFileUpload}
                      className="file-input"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <label htmlFor="file_upload" className="file-upload-label">
                      <Upload size={20} />
                      <span>
                        {uploadedFile ? uploadedFile.name : 'Click to upload supporting documents'}
                      </span>
                    </label>
                    <p className="file-upload-help">
                      Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Info Message */}
          <div className="info-message">
            <Info size={16} />
            <div>
              <strong>Important:</strong> Please ensure all information is accurate. 
              You will receive a confirmation email once your request is processed.
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="action-btn secondary"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="action-btn primary"
              >
                Next
                <ArrowLeft size={16} className="rotate-180" />
              </button>
            ) : (
              <button
                type="submit"
                className="action-btn primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}