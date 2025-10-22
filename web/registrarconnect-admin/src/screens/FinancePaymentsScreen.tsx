import { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';
import { apiService } from '../services/api';

interface Payment {
  id: string;
  studentName: string;
  studentId: string;
  requestId: string;
  documentType: string;
  amount: number;
  paymentMethod: string;
  status: string;
  dateSubmitted: string;
  proofImage: string;
}

export default function FinancePaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchPayments();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, statusFilter, payments]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      // Fetch all payments from backend
      const response = await apiService.finance.getPayments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      
      const fetchedPayments = response.data.map((payment: any) => ({
        id: payment.id.toString(),
        studentName: payment.student_name || 'Unknown Student',
        studentId: payment.student_id?.toString() || 'N/A',
        requestId: payment.id.toString(),
        documentType: payment.document_type,
        amount: payment.payment_amount || 0,
        paymentMethod: payment.payment_method || 'N/A',
        status: payment.payment_status || 'pending',
        dateSubmitted: payment.requested_at || payment.created_at,
        proofImage: payment.receipt_path || 'no-receipt.jpg'
      }));
      
      setPayments(fetchedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Failed to load payments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: 'Pending', className: 'status-pending', icon: Clock },
      approved: { label: 'Approved', className: 'status-approved', icon: CheckCircle },
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

  return (
    <div className="finance-payments-screen">
      <div className="payments-header">
        <div className="header-content">
          <h1>Payment Records</h1>
          <p>View and manage all student payment transactions</p>
        </div>
        <button className="btn-icon">
          <Download size={20} />
          Export
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Verification</span>
            <span className="stat-value">
              {payments.filter(p => p.status === 'pending').length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Approved</span>
            <span className="stat-value">
              {payments.filter(p => p.status === 'approved').length}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">
              ₱{payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by student name, ID, or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <Filter size={16} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="payments-table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading payments...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h3>No payments found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Student Info</th>
                <th>Request ID</th>
                <th>Document Type</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <span className="payment-id">{payment.id}</span>
                  </td>
                  <td>
                    <div className="student-info">
                      <span className="student-name">{payment.studentName}</span>
                      <span className="student-id">{payment.studentId}</span>
                    </div>
                  </td>
                  <td>
                    <span className="request-id">{payment.requestId}</span>
                  </td>
                  <td>
                    <span className="document-type">{payment.documentType}</span>
                  </td>
                  <td>
                    <span className="amount">₱{payment.amount.toLocaleString()}</span>
                  </td>
                  <td>
                    <span className="payment-method">{payment.paymentMethod}</span>
                  </td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>
                    <span className="date">{new Date(payment.dateSubmitted).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <button
                      className="btn-icon-small"
                      onClick={() => setSelectedPayment(payment)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Details Modal */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button className="close-btn" onClick={() => setSelectedPayment(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Payment ID</label>
                  <span>{selectedPayment.id}</span>
                </div>
                <div className="detail-item">
                  <label>Request ID</label>
                  <span>{selectedPayment.requestId}</span>
                </div>
                <div className="detail-item">
                  <label>Student Name</label>
                  <span>{selectedPayment.studentName}</span>
                </div>
                <div className="detail-item">
                  <label>Student ID</label>
                  <span>{selectedPayment.studentId}</span>
                </div>
                <div className="detail-item">
                  <label>Document Type</label>
                  <span>{selectedPayment.documentType}</span>
                </div>
                <div className="detail-item">
                  <label>Amount</label>
                  <span>₱{selectedPayment.amount.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Payment Method</label>
                  <span>{selectedPayment.paymentMethod}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>
              <div className="payment-proof-section">
                <label>Payment Proof</label>
                <img src={`/uploads/${selectedPayment.proofImage}`} alt="Payment proof" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

