// src/screens/RequestsScreen.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../components/Card";
import Table from "../components/Table";
import ReceiptModal from "../components/ReceiptModal";
import "../styles/screens/RequestsScreen.css";

type Request = {
  id: string;
  student: string;
  studentId: string;
  documentType: string;
  semester: string;
  schoolYear: string;
  purpose: string;
  aiStatus: "Pending" | "Valid" | "Invalid" | "Checking" | "Approved" | "Rejected";
  aiNote?: string;
  receiptUrl?: string;
};

export default function RequestsScreen() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<Request[]>([]);
  const [selected, setSelected] = useState<Request | null>(null);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Fetch requests from backend
  const fetchRequests = async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("No admin token found! Redirecting to login...");
        navigate("/login");
        return;
      }

      const res = await axios.get("http://127.0.0.1:8000/api/document-requests/", {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: status ? { status } : {},
      });

      let requestsArray: any[] = [];
      if (Array.isArray(res.data)) {
        requestsArray = res.data;
      } else if (res.data && Array.isArray((res.data as any).results)) {
        requestsArray = (res.data as any).results;
      }

      const mappedRequests: Request[] = requestsArray.map((r: any) => ({
        id: r.id,
        student: r.student_email || r.student || "N/A",
        studentId: r.student_id || r.student || "N/A",
        documentType: r.document_type,
        semester: r.semester || "",
        schoolYear: r.school_year || "",
        purpose: r.purpose,
        aiStatus: r.status === "pending" ? "Pending" : r.status,
        aiNote: r.ai_note || "",
        receiptUrl: r.receipt_image || "",
      }));

      setRequests(mappedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchRequests(filter === "All" ? undefined : filter.toLowerCase());
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

  // Table headers
  const headers = [
    "Request ID",
    "Student",
    "Student ID",
    "Document Type",
    "Semester",
    "School Year",
    "Purpose",
    "Status",
    "Action",
  ];

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Pending") return r.aiStatus === "Pending" || r.aiStatus === "Checking";
    if (filter === "Approved") return r.aiStatus === "Valid" || r.aiStatus === "Approved";
    if (filter === "Rejected") return r.aiStatus === "Invalid" || r.aiStatus === "Rejected";
    return true;
  });

  // Table rows
  const rows = filteredRequests.map((r) => [
    r.id,
    r.student,
    r.studentId,
    r.documentType,
    r.semester,
    r.schoolYear,
    r.purpose,
    <div key={r.id}>
      <span className={`requests-status-badge ${r.aiStatus.toLowerCase()}`}>
        {r.aiStatus}
      </span>
      {r.aiNote && (
        <div className="ai-note">
          <small>{r.aiNote}</small>
        </div>
      )}
    </div>,
    <div key={r.id}>
      <button className="btn-view small" onClick={() => setSelected(r)}>
        View
      </button>
    </div>,
  ]);

  return (
    <div className="requests-screen">
      <Card title="Document Requests">
        <div className="filter-bar">
          <div className="filter-buttons">
            {["All", "Pending", "Approved", "Rejected"].map((f) => (
              <button
                key={f}
                className={filter === f ? "btn-filter active" : "btn-filter"}
                onClick={() => setFilter(f as any)}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="btn-history" onClick={() => navigate("/requests/history")}>
            Request History
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : rows.length > 0 ? (
          <div className="requests-table-scroll">
            <Table headers={headers} rows={rows} />
          </div>
        ) : (
          <div className="no-results">No requests found.</div>
        )}
      </Card>

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

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
