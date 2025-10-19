import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Plus,
  ArrowRight,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import "../styles/screens/StudentRequestsScreen.css";

interface DocumentRequest {
  id: string;
  student: string;
  student_id: string;
  document_type: string;
  semester: string;
  school_year: string;
  purpose: string;
  status: string;
  requested_at: string;
  receipt_image?: string;
  payment_approved?: boolean;
  document_approved?: boolean;
  current_status?: string;
  last_updated?: string;
}

export default function StudentRequestsScreen() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    // Check if user is authenticated and is a student
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");
    
    if (!token || role !== 'student') {
      navigate('/login');
      return;
    }
    
    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDocumentRequests();
      setRequests(response.data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock size={16} className="text-amber-500" />;
      case 'approved':
      case 'completed':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'under_review':
        return <AlertTriangle size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'approved':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests
    .filter(request => {
      const matchesSearch = request.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime();
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="student-requests-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-requests-screen">
      {/* Professional Header */}
      <div className="requests-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Document Requests</h1>
            <p>Track and manage your academic document requests</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={fetchRequests}
              className="action-btn secondary"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button 
              onClick={() => navigate('/student/requests/new')}
              className="action-btn primary"
            >
              <Plus size={16} />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FileText size={20} />
            </div>
            <div className="stat-content">
              <h3>{statusCounts.all}</h3>
              <p>Total Requests</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <h3>{statusCounts.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved">
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-content">
              <h3>{statusCounts.approved + statusCounts.completed}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected">
              <XCircle size={20} />
            </div>
            <div className="stat-content">
              <h3>{statusCounts.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="requests-section">
        {filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={48} />
            </div>
            <h3>
              {searchTerm || statusFilter !== 'all' ? 'No matching requests' : 'No requests yet'}
            </h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by creating your first document request'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button 
                onClick={() => navigate('/student/requests/new')}
                className="cta-button"
              >
                <Plus size={16} />
                Create Your First Request
              </button>
            )}
          </div>
        ) : (
          <div className="requests-list">
            {filteredRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-info">
                    <h3>{request.document_type}</h3>
                    <p>{request.purpose}</p>
                  </div>
                  <div className="request-status">
                    <span className={`status-badge ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="request-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>Requested: {formatDate(request.requested_at)}</span>
                  </div>
                  <div className="detail-item">
                    <User size={16} />
                    <span>Student ID: {request.student_id}</span>
                  </div>
                  {request.last_updated && (
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>Updated: {formatDateTime(request.last_updated)}</span>
                    </div>
                  )}
                </div>
                
                <div className="request-footer">
                  <div className="request-meta">
                    <span className="semester">{request.semester} • {request.school_year}</span>
                  </div>
                  <div className="request-actions">
                    <button className="action-btn small">
                      <Eye size={16} />
                      View Details
                    </button>
                    {request.status === 'completed' && (
                      <button className="action-btn small primary">
                        <Download size={16} />
                        Download
                      </button>
                    )}
                    <button className="action-btn small">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}