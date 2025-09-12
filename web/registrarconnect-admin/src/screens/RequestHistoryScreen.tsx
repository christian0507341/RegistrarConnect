import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Table from "../components/Table";
import ReceiptModal from "../components/ReceiptModal";
import "../styles/screens/RequestHistoryScreen.css";

type HistoryRequest = {
  id: string;
  student: string;
  document: string;
  payment: string;
  submitted: string;
  status: "Approved" | "Rejected";
  processedNote: string;
  receiptUrl?: string;
};

export default function RequestHistoryScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<HistoryRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const headers = [
    "ID",
    "Student",
    "Document",
    "Payment",
    "Submitted",
    "Status",
    "Action",
  ];

  const data: HistoryRequest[] = [
    {
      id: "REQ-1001",
      student: "Christian Lloyd Francisco",
      document: "COM",
      payment: "Paid",
      submitted: "2025-07-15",
      status: "Approved",
      processedNote: "Approved by Admin",
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "REQ-1002",
      student: "June Gerald Macalinga",
      document: "COM",
      payment: "Paid",
      submitted: "2025-07-18",
      status: "Rejected",
      processedNote: "Rejected by Admin",
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "REQ-1003",
      student: "Christian Mondala",
      document: "COG",
      payment: "Paid",
      submitted: "2025-07-20",
      status: "Approved",
      processedNote: "Approved by AI",
      receiptUrl: "/receipts/receipt3.png",
    },
  ];

  const rows = data.map((r) => [
    r.id,
    r.student,
    r.document,
    r.payment,
    r.submitted,
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

  // 🔹 Keyboard shortcut: Esc to go back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setToast("Returning to Requests…");
        setTimeout(() => {
          setToast(null);
          navigate("/requests");
        }, 1000); // show toast for 1s before navigating
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return (
    <div className="request-history-screen">
      {/* 🔹 Back button */}
      <div className="back-button" onClick={() => navigate("/requests")}>
        ← Back to Requests
      </div>

      <Card title="Request History">
        <p className="small-muted">
          All processed document requests are archived here for reference.
        </p>
        <div style={{ height: 12 }} />
        <div className="table-scroll">
          <Table headers={headers} rows={rows} />
        </div>
      </Card>

      {selected && (
        <ReceiptModal
          student={selected.student}
          document={selected.document}
          receiptUrl={selected.receiptUrl}
          aiStatus={selected.status}
          aiNote={selected.processedNote}
          onClose={() => setSelected(null)}
        />
      )}

      {/* 🔹 Toast Notification */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
