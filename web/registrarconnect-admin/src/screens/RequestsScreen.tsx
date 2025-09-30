import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const [requests, setRequests] = useState<Request[]>([
    {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },

        {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },
        {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },
        {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },
        {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },
        {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },
        {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },
        {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },
    
  ]);


  const [selected, setSelected] = useState<Request | null>(null);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  const [toast, setToast] = useState<string | null>(null);
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

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, aiStatus: "Approved", aiNote: "Approved by admin." }
          : r
      )
    );
    setSelected(null);
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, aiStatus: "Rejected", aiNote: "Rejected by admin." }
          : r
      )
    );
    setSelected(null);
  };



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

  const filteredRequests = requests.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Pending") return r.aiStatus === "Pending" || r.aiStatus === "Checking";
    if (filter === "Approved") return r.aiStatus === "Valid" || r.aiStatus === "Approved";
    if (filter === "Rejected") return r.aiStatus === "Invalid" || r.aiStatus === "Rejected";
    return true;
  });


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
            <button
              className={filter === "All" ? "btn-filter active" : "btn-filter"}
              onClick={() => setFilter("All")}
            >
              All
            </button>
            <button
              className={filter === "Pending" ? "btn-filter active" : "btn-filter"}
              onClick={() => setFilter("Pending")}
            >
              Pending
            </button>
            <button
              className={filter === "Approved" ? "btn-filter active" : "btn-filter"}
              onClick={() => setFilter("Approved")}
            >
              Approved
            </button>
            <button
              className={filter === "Rejected" ? "btn-filter active" : "btn-filter"}
              onClick={() => setFilter("Rejected")}
            >
              Rejected
            </button>
          </div>

          <button className="btn-history" onClick={() => navigate("/requests/history")}>
            Request History
          </button>
        </div>

        <div className="requests-table-scroll">
          {rows.length > 0 ? (
            <Table headers={headers} rows={rows} />
          ) : (
            <div className="no-results">No requests found.</div>
          )}
        </div>

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
