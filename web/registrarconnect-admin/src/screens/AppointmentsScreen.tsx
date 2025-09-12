import { useState } from "react";
import Card from "../components/Card";
import "../styles/screens/AppointmentsScreen.css";
import { Clock, User, FileCheck, Lock } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Appointment = {
  name: string;
  purpose: string;
  status: "Approved" | "Pending" | "Rejected" | "Blocked" | "Claimed";
  date: string;
  approvedDate?: string;
  startTime?: string;
  endTime?: string;
};

type ForecastDay = {
  date: string;
  expectedRequests: number;
  level: "Low" | "Moderate" | "High";
};

function parseYMD(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map((n) => Number(n));
  return new Date(y, m - 1, d);
}

function atMidnight(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AppointmentsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      name: "Christian Mondala",
      purpose: "OTR pickup",
      status: "Approved",
      date: "2025-09-03",
      approvedDate: "2025-09-02",
    },
    {
      name: "Christian Lloyd Francisco",
      purpose: "COE request",
      status: "Approved",
      date: "2025-09-04",
      approvedDate: "2025-09-03",
    },
    {
      name: "June Gerald Macalinga",
      purpose: "Verify payment",
      status: "Rejected",
      date: "2025-09-05",
      approvedDate: "2025-09-03",
    },
  ]);

  const [requestForecast] = useState<ForecastDay[]>([
    { date: "2025-09-11", expectedRequests: 12, level: "High" },
    { date: "2025-09-13", expectedRequests: 8, level: "Moderate" },
    { date: "2025-09-15", expectedRequests: 3, level: "Low" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [blockStart, setBlockStart] = useState("12:00");
  const [blockEnd, setBlockEnd] = useState("13:30");

  function getClaimInfo(appointment: Appointment) {
    if (appointment.status !== "Approved" || !appointment.approvedDate)
      return null;

    const approved = parseYMD(appointment.approvedDate);
    const start = new Date(approved);
    start.setDate(start.getDate() + 2);

    if (start.getDay() === 0) start.setDate(start.getDate() + 1);

    const claimDates: Date[] = [];
    const iter = new Date(start);
    while (claimDates.length < 3) {
      if (iter.getDay() !== 0) claimDates.push(new Date(iter));
      iter.setDate(iter.getDate() + 1);
    }

    const startDate = atMidnight(claimDates[0]);
    const endDate = atMidnight(claimDates[claimDates.length - 1]);
    const today = atMidnight(new Date());

    const claimWindowText = `Claiming Period: ${formatDate(
      startDate
    )} – ${formatDate(endDate)}`;

    if (today > endDate)
      return { kind: "expired", text: `Expired (${claimWindowText})` };
    if (today >= startDate && today <= endDate)
      return { kind: "today", text: `Claim Today (${claimWindowText})` };
    return { kind: "claimable", text: claimWindowText };
  }

  function hasAppointmentsOn(date: Date) {
    const ds = date.toISOString().split("T")[0];
    return appointments.some((a) => a.date === ds);
  }

  function getForecastFor(date: Date) {
    const ds = date.toISOString().split("T")[0];
    return requestForecast.find((f) => f.date === ds);
  }

  const filtered = appointments.filter(
    (a) => a.date === selectedDate.toISOString().split("T")[0]
  );

  function handleBlockTime() {
    const dateStr = selectedDate.toISOString().split("T")[0];

    // Check for overlapping blocks
    const hasConflict = appointments.some(
      (a) =>
        a.date === dateStr &&
        a.status === "Blocked" &&
        a.startTime === blockStart &&
        a.endTime === blockEnd
    );

    if (hasConflict) {
      alert("A block already exists for this time.");
      return;
    }

    const reason = prompt("Reason for blocking this time? (optional)");

    const newBlock: Appointment = {
      name: "Registrar Office",
      purpose: reason || "Unavailable",
      status: "Blocked",
      date: dateStr,
      startTime: blockStart,
      endTime: blockEnd,
    };

    setAppointments((prev) => [...prev, newBlock]);
    setShowModal(false);
  }


  return (
    <div className="appointments-screen">
      <Card title="Request Forecast">
        {requestForecast.length === 0 ? (
          <p className="small-muted">No forecast available.</p>
        ) : (
          <ul className="forecast-list">
            {requestForecast.map((f, i) => (
              <li key={i} className={`forecast-${f.level.toLowerCase()}`}>
                <strong>{new Date(f.date).toDateString()}</strong>
                <span className={`forecast-badge ${f.level.toLowerCase()}`}>
                  {f.level}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid-two">
        <Card title="Calendar">
          <Calendar
            value={selectedDate}
            onChange={(value) => {
              if (value instanceof Date) setSelectedDate(value);
            }}
            tileContent={({ date, view }) => {
              if (view === "month") {
                if (hasAppointmentsOn(date)) return <div className="dot" />;
                const forecast = getForecastFor(date);
                if (forecast)
                  return (
                    <div
                      className={`forecast-dot ${forecast.level.toLowerCase()}`}
                    />
                  );
              }
              return null;
            }}
          />
          <button
            className="btn-primary block-btn"
            onClick={() => setShowModal(true)}
          >
            + Block Time
          </button>
        </Card>

        <Card title={`Appointments on ${selectedDate.toDateString()}`}>
          {filtered.length === 0 ? (
            <p className="small-muted">No appointments scheduled.</p>
          ) : (
            <div className="appointments-list-container">
              <ul className="upcoming-list">
                {filtered.map((a, i) => {
                  if (a.status === "Blocked") {
                    return (
                      <li key={i} className="status-blocked">
                        <div className="appointment-main">
                          <Lock size={16} />{" "}
                          <strong>
                            {a.startTime} – {a.endTime}
                          </strong>
                        </div>
                        <div className="small-muted">{a.purpose}</div>
                        <span className="status-badge blocked">Blocked</span>

                        <button
                          className="btn-remove-block"
                          onClick={() =>
                            setAppointments((prev) =>
                              prev.filter((appt) => appt !== a)
                            )
                          }
                        >
                          Remove
                        </button>
                      </li>
                    );
                  }

                  const claimInfo = getClaimInfo(a);
                  return (
                    <li key={i} className={`status-${a.status.toLowerCase()}`}>
                      <div className="appointment-main">
                        <User size={16} /> <strong>{a.name}</strong>
                      </div>

                      <div className="small-muted">
                        <Clock size={14} /> 10:00 AM – 5:00 PM — {a.purpose}
                      </div>

                      <span className="status-badge">{a.status}</span>

                      {claimInfo && (
                        <div className="claim-actions">
                          <div className={`claim-badge claim-${claimInfo.kind}`}>
                            <FileCheck size={14} /> {claimInfo.text}
                          </div>

                          {a.status === "Approved" && (
                            <button
                              className="claim-btn"
                              onClick={() => {
                                setAppointments((prev) =>
                                  prev.map((app, idx) =>
                                    idx === i ? { ...app, status: "Claimed" } : app
                                  )
                                );
                              }}
                            >
                              Mark as Claimed
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Block Time</h3>
            <label>
              Start Time:
              <input
                type="time"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
              />
            </label>
            <label>
              End Time:
              <input
                type="time"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
              />
            </label>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleBlockTime}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
