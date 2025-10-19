// src/screens/RequestsScreen.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { notificationService } from "../services/notificationService";
import Card from "../components/Card";
import Table from "../components/Table";
import ReceiptModal from "../components/ReceiptModal";
import NotificationCenter from "../components/NotificationCenter";
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileText,
  AlertTriangle,
  Plus
} from "lucide-react";
import "../styles/screens/RequestsScreen.css";

type Request = {
  id: string;
  student: string;
  studentId: string;
  documentType: string;
  semester: string;
  schoolYear: string;
  purpose: string;
  aiStatus: "Pending" | "Valid" | "Invalid" | "Checking" | "Approved" | "Rejected" | "Claimed";
  aiNote?: string;
  receiptUrl?: string;
  documentApproved?: boolean;
  receiptApproved?: boolean;
  // Action-based status fields from backend
  payment_approved?: boolean;
  document_approved?: boolean;
  current_status?: string;
  last_updated?: string;
};

export default function RequestsScreen() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<Request[]>([]);
  const [selected, setSelected] = useState<Request | null>(null);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected" | "Claimed">("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Fetch requests from backend
  const fetchRequests = async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check authentication
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("No admin token found! Redirecting to login...");
        setError("Not authenticated. Please log in.");
        setTimeout(() => {
          navigate("/login");
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

      const mappedRequests: Request[] = requestsArray.map((r: unknown) => {
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
          actions?: Array<{
            payment: boolean;
            document: boolean;
            created_at: string;
          }>;
          // Action-based status fields from backend
          payment_approved?: boolean;
          document_approved?: boolean;
          current_status?: string;
          last_updated?: string;
        };
        
        // Action-based status is now provided directly by the backend

        // Map status to display format
        const getStatusDisplay = (status: string) => {
          switch (status) {
            case 'draft': return 'Pending';
            case 'confirming': return 'Pending';
            case 'awaiting_payment': return 'Pending';
            case 'pending': return 'Pending';
            case 'on_process': return 'Checking';
            case 'ready_to_claim': return 'Approved';
            case 'cancelled': return 'Rejected';
            case 'rejected': return 'Rejected';
            case 'claimed': return 'Claimed';
            default: return 'Pending';
          }
        };

        return {
          id: request.id,
          student: request.student || "N/A",
          studentId: request.student_id || "N/A",
          documentType: request.document_type || "Unknown",
          semester: request.semester || "N/A",
          schoolYear: request.school_year || "N/A",
          purpose: request.purpose || "General Purpose",
          aiStatus: getStatusDisplay(request.current_status || request.status) as "Pending" | "Valid" | "Invalid" | "Checking" | "Approved" | "Rejected" | "Claimed",
          aiNote: `Requested on ${new Date(request.requested_at).toLocaleDateString()}`,
          receiptUrl: request.receipt_image || "/sample-receipt.png",
          // Use action-based status from backend
          documentApproved: request.document_approved || false,
          receiptApproved: request.payment_approved || false,
          // Include action-based fields
          payment_approved: request.payment_approved,
          document_approved: request.document_approved,
          current_status: request.current_status,
          last_updated: request.last_updated,
        };
      });

      setRequests(mappedRequests);
      setHasLocalChanges(false); // Clear local changes flag when data is refreshed
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }
      
      // Fallback: use static sample data while backend is unavailable
      const staticData: Request[] = [
        {
          id: "REQ-001",
          student: "John Doe",
          studentId: "2020-0001",
          documentType: "Transcript of Records", // sample document type
          semester: "1st Semester",
          schoolYear: "2024–2025",
          purpose: "Job Application",
          aiStatus: "Pending",
          aiNote: "Awaiting verification",
          receiptUrl: "/sample-receipt.png",
        },
        {
          id: "REQ-002",
          student: "Jane Smith",
          studentId: "2021-0002",
          documentType: "Certificate of Enrollment",
          semester: "2nd Semester",
          schoolYear: "2024–2025",
          purpose: "Scholarship",
          aiStatus: "Approved",
          aiNote: "Approved by registrar",
          receiptUrl: "/sample-receipt.png",
        },
        {
          id: "REQ-003",
          student: "Mark Dela Cruz",
          studentId: "2020-0003",
          documentType: "Good Moral Certificate",
          semester: "1st Semester",
          schoolYear: "2023–2024",
          purpose: "Transfer Requirement",
          aiStatus: "Rejected",
          aiNote: "Incomplete requirements",
          receiptUrl: "/sample-receipt.png",
        },
        {
          id: "REQ-004",
          student: "Alice Reyes",
          studentId: "2022-0004",
          documentType: "Diploma Copy",
          semester: "2nd Semester",
          schoolYear: "2024–2025",
          purpose: "Internship",
          aiStatus: "Pending",
          aiNote: "Awaiting verification",
          receiptUrl: "/sample-receipt.png",
        },
      ];
      setRequests(staticData);
      setError(null); // clear error since we’re using mock data
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filter changes
  useEffect(() => {
    // Check authentication before fetching
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Not authenticated. Please log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }
    
    fetchRequests(filter === "All" ? undefined : filter.toLowerCase());
  }, [filter]);

  // Request notification permission on mount
  useEffect(() => {
    notificationService.requestPermission();
  }, []);

  // Listen for appointment claimed events
  useEffect(() => {
    const handleAppointmentClaimed = (event: CustomEvent) => {
      console.log('Appointment claimed, refreshing requests:', event.detail);
      
      // Show notification
      notificationService.add({
        title: 'Document Request Updated',
        message: `Document request for ${event.detail.studentName} has been marked as claimed`,
        type: 'success'
      });
      
      // Force refresh requests to show updated status with a small delay
      console.log('Forcing refresh of requests after appointment claimed');
      setLoading(true);
      
      // Add small delay to ensure backend has processed the update
      setTimeout(() => {
        fetchRequests(filter === "All" ? undefined : filter.toLowerCase());
      }, 500);
      
      // Show toast notification
      setToast(`Document request for ${event.detail.studentName} marked as claimed`);
      setTimeout(() => setToast(null), 3000);
    };

    window.addEventListener('appointmentClaimed', handleAppointmentClaimed as EventListener);
    
    return () => {
      window.removeEventListener('appointmentClaimed', handleAppointmentClaimed as EventListener);
    };
  }, [filter]);

  // Escape key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setToast("Opening Request History…");
        setTimeout(() => {
          setToast(null);
          navigate("/requests/history");
        }, 1000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Approve/Reject handlers
  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, aiStatus: "Approved", aiNote: "Approved by admin." } : r
      )
    );
    setSelected(null);
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, aiStatus: "Rejected", aiNote: "Rejected by admin." } : r
      )
    );
    setSelected(null);
  };

  // Bulk approval function
  const handleBulkApproval = async () => {
    const pendingRequests = requests.filter(r => 
      r.aiStatus === "Pending" || r.aiStatus === "Checking"
    );

    if (pendingRequests.length === 0) {
      setToast("No pending requests to approve");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to approve ${pendingRequests.length} pending requests? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      
      // Update each pending request
      for (const request of pendingRequests) {
        await apiService.updateDocumentRequestStatus(request.id, {
          status: "ready_to_claim",
          notes: "Bulk approved by admin"
        });
      }

      // Refresh data
      await fetchRequests();
      
      setToast(`Bulk approved ${pendingRequests.length} requests`);
      setTimeout(() => setToast(null), 3000);

    } catch (err) {
      console.error("Error in bulk approval:", err);
      setToast("Failed to bulk approve requests");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };


  const headers = [
    "Req ID",
    "Student ID",
    "Name",
    "Document",
    "Receipt",
    "Semester",
    "School Year",
    "Purpose",
    "Status",
  ];

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Pending") return r.aiStatus === "Pending" || r.aiStatus === "Checking";
    if (filter === "Approved") return r.aiStatus === "Valid" || r.aiStatus === "Approved";
    if (filter === "Rejected") return r.aiStatus === "Invalid" || r.aiStatus === "Rejected";
    if (filter === "Claimed") return r.aiStatus === "Claimed";
    return true;
  });

