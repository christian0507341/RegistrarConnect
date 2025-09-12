import "../styles/components/ReceiptModal.css";

type Props = {
  student: string;
  document: string;
  receiptUrl?: string;
  aiStatus: string;
  aiNote?: string;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
};

export default function ReceiptModal({
  student,
  document,
  receiptUrl,
  aiStatus,
  aiNote,
  onClose,
  onApprove,
  onReject,
}: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Receipt Preview</h2>
        <p>
          <strong>{student}</strong> — {document}
        </p>

        {receiptUrl ? (
          <img src={receiptUrl} alt="Receipt" className="receipt-preview" />
        ) : (
          <p className="small-muted">No receipt uploaded.</p>
        )}

        <div className="modal-status">
          <span className={`status-badge ${aiStatus.toLowerCase()}`}>
            {aiStatus}
          </span>
          {aiNote && <p className="ai-note">{aiNote}</p>}
        </div>

        <div className="modal-actions">
          {onApprove && (
            <>
              <button className="btn-primary small" onClick={onApprove}>
                Approve
              </button>
              {onReject && (
                <button className="btn-danger small" onClick={onReject}>
                  Reject
                </button>
              )}
            </>
          )}
          {}
          <button className="btn-close small" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
