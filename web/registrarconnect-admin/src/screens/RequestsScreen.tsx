import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Table from "../components/Table";
import ReceiptModal from "../components/ReceiptModal";
import "../styles/screens/RequestsScreen.css";

type Request = {
  id: string;
  student: string;
  document: string;
  payment: string;
  submitted: string;
  aiStatus: "Pending" | "Valid" | "Invalid" | "Checking" | "Approved" | "Rejected";
  aiNote?: string;
  receiptUrl?: string;
};

export default function RequestsScreen() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<Request[]>([
    {
      id: "REQ-1042",
      student: "Christian Lloyd Francisco",
      document: "COM",
      payment: "Unverified",
      submitted: "2025-08-29",
      aiStatus: "Pending", 
      receiptUrl: "/receipts/receipt1.png",
    },
    {
      id: "REQ-1043",
      student: "June Gerald Macalinga",
      document: "COM",
      payment: "Paid",
      submitted: "2025-08-30",
      aiStatus: "Pending", 
      receiptUrl: "/receipts/receipt2.png",
    },
    {
      id: "REQ-1045",
      student: "Christian Mondala",
      document: "COG",
      payment: "Missing",
      submitted: "2025-08-28",
      aiStatus: "Pending",
      receiptUrl: "/receipts/receipt3.png",
    },
  ]);


  const [selected, setSelected] = useState<Request | null>(null);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

  const [enableManualCheck, setEnableManualCheck] = useState(false);
  const [autoCheck, setAutoCheck] = useState(false);

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


  const handleAICheck = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, aiStatus: "Checking", aiNote: undefined } : r
      )
    );

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                aiStatus: "Valid",
                aiNote: "Receipt verified successfully.",
              }
            : r
        )
      );
    }, 2000);
  };

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

  const handleApproveAll = () => {
    setRequests((prev) =>
      prev.map((r) =>
        r.aiStatus === "Valid"
          ? { ...r, aiStatus: "Approved", aiNote: "Approved by admin." }
          : r
      )
    );
  };

  const handleRejectAll = () => {
    setRequests((prev) =>
      prev.map((r) =>
        r.aiStatus === "Invalid"
          ? { ...r, aiStatus: "Rejected", aiNote: "Rejected by admin." }
          : r
      )
    );
  };

  useEffect(() => {
    if (autoCheck) {
      requests.forEach((r) => {
        if (r.aiStatus === "Pending") handleAICheck(r.id);
      });
    }
  }, [autoCheck, requests]);

  const headers = [
    "ID",
    "Student",
    "Document",
    "Payment",
    "Submitted",
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
    r.document,
    r.payment,
    r.submitted,
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
      {enableManualCheck && r.aiStatus === "Pending" && !autoCheck && (
        <button
          className="btn-primary small"
          onClick={() => handleAICheck(r.id)}
        >
          Run AI Check
        </button>
      )}

      {r.aiStatus === "Checking" && (
        <button className="btn-disabled small" disabled>
          Checking...
        </button>
      )}

      {!enableManualCheck && r.aiStatus === "Pending" && (
        <button className="btn-view small" onClick={() => setSelected(r)}>
          View
        </button>
      )}

      {(r.aiStatus === "Valid" ||
        r.aiStatus === "Invalid" ||
        r.aiStatus === "Approved" ||
        r.aiStatus === "Rejected") && (
        <button className="btn-view small" onClick={() => setSelected(r)}>
          View
        </button>
      )}
    </div>

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

        <div className="bulk-actions">
          <button
            className="btn-approve-all"
            onClick={handleApproveAll}
            disabled={!requests.some((r) => r.aiStatus === "Valid")}
          >
            Approve All Ready ({requests.filter((r) => r.aiStatus === "Valid").length})
          </button>
          <button
            className="btn-reject-all"
            onClick={handleRejectAll}
            disabled={!requests.some((r) => r.aiStatus === "Invalid")}
          >
            Reject All Invalid ({requests.filter((r) => r.aiStatus === "Invalid").length})
          </button>

          <label className="toggle">
            <input
              type="checkbox"
              checked={enableManualCheck}
              onChange={() => {
                setEnableManualCheck(!enableManualCheck);
                if (!enableManualCheck) setAutoCheck(false); 
              }}
            />
            <span className="slider" /> Enable Manual AI Check
          </label>

          {enableManualCheck && (
            <label className="toggle">
              <input
                type="checkbox"
                checked={autoCheck}
                onChange={() => setAutoCheck(!autoCheck)}
              />
              <span className="slider" /> Auto AI Check
            </label>
          )}
        </div>

        <div className="requests-table-container">
          <Table headers={headers} rows={rows} />
        </div>
      </Card>

      {selected && (
        <ReceiptModal
          student={selected.student}
          document={selected.document}
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