const rows = filteredRequests.map((r) => {
  const isApproved = r.documentApproved && r.receiptApproved;

  return [
    r.id,                   // Req ID
    r.studentId,            // Student ID
    r.student,              // Name
    // Document toggle with type text (like receipt)
    <div
      key={`doc-${r.id}`}
      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
    >
      <label className="toggle">
        <input
          type="checkbox"
          checked={!!r.documentApproved}
          disabled={updatingStatus === r.id || r.aiStatus === "Rejected"}
          onChange={async () => {
            const newDoc = !r.documentApproved;

            try {
              setUpdatingStatus(r.id);
              
              // Check if both document and receipt are now approved
              const bothApproved = newDoc && (r.receiptApproved || r.payment_approved);

              // Update database - preserve existing payment status
              await apiService.updateDocumentRequestStatus(r.id, {
                document: newDoc,
                payment: r.receiptApproved || r.payment_approved, // Preserve current payment status
                status: bothApproved ? "ready_to_claim" : undefined,
                notes: newDoc ? "Document approved" : "Document rejected"
              });

              // Update local state
            setRequests((prev) =>
              prev.map((req) =>
                req.id === r.id
                  ? {
                      ...req,
                      documentApproved: newDoc,
                        // Update status based on both approvals
                        aiStatus: bothApproved ? "Approved" : (newDoc || (req.receiptApproved || req.payment_approved) ? "Pending" : "Rejected"),
                        aiNote: bothApproved 
                          ? "Ready to claim" 
                          : (newDoc || (req.receiptApproved || req.payment_approved) ? "Awaiting verification" : "Notify student that request is rejected"),
                    }
                  : req
              )
            );

              // Show success message and notification
              if (bothApproved) {
                const message = `Both document and receipt approved! Request ready to claim for ${r.student}`;
                setToast(message);
                setTimeout(() => setToast(null), 3000);
                
                notificationService.add({
                  title: 'Request Ready to Claim',
                  message: `Document request for ${r.student} is ready to claim`,
                  type: 'success'
                });
                
                // Show browser notification
                notificationService.showBrowserNotification(
                  'Request Ready to Claim',
                  `Document request for ${r.student} is ready to claim`
                );
              } else {
                const message = `Document ${newDoc ? 'approved' : 'rejected'} for ${r.student}`;
                setToast(message);
                setTimeout(() => setToast(null), 3000);
                
                notificationService.add({
                  title: 'Document Status Updated',
                  message: `Document ${newDoc ? 'approved' : 'rejected'} for ${r.student}`,
                  type: 'info'
                });
              }
              
              // Mark that we have local changes
              setHasLocalChanges(true);

            } catch (err) {
              console.error("Error updating document status:", err);
              setToast("Failed to update document status");
              setTimeout(() => setToast(null), 3000);
            } finally {
              setUpdatingStatus(null);
            }
          }}
        />
        <span className="slider"></span>
      </label>
      <span>{r.documentType}</span>
      {r.aiStatus === "Rejected" && (
        <span style={{ color: "#ef4444", fontSize: "12px", marginLeft: "4px" }}>🔒</span>
      )}
      {updatingStatus === r.id && (
        <RefreshCw size={12} className="loading-spinner" />
      )}
    </div>,
    // Receipt toggle with thumbnail
    <div
      key={`receipt-${r.id}`}
      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
    >
      <label className="toggle">
        <input
          type="checkbox"
          checked={!!r.receiptApproved}
          disabled={updatingStatus === r.id || r.aiStatus === "Rejected"}
          onChange={async () => {
            const newReceipt = !r.receiptApproved;

            try {
              setUpdatingStatus(r.id);
              
              // Check if both document and receipt are now approved
              const bothApproved = newReceipt && (r.documentApproved || r.document_approved);

              // Update database - preserve existing document status
              await apiService.updateDocumentRequestStatus(r.id, {
                payment: newReceipt,
                document: r.documentApproved || r.document_approved, // Preserve current document status
                status: bothApproved ? "ready_to_claim" : undefined,
                notes: newReceipt ? "Receipt approved" : "Receipt rejected"
              });

              // Update local state
            setRequests((prev) =>
              prev.map((req) =>
                req.id === r.id
                  ? {
                      ...req,
                      receiptApproved: newReceipt,
                        // Update status based on both approvals
                        aiStatus: bothApproved ? "Approved" : (newReceipt || (req.documentApproved || req.document_approved) ? "Pending" : "Rejected"),
                        aiNote: bothApproved 
                          ? "Ready to claim" 
                          : (newReceipt || (req.documentApproved || req.document_approved) ? "Awaiting verification" : "Notify student that request is rejected"),
                    }
                  : req
              )
            );

              // Show success message and notification
              if (bothApproved) {
                const message = `Both document and receipt approved! Request ready to claim for ${r.student}`;
                setToast(message);
                setTimeout(() => setToast(null), 3000);
                
                notificationService.add({
                  title: 'Request Ready to Claim',
                  message: `Document request for ${r.student} is ready to claim`,
                  type: 'success'
                });
                
                // Show browser notification
                notificationService.showBrowserNotification(
                  'Request Ready to Claim',
                  `Document request for ${r.student} is ready to claim`
                );
              } else {
                const message = `Receipt ${newReceipt ? 'approved' : 'rejected'} for ${r.student}`;
                setToast(message);
                setTimeout(() => setToast(null), 3000);
                
                notificationService.add({
                  title: 'Receipt Status Updated',
                  message: `Receipt ${newReceipt ? 'approved' : 'rejected'} for ${r.student}`,
                  type: 'info'
                });
              }
              
              // Mark that we have local changes
              setHasLocalChanges(true);

            } catch (err) {
              console.error("Error updating receipt status:", err);
              setToast("Failed to update receipt status");
              setTimeout(() => setToast(null), 3000);
            } finally {
              setUpdatingStatus(null);
            }
          }}
        />
        <span className="slider"></span>
      </label>
      <img
        src={r.receiptUrl || "/sample-receipt.png"}
        alt={`Receipt ${r.id}`}
        style={{
          width: "40px",
          height: "40px",
          objectFit: "cover",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      {r.aiStatus === "Rejected" && (
        <span style={{ color: "#ef4444", fontSize: "12px", marginLeft: "4px" }}>🔒</span>
      )}
      {updatingStatus === r.id && (
        <RefreshCw size={12} className="loading-spinner" />
      )}
    </div>,
    r.semester,             // Semester
    r.schoolYear,           // School Year
    r.purpose,              // Purpose
    // Status column
    isApproved ? (
      <button
        key={`status-${r.id}`}
        className="requests-status-badge approved"
        disabled={updatingStatus === r.id || r.aiStatus === "Rejected"}
        onClick={async () => {
          try {
            setUpdatingStatus(r.id);
            
            // Update status to ready_to_claim
            await apiService.updateDocumentRequestStatus(r.id, {
              status: "ready_to_claim",
              notes: "Document ready for claiming"
            });

            // Update local state
            setRequests((prev) =>
              prev.map((req) =>
                req.id === r.id
                  ? { ...req, aiStatus: "Approved", aiNote: "Ready for claiming" }
                  : req
              )
            );

            setToast(`Student ${r.student} has been notified that their document is ready for claiming`);
            setTimeout(() => setToast(null), 3000);

          } catch (err) {
            console.error("Error updating status:", err);
            setToast("Failed to update request status");
            setTimeout(() => setToast(null), 3000);
          } finally {
            setUpdatingStatus(null);
          }
        }}
        style={{ cursor: "pointer", border: "none" }}
      >
        Notify Student for Claiming
      </button>
    ) : r.aiStatus === "Claimed" ? (
      <span key={`status-${r.id}`} className="requests-status-badge claimed">
        <CheckCircle2 size={14} />
        Claimed
      </span>
    ) : r.documentApproved || r.receiptApproved ? (
  <span key={`status-${r.id}`} className="requests-status-badge pending">
    Pending
  </span>
) : (
  <button
    key={`status-${r.id}`}
    className="requests-status-badge rejected"
    disabled={updatingStatus === r.id || r.aiStatus === "Rejected"}
    style={{ cursor: "pointer", border: "none" }}
    onClick={async () => {
      try {
        setUpdatingStatus(r.id);
        
        // Update status to rejected in database
        await apiService.updateDocumentRequestStatus(r.id, {
          status: "rejected",
          notes: "Request rejected - incomplete requirements"
        });

        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === r.id
              ? { ...req, aiStatus: "Rejected", aiNote: "Request rejected" }
              : req
          )
        );

        const message = `Request rejected for ${r.student} - Student can now request another document`;
        setToast(message);
        setTimeout(() => setToast(null), 3000);
        
        notificationService.add({
          title: 'Request Rejected',
          message: `Document request for ${r.student} has been rejected`,
          type: 'warning'
        });
        
        // Show browser notification
        notificationService.showBrowserNotification(
          'Request Rejected',
          `Document request for ${r.student} has been rejected`
        );
        
        // Mark that we have local changes
        setHasLocalChanges(true);

      } catch (err) {
        console.error("Error updating status:", err);
        setToast("Failed to update request status");
        setTimeout(() => setToast(null), 3000);
      } finally {
        setUpdatingStatus(null);
      }
    }}
  >
    Reject Request (Student can request again)
  </button>
)
  ];
});


  return (
    <div className="requests-screen">
      {/* Header Section */}
      <div className="requests-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-wrapper">
              <h1 className="page-title">
                <span className="title-icon">📋</span>
                Document Requests
              </h1>
              <p className="page-subtitle">Manage and review student document requests</p>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{requests.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{requests.filter(r => r.aiStatus === "Pending" || r.aiStatus === "Checking").length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{requests.filter(r => r.aiStatus === "Approved").length}</span>
                <span className="stat-label">Approved</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="action-btn secondary"
              onClick={handleBulkApproval}
              disabled={loading || requests.filter(r => r.aiStatus === "Pending" || r.aiStatus === "Checking").length === 0}
            >
              <CheckCircle2 size={16} />
              Bulk Approve ({requests.filter(r => r.aiStatus === "Pending" || r.aiStatus === "Checking").length})
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => {
                setLoading(true);
                fetchRequests(filter === "All" ? undefined : filter.toLowerCase());
              }}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button className="action-btn secondary">
              <Download size={16} />
              Export
            </button>
            <button className="action-btn primary">
              <Plus size={16} />
              New Request
            </button>
            <NotificationCenter />
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
            <div className="stat-value">{requests.filter(r => r.aiStatus === "Pending").length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon approved">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{requests.filter(r => r.aiStatus === "Approved").length}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon rejected">
            <XCircle size={20} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{requests.filter(r => r.aiStatus === "Rejected").length}</div>
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
            <div className="card-actions">
              <button 
                className={`icon-btn ${hasLocalChanges ? 'has-changes' : ''}`}
                onClick={() => fetchRequests()}
                title={hasLocalChanges ? "Refresh data from database (you have local changes)" : "Refresh data from database"}
              >
                <RefreshCw size={16} />
                {hasLocalChanges && <span className="change-indicator">•</span>}
              </button>
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
                placeholder="Search requests, students..." 
                className="search-input"
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
                    {f === "Pending" && requests.filter(r => r.aiStatus === "Pending").length}
                    {f === "Approved" && requests.filter(r => r.aiStatus === "Approved").length}
                    {f === "Rejected" && requests.filter(r => r.aiStatus === "Rejected").length}
                    {f === "Claimed" && requests.filter(r => r.aiStatus === "Claimed").length}
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
        ) : rows.length > 0 ? (
          <div className="table-container">
            <Table 
              headers={headers} 
              rows={rows} 
              rowClasses={rows.map((_, index) => {
                const request = filteredRequests[index];
                return request?.aiStatus === "Rejected" ? "locked" : "";
              })}
            />
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No requests found</h3>
            <p>There are no requests matching your current filters.</p>
            <button className="action-btn primary" onClick={() => setFilter("All")}>
              View All Requests
            </button>
          </div>
        )}
      </Card>

      {/* Modals */}
      {selected && (
        <ReceiptModal
          student={selected.student}
          document={selected.documentType}
          receiptUrl={selected.receiptUrl}
          aiStatus={selected.aiStatus}
          aiNote={selected.aiNote}
          onClose={() => setSelected(null)}
          onApprove={() => handleApprove(selected.id)}
          onReject={() => handleReject(selected.id)}
        />
      )}

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
