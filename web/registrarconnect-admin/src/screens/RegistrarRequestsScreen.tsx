import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Calendar, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import { apiService } from '../services/api';

interface DocumentRequest {
  id: string;
  studentName: string;
  studentId: string;
  documentType: string;
  purpose: string;
  status: string;
  dateSubmitted: string;
  paymentStatus: string;
  copies: number;
}

export default function RegistrarRequestsScreen() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DocumentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchRequests();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, documentTypeFilter, paymentFilter, requests]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // Fetch all document requests from backend
      const response = await apiService.registrar.getRequests({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        document_type: documentTypeFilter !== 'all' ? documentTypeFilter : undefined,
        payment_status: paymentFilter !== 'all' ? paymentFilter : undefined,
        search: searchTerm || undefined
      });
      
      const fetchedRequests = response.data.map((req: any) => ({
        id: req.id.toString(),
        studentName: req.student_name || 'Unknown Student',
        studentId: req.student_id?.toString() || 'N/A',
        documentType: req.document_type,
        purpose: req.purpose,
        status: req.status,
        dateSubmitted: req.requested_at || req.created_at,
        paymentStatus: req.payment_approved ? 'approved' : 'pending',  // Use payment_approved from action records
        copies: req.copies || 1
      }));
      
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      alert('Failed to load document requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(req => req.documentType === documentTypeFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(req => req.paymentStatus === paymentFilter);
    }

    setFilteredRequests(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: 'Pending', className: 'status-pending', icon: Clock },
      payment_approved: { label: 'Payment Approved', className: 'status-payment-approved', icon: CheckCircle },
      processing: { label: 'Processing', className: 'status-processing', icon: Clock },
      ready_for_claiming: { label: 'Ready for Claiming', className: 'status-ready', icon: CheckCircle },
      claimed: { label: 'Claimed', className: 'status-claimed', icon: CheckCircle },
      rejected: { label: 'Rejected', className: 'status-rejected', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`status-badge ${config.className}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: string) => {
    const paymentConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'payment-pending' },
      approved: { label: 'Approved', className: 'payment-approved' },
      rejected: { label: 'Rejected', className: 'payment-rejected' }
    };

    const config = paymentConfig[paymentStatus] || paymentConfig.pending;

    return <span className={`payment-badge ${config.className}`}>{config.label}</span>;
  };

  return (
    <div className="registrar-requests-screen">
      {/* Header */}
      <div className="requests-header">
        <div className="header-content">
          <h1>Document Requests</h1>
          <p>Manage and process all student document requests</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={fetchRequests}>
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Review</span>
            <span className="stat-value">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Payment Approved</span>
            <span className="stat-value">
              {requests.filter(r => r.status === 'payment_approved').length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon processing">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Processing</span>
            <span className="stat-value">
              {requests.filter(r => r.status === 'processing').length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon ready">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Ready for Claiming</span>
            <span className="stat-value">
              {requests.filter(r => r.status === 'ready_for_claiming').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by student name, ID, or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="payment_approved">Payment Approved</option>
              <option value="processing">Processing</option>
              <option value="ready_for_claiming">Ready for Claiming</option>
              <option value="claimed">Claimed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <FileText size={16} />
            <select value={documentTypeFilter} onChange={(e) => setDocumentTypeFilter(e.target.value)}>
              <option value="all">All Documents</option>
              <option value="Certificate of Grades">Certificate of Grades</option>
              <option value="Certificate of Enrollment">Certificate of Enrollment</option>
              <option value="Transcript of Records">Transcript of Records</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>
          <div className="filter-group">
            <CheckCircle size={16} />
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
              <option value="all">All Payments</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="requests-table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No requests found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student Info</th>
                <th>Document Type</th>
                <th>Purpose</th>
                <th>Copies</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <span className="request-id">{request.id}</span>
                  </td>
                  <td>
                    <div className="student-info">
                      <span className="student-name">{request.studentName}</span>
                      <span className="student-id">{request.studentId}</span>
                    </div>
                  </td>
                  <td>
                    <span className="document-type">{request.documentType}</span>
                  </td>
                  <td>
                    <span className="purpose">{request.purpose}</span>
                  </td>
                  <td>
                    <span className="copies">{request.copies}</span>
                  </td>
                  <td>{getPaymentBadge(request.paymentStatus)}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    <span className="date">{new Date(request.dateSubmitted).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon-small"
                        onClick={() => setSelectedRequest(request)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details</h2>
              <button className="close-btn" onClick={() => setSelectedRequest(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Request ID</label>
                  <span>{selectedRequest.id}</span>
                </div>
                <div className="detail-item">
                  <label>Student Name</label>
                  <span>{selectedRequest.studentName}</span>
                </div>
                <div className="detail-item">
                  <label>Student ID</label>
                  <span>{selectedRequest.studentId}</span>
                </div>
                <div className="detail-item">
                  <label>Document Type</label>
                  <span>{selectedRequest.documentType}</span>
                </div>
                <div className="detail-item">
                  <label>Purpose</label>
                  <span>{selectedRequest.purpose}</span>
                </div>
                <div className="detail-item">
                  <label>Number of Copies</label>
                  <span>{selectedRequest.copies}</span>
                </div>
                <div className="detail-item">
                  <label>Payment Status</label>
                  {getPaymentBadge(selectedRequest.paymentStatus)}
                </div>
                <div className="detail-item">
                  <label>Request Status</label>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

