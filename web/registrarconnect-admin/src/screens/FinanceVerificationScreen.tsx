import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, DollarSign, User, FileText, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface PendingPayment {
  id: string;
  studentName: string;
  studentId: string;
  requestId: string;
  documentType: string;
  amount: number;
  paymentMethod: string;
  dateSubmitted: string;
  proofImage: string;
  referenceNumber: string;
}

export default function FinanceVerificationScreen() {
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Document pricing based on type
  const getDocumentPrice = (documentType: string): number => {
    const pricing: Record<string, number> = {
      'OTR': 150, // Official Transcript of Records
      'COG': 100, // Certificate of Grades
      'COE': 50,  // Certificate of Enrollment
      'OTHERS': 75 // Other Certifications
    };
    return pricing[documentType] || 0;
  };

  useEffect(() => {
    fetchPendingPayments();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchPendingPayments();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingPayments = async () => {
    setIsLoading(true);
    try {
      // Fetch pending verifications from backend
      const response = await apiService.finance.getPendingVerifications();
      
      const fetchedPayments = response.data.map((payment: any) => ({
        id: payment.id.toString(),
        studentName: payment.student_name || 'Unknown Student',
        studentId: payment.student_id_number || payment.student_id?.toString() || 'N/A',
        requestId: payment.id.toString(),
        documentType: payment.document_type,
        amount: getDocumentPrice(payment.document_type), // Calculate price based on document type
        paymentMethod: payment.payment_method || 'N/A',
        dateSubmitted: payment.requested_at || payment.created_at,
        proofImage: payment.receipt_image || 'no-receipt.jpg', // Use receipt_image not receipt_path
        referenceNumber: payment.receipt_reference || 'N/A'
      }));
      
      setPendingPayments(fetchedPayments);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      alert('Failed to load pending payments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setShowApprovalModal(true);
  };

  const handleRejectClick = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setShowRejectionModal(true);
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;
    
    setIsProcessing(true);
    try {
      // Call backend API to approve payment
      await apiService.finance.approvePayment(selectedPayment.id);
      
      alert(`Payment ${selectedPayment.id} approved!`);
      setPendingPayments(prev => prev.filter(payment => payment.id !== selectedPayment.id));
      setShowApprovalModal(false);
      setSelectedPayment(null);
    } catch (error: any) {
      console.error('Error approving payment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to approve payment';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Call backend API to reject payment
      await apiService.finance.rejectPayment(selectedPayment.id, { reason: rejectionReason });
      
      alert(`Payment ${selectedPayment.id} rejected.`);
      setPendingPayments(prev => prev.filter(payment => payment.id !== selectedPayment.id));
      setShowRejectionModal(false);
      setSelectedPayment(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reject payment';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="finance-verification-screen">
      <div className="verification-header">
        <div className="header-content">
          <h1>Payment Verification</h1>
          <p>Review and verify student payment submissions</p>
        </div>
        <div className="pending-count">
          <DollarSign size={20} />
          <span>{pendingPayments.length} Pending Verification</span>
        </div>
      </div>

      <div className="info-alert">
        <AlertCircle size={20} />
        <div className="alert-content">
          <strong>Verification Process</strong>
          <p>Carefully review payment proofs and verify reference numbers before approval. Rejected payments will notify the student to resubmit.</p>
        </div>
      </div>

      <div className="verification-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading pending payments...</p>
          </div>
        ) : pendingPayments.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={64} />
            <h3>All verified!</h3>
            <p>No pending payments to review at the moment</p>
          </div>
        ) : (
          <div className="payments-grid">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="verification-card">
                <div className="card-header">
                  <div className="payment-info">
                    <span className="payment-id">{payment.id}</span>
                    <span className="date-submitted">
                      Submitted: {new Date(payment.dateSubmitted).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="amount-badge">₱{payment.amount.toLocaleString()}</span>
                </div>

                <div className="card-body">
                  <div className="student-section">
                    <User size={20} />
                    <div className="student-details">
                      <h3>{payment.studentName}</h3>
                      <span className="student-id">{payment.studentId}</span>
                    </div>
                  </div>

                  <div className="payment-details-section">
                    <div className="detail-row">
                      <FileText size={18} />
                      <div className="detail-content">
                        <label>Request ID</label>
                        <span>{payment.requestId}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <FileText size={18} />
                      <div className="detail-content">
                        <label>Document Type</label>
                        <span>{payment.documentType}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <DollarSign size={18} />
                      <div className="detail-content">
                        <label>Payment Method</label>
                        <span>{payment.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <FileText size={18} />
                      <div className="detail-content">
                        <label>Reference Number</label>
                        <span className="reference-number">{payment.referenceNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="proof-section">
                    <label>Payment Proof</label>
                    <div className="proof-image">
                      <img src={`/uploads/${payment.proofImage}`} alt="Payment proof" />
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="btn-reject"
                    onClick={() => handleRejectClick(payment)}
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApproveClick(payment)}
                  >
                    <CheckCircle size={18} />
                    Approve Payment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowApprovalModal(false)}>
          <div className="modal-content approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Payment</h2>
            </div>
            <div className="modal-body">
              <div className="confirmation-message">
                <CheckCircle size={48} className="success-icon" />
                <h3>Confirm Payment Approval</h3>
                <p>You are about to approve the following payment:</p>
                <div className="payment-summary">
                  <p><strong>Payment ID:</strong> {selectedPayment.id}</p>
                  <p><strong>Student:</strong> {selectedPayment.studentName}</p>
                  <p><strong>Amount:</strong> ₱{selectedPayment.amount.toLocaleString()}</p>
                  <p><strong>Method:</strong> {selectedPayment.paymentMethod}</p>
                  <p><strong>Reference:</strong> {selectedPayment.referenceNumber}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowApprovalModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-approve"
                onClick={handleApprove}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner-small"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Approve Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowRejectionModal(false)}>
          <div className="modal-content rejection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Payment</h2>
            </div>
            <div className="modal-body">
              <div className="rejection-form">
                <XCircle size={48} className="error-icon" />
                <h3>Provide Rejection Reason</h3>
                <p>Payment ID: <strong>{selectedPayment.id}</strong></p>
                <p>Student: <strong>{selectedPayment.studentName}</strong></p>
                <div className="form-group">
                  <label>Reason for Rejection *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="E.g., Invalid reference number, unclear payment proof, incorrect amount..."
                    rows={4}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowRejectionModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-reject"
                onClick={handleReject}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner-small"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

