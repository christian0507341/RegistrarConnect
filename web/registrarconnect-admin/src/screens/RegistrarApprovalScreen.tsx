import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Calendar, FileText, User, AlertCircle, Clock } from 'lucide-react';
import { apiService } from '../services/api';

interface PendingRequest {
  id: string;
  studentName: string;
  studentId: string;
  documentType: string;
  purpose: string;
  copies: number;
  dateSubmitted: string;
  paymentProof: string;
}

export default function RegistrarApprovalScreen() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchPendingRequests();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      // Fetch pending approvals from backend (payment approved, waiting for document approval)
      const response = await apiService.registrar.getPendingApprovals();
      const requests = response.data.map((req: any) => ({
        id: req.id.toString(),
        studentName: req.student_name || 'Unknown Student',
        studentId: req.student_id?.toString() || 'N/A',
        documentType: req.document_type,
        purpose: req.purpose,
        copies: req.copies || 1,
        dateSubmitted: req.requested_at || req.created_at,
        paymentProof: req.receipt_path || 'no-receipt.jpg'
      }));
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      alert('Failed to load pending requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveClick = (request: PendingRequest) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const handleRejectClick = (request: PendingRequest) => {
    setSelectedRequest(request);
    setShowRejectionModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      // Call backend API to approve request
      // This will:
      // 1. Set document=True in database
      // 2. Update status to 'ready_to_claim'
      // 3. Create action log
      // 4. Trigger automatic appointment scheduling
      const response = await apiService.registrar.approveRequest(selectedRequest.id);
      
      console.log('Approval response:', response.data);
      alert(`Request ${selectedRequest.id} approved! Appointment automatically scheduled.`);
      
      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error approving request:', error);
      const errorMessage = error.response?.data?.error || 'Failed to approve request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setIsProcessing(true);
    try {
      // Call backend API to reject request
      // This will:
      // 1. Set status='rejected' in database
      // 2. Store rejection reason in notes
      // 3. Create action log
      await apiService.registrar.rejectRequest(selectedRequest.id, { reason: rejectionReason });
      
      alert(`Request ${selectedRequest.id} rejected.`);
      
      // Remove from pending list
      setPendingRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setShowRejectionModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reject request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="registrar-approval-screen">
      {/* Header */}
      <div className="approval-header">
        <div className="header-content">
          <h1>Document Approval</h1>
          <p>Review and approve document requests (auto-schedules claiming appointments)</p>
        </div>
        <div className="pending-count">
          <Clock size={20} />
          <span>{pendingRequests.length} Pending Approval</span>
        </div>
      </div>

      {/* Info Alert */}
      <div className="info-alert">
        <AlertCircle size={20} />
        <div className="alert-content">
          <strong>Auto-Scheduling Enabled</strong>
          <p>When you approve a request, the system will automatically create a claiming appointment for the student based on available time slots.</p>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="approval-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading pending requests...</p>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={64} />
            <h3>All caught up!</h3>
            <p>No pending requests to review at the moment</p>
          </div>
        ) : (
          <div className="requests-grid">
            {pendingRequests.map((request) => (
              <div key={request.id} className="approval-card">
                <div className="card-header">
                  <div className="request-info">
                    <span className="request-id">{request.id}</span>
                    <span className="date-submitted">
                      Submitted: {new Date(request.dateSubmitted).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="student-section">
                    <User size={20} />
                    <div className="student-details">
                      <h3>{request.studentName}</h3>
                      <span className="student-id">{request.studentId}</span>
                    </div>
                  </div>

                  <div className="document-section">
                    <div className="detail-row">
                      <FileText size={18} />
                      <div className="detail-content">
                        <label>Document Type</label>
                        <span>{request.documentType}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <FileText size={18} />
                      <div className="detail-content">
                        <label>Purpose</label>
                        <span>{request.purpose}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <FileText size={18} />
                      <div className="detail-content">
                        <label>Number of Copies</label>
                        <span>{request.copies}</span>
                      </div>
                    </div>
                  </div>

                  <div className="payment-section">
                    <label>Payment Proof</label>
                    <div className="payment-proof">
                      <img src={`/uploads/${request.paymentProof}`} alt="Payment proof" />
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="btn-reject"
                    onClick={() => handleRejectClick(request)}
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApproveClick(request)}
                  >
                    <CheckCircle size={18} />
                    Approve & Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowApprovalModal(false)}>
          <div className="modal-content approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Approve Document Request</h2>
            </div>
            <div className="modal-body">
              <div className="confirmation-message">
                <CheckCircle size={48} className="success-icon" />
                <h3>Confirm Approval</h3>
                <p>You are about to approve the following request:</p>
                <div className="request-summary">
                  <p><strong>Request ID:</strong> {selectedRequest.id}</p>
                  <p><strong>Student:</strong> {selectedRequest.studentName}</p>
                  <p><strong>Document:</strong> {selectedRequest.documentType}</p>
                  <p><strong>Copies:</strong> {selectedRequest.copies}</p>
                </div>
                <div className="auto-schedule-info">
                  <Calendar size={20} />
                  <span>A claiming appointment will be automatically scheduled for the student</span>
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
                    Approve & Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowRejectionModal(false)}>
          <div className="modal-content rejection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Document Request</h2>
            </div>
            <div className="modal-body">
              <div className="rejection-form">
                <XCircle size={48} className="error-icon" />
                <h3>Provide Rejection Reason</h3>
                <p>Request ID: <strong>{selectedRequest.id}</strong></p>
                <p>Student: <strong>{selectedRequest.studentName}</strong></p>
                <div className="form-group">
                  <label>Reason for Rejection *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for rejecting this request..."
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

