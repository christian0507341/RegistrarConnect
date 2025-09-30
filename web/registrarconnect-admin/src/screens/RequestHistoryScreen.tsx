import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Table from "../components/Table";
import ReceiptModal from "../components/ReceiptModal";
import "../styles/screens/RequestHistoryScreen.css";

type HistoryRequest = {
  id: string;
  student: string;
  studentId: string;
  documentType: string;
  semester: string;
  schoolYear: string;
  purpose: string;
  status: "Approved" | "Rejected";
  processedNote: string;
  receiptUrl?: string;
  submitted?: string; 
};

export default function RequestHistoryScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<HistoryRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const headers = [
    "ID",
    "Student",
    "Student ID",
    "Document Type",
    "Semester",
    "School Year",
    "Purpose",
    "Status",
    "Action",
  ];

  const data: HistoryRequest[] = [
    {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      status: "Approved",
      processedNote: "Approved by Admin",
      receiptUrl: "/receipts/receipt1.png",
      submitted: "2025-07-15",
    },
        {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      status: "Approved",
      processedNote: "Approved by Admin",
      receiptUrl: "/receipts/receipt1.png",
      submitted: "2025-07-15",
    },
    {
      id: "0001",
      student: "Christian Lloyd Francisco",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "1st Semester",
      schoolYear: "2025–2026",
      purpose: "Scholarship",
      status: "Approved",
      processedNote: "Approved by Admin",
      receiptUrl: "/receipts/receipt1.png",
      submitted: "2025-07-15",
    },
    {
      id: "0002",
      student: "June Gerald Macalinga",
      studentId: "03-2122-0123",
      documentType: "COM",
      semester: "2nd Semester",
      schoolYear: "2025–2026",
      purpose: "Graduation",
      status: "Rejected",
      processedNote: "Rejected by Admin",
      receiptUrl: "/receipts/receipt2.png",
      submitted: "2025-07-18",
    },
    {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      status: "Approved",
      processedNote: "Approved by AI",
      receiptUrl: "/receipts/receipt3.png",
      submitted: "2025-07-20",
    },
        {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      status: "Approved",
      processedNote: "Approved by AI",
      receiptUrl: "/receipts/receipt3.png",
      submitted: "2025-07-20",
    },
        {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      status: "Approved",
      processedNote: "Approved by AI",
      receiptUrl: "/receipts/receipt3.png",
      submitted: "2025-07-20",
    },
        {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      status: "Approved",
      processedNote: "Approved by AI",
      receiptUrl: "/receipts/receipt3.png",
      submitted: "2025-07-20",
    },
        {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      status: "Approved",
      processedNote: "Approved by AI",
      receiptUrl: "/receipts/receipt3.png",
      submitted: "2025-07-20",
    },
        {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      status: "Approved",
      processedNote: "Approved by AI",
      receiptUrl: "/receipts/receipt3.png",
      submitted: "2025-07-20",
    },
        {
      id: "0003",
      student: "Christian Mondala",
      studentId: "03-2122-0123",
      documentType: "COG",
      semester: "Summer",
      schoolYear: "2024–2025",
      purpose: "Transfer",
      status: "Approved",
      processedNote: "Approved by AI",
      receiptUrl: "/receipts/receipt3.png",
      submitted: "2025-07-20",
    },
  ];

  const filteredData = data.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !selectedDate || r.submitted === selectedDate;

    return matchesSearch && matchesDate;
  });

  const rows = filteredData.map((r) => [
    r.id,
    r.student,
    r.studentId,
    r.documentType,
    r.semester,
    r.schoolYear,
    r.purpose,
    <div key={r.id}>
      <span
        className={`history-status-badge ${
          r.status === "Approved" ? "approved" : "rejected"
        }`}
      >
        {r.status}
      </span>
      <div className="history-note">
        <small>{r.processedNote}</small>
      </div>
    </div>,
    <button key={r.id} className="btn-view small" onClick={() => setSelected(r)}>
      View
    </button>,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setToast("Returning to Requests…");
        setTimeout(() => {
          setToast(null);
          navigate("/requests");
        }, 1000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="request-history-screen">
      <div className="back-button" onClick={() => navigate("/requests")}>
        ← Back to Requests
      </div>

      <Card title="Request History">
        <div className="card-subheader">
          <p className="small-muted">
            All processed document requests are archived here for reference.
          </p>
          <div className="history-filters">
            <input
              type="text"
              className="history-search"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="date"
              className="history-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ height: 12 }} />
        <div className="table-scroll">
          {rows.length > 0 ? (
            <Table headers={headers} rows={rows} />
          ) : (
            <div className="no-results">No matching requests found.</div>
          )}
        </div>
      </Card>

      {selected && (
        <ReceiptModal
          student={selected.student}
          document={selected.documentType}
          receiptUrl={selected.receiptUrl}
          aiStatus={selected.status}
          aiNote={selected.processedNote}
          onClose={() => setSelected(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
