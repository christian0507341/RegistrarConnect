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
  documentApproved?: boolean;
  receiptApproved?: boolean;
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

      // Uncomment if you want to enforce login redirect
      // if (!accessToken) {
      //   console.error("No admin token found! Redirecting to login...");
      //   navigate("/login");
      //   return;
      // }

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
        documentType: r.document_type || "Transcript of Records", // dynamic document type
        semester: r.semester || "1st Semester",
        schoolYear: r.school_year || "2024–2025",
        purpose: r.purpose || "General Purpose",
        aiStatus: r.status === "pending" ? "Pending" : r.status,
        aiNote: r.ai_note || "",
        receiptUrl: r.receipt_image || "/sample-receipt.png", // sample receipt image
      }));

      setRequests(mappedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
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
          onChange={() => {
            const newDoc = !r.documentApproved;

            setRequests((prev) =>
              prev.map((req) =>
                req.id === r.id
                  ? {
                      ...req,
                      documentApproved: newDoc,
                      // If either document or receipt checked → Pending
                      aiStatus: newDoc || req.receiptApproved ? "Pending" : "Rejected",
                      aiNote: newDoc || req.receiptApproved
                        ? "Awaiting verification"
                        : "Notify student that request is rejected",
                    }
                  : req
              )
            );
          }}
        />
        <span className="slider"></span>
      </label>
      <span>{r.documentType}</span>
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
          onChange={() => {
            const newReceipt = !r.receiptApproved;

            setRequests((prev) =>
              prev.map((req) =>
                req.id === r.id
                  ? {
                      ...req,
                      receiptApproved: newReceipt,
                      // If either document or receipt checked → Pending
                      aiStatus: newReceipt || req.documentApproved ? "Pending" : "Rejected",
                      aiNote: newReceipt || req.documentApproved
                        ? "Awaiting verification"
                        : "Notify student that request is rejected",
                    }
                  : req
              )
            );
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
    </div>,
    r.semester,             // Semester
    r.schoolYear,           // School Year
    r.purpose,              // Purpose
    // Status column
    isApproved ? (
      <button
        key={`status-${r.id}`}
        className="requests-status-badge approved"
        onClick={() =>
          alert(`Notify ${r.student} that request is ready for claiming`)
        }
        style={{ cursor: "pointer", border: "none" }}
      >
        Notify Student for Claiming
      </button>
    ) : r.documentApproved || r.receiptApproved ? (
  <span key={`status-${r.id}`} className="requests-status-badge pending">
    Pending
  </span>
) : (
  <button
    key={`status-${r.id}`}
    className="requests-status-badge rejected"
    style={{ cursor: "pointer", border: "none" }}
    onClick={() => {
      // Here you can call backend API to notify student
      setToast(`Student ${r.student} has been notified about rejection`);
      setTimeout(() => setToast(null), 2000); // auto-hide toast
    }}
  >
    Notify Student that the request is rejected
  </button>
)
  ];
});


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
