import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { notificationService } from "../services/notificationService";
import Card from "../components/Card";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw
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
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected" | "Claimed">("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch requests from backend
  const fetchRequests = async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check authentication
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("No student token found! Redirecting to login...");
        setError("Not authenticated. Please log in.");
        setTimeout(() => {
          navigate("/student/login");
        }, 2000);
        return;
      }

      const res = await apiService.getDocumentRequests(status ? { status } : {});

      let requestsArray: unknown[] = [];
      if (Array.isArray(res.data)) {
        requestsArray = res.data;
      } else if (res.data && Array.isArray((res.data as { results?: unknown[] }).results)) {
        requestsArray = (res.data as { results: unknown[] }).results;
      }

      const mappedRequests: DocumentRequest[] = requestsArray.map((r: unknown) => {
        const request = r as {
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
        };

        return {
          id: request.id,
          student: request.student || "N/A",
          student_id: request.student_id || "N/A",
          document_type: request.document_type || "Unknown",
          semester: request.semester || "N/A",
          school_year: request.school_year || "N/A",
          purpose: request.purpose || "General Purpose",
          status: request.current_status || request.status,
          requested_at: request.requested_at,
          receipt_image: request.receipt_image,
          payment_approved: request.payment_approved,
          document_approved: request.document_approved,
          current_status: request.current_status,
          last_updated: request.last_updated,
        };
      });

      setRequests(mappedRequests);
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setTimeout(() => {
          navigate("/student/login");
        }, 2000);
        return;
      }
      
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchRequests(filter === "All" ? undefined : filter.toLowerCase());
  }, [filter]);

  // Request notification permission
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'confirming': return 'Confirming';
      case 'awaiting_payment': return 'Awaiting Payment';
      case 'pending': return 'Pending';
      case 'on_process': return 'Processing';
      case 'ready_to_claim': return 'Ready to Claim';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      case 'claimed': return 'Claimed';
      default: return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_claim': return 'success';
      case 'claimed': return 'success';
      case 'rejected': return 'error';
      case 'cancelled': return 'error';
      case 'on_process': return 'warning';
      default: return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready_to_claim':
      case 'claimed':
        return <CheckCircle2 size={16} />;
      case 'rejected':
      case 'cancelled':
        return <XCircle size={16} />;
      case 'on_process':
        return <Clock size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  // Filter requests based on search term
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "All") return matchesSearch;
    if (filter === "Pending") return matchesSearch && (request.status === "pending" || request.status === "on_process");
    if (filter === "Approved") return matchesSearch && (request.status === "ready_to_claim" || request.status === "claimed");
    if (filter === "Rejected") return matchesSearch && (request.status === "rejected" || request.status === "cancelled");
    if (filter === "Claimed") return matchesSearch && request.status === "claimed";
    
    return matchesSearch;
  });

  return (
    <div className="student-requests-screen">
      {/* Header Section */}
      <div className="requests-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-wrapper">
              <h1 className="page-title">
                <span className="title-icon">📄</span>
                My Document Requests
              </h1>
              <p className="page-subtitle">Track and manage your document requests</p>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{requests.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{requests.filter(r => r.status === "pending" || r.status === "on_process").length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{requests.filter(r => r.status === "ready_to_claim").length}</span>
                <span className="stat-label">Ready</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="action-btn secondary"
              onClick={() => fetchRequests()}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button 
              className="action-btn primary"
              onClick={() => navigate("/student/requests/new")}
            >
              <Plus size={16} />
              New Request
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-icon total">
            <FileText size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{requests.length}</div>
            <div className="stat-label">Total Requests</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon pending">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{requests.filter(r => r.status === "pending").length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon approved">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{requests.filter(r => r.status === "ready_to_claim").length}</div>
            <div className="stat-label">Ready to Claim</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon rejected">
            <XCircle size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{requests.filter(r => r.status === "rejected").length}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card 
        title={
          <div className="card-header-content">
            <div className="card-title">
              <FileText size={20} />
              <span>Request Management</span>
            </div>
          </div>
        }
        className="requests-card"
      >
        {/* Filter and Search Bar */}
        <div className="requests-toolbar">
          <div className="search-section">
            <div className="search-input-container">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search requests, documents..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn">
              <Filter size={16} />
              Filters
            </button>
          </div>
          
          <div className="filter-tabs">
            {["All", "Pending", "Approved", "Rejected", "Claimed"].map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f as "All" | "Pending" | "Approved" | "Rejected" | "Claimed")}
              >
                {f}
                {f !== "All" && (
                  <span className="tab-count">
                    {f === "Pending" && requests.filter(r => r.status === "pending").length}
                    {f === "Approved" && requests.filter(r => r.status === "ready_to_claim").length}
                    {f === "Rejected" && requests.filter(r => r.status === "rejected").length}
                    {f === "Claimed" && requests.filter(r => r.status === "claimed").length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="loading-spinner" />
            <p>Loading requests...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertTriangle size={24} />
            <p>{error}</p>
            <button className="retry-btn" onClick={() => fetchRequests()}>
              Try Again
            </button>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="requests-list">
            {filteredRequests.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-main">
                  <div className="request-header">
                    <div className="request-type">{request.document_type}</div>
                    <div className={`status-badge ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {getStatusDisplay(request.status)}
                    </div>
                  </div>
                  <div className="request-details">
                    <div className="request-info">
                      <span className="info-label">Purpose:</span>
                      <span className="info-value">{request.purpose}</span>
                    </div>
                    <div className="request-info">
                      <span className="info-label">Semester:</span>
                      <span className="info-value">{request.semester} {request.school_year}</span>
                    </div>
                    <div className="request-info">
                      <span className="info-label">Requested:</span>
                      <span className="info-value">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="request-actions">
                  <button className="action-btn-icon" title="View Details">
                    <Eye size={16} />
                  </button>
                  {request.receipt_image && (
                    <button className="action-btn-icon" title="Download Receipt">
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No requests found</h3>
            <p>There are no requests matching your current filters.</p>
            <button className="action-btn primary" onClick={() => navigate("/student/requests/new")}>
              <Plus size={16} />
              Create New Request
            </button>
          </div>
        )}
      </Card>

      {/* Toast Notifications */}
      {toast && (
        <div className="toast-notification">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
