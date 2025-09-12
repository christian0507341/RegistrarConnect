import { useState } from "react";
import Card from "../components/Card";
import "../styles/screens/DashboardScreen.css";
import { Activity, CheckCircle2, Calendar, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardScreen() {
  const [trendType, setTrendType] = useState<"weekly" | "monthly" | "yearly">("weekly");

  // Example data (replace with API data later)
  const weeklyData = [
    { name: "Mon", requests: 24 },
    { name: "Tue", requests: 18 },
    { name: "Wed", requests: 32 },
    { name: "Thu", requests: 27 },
    { name: "Fri", requests: 40 },
    { name: "Sat", requests: 22 },
    { name: "Sun", requests: 15 },
  ];

  const monthlyData = [
    { name: "Week 1", requests: 120 },
    { name: "Week 2", requests: 150 },
    { name: "Week 3", requests: 200 },
    { name: "Week 4", requests: 180 },
  ];

  const yearlyData = [
    { name: "Jan", requests: 500 },
    { name: "Feb", requests: 450 },
    { name: "Mar", requests: 600 },
    { name: "Apr", requests: 700 },
    { name: "May", requests: 550 },
    { name: "Jun", requests: 620 },
    { name: "Jul", requests: 480 },
    { name: "Aug", requests: 530 },
    { name: "Sep", requests: 670 },
    { name: "Oct", requests: 720 },
    { name: "Nov", requests: 690 },
    { name: "Dec", requests: 800 },
  ];

  const data =
    trendType === "weekly"
      ? weeklyData
      : trendType === "monthly"
      ? monthlyData
      : yearlyData;

  return (
    <div className="dashboard-screen">
      <div className="card-grid-4">
        <Card title="Requests Today">
          <div className="stat">
            <div className="stat-value">24</div>
            <div className="small-muted">since 12:00 AM</div>
            <div className="stat-icon"><Activity size={20} /></div>
          </div>
        </Card>

        <Card title="Pending">
          <div className="stat">
            <div className="stat-value">12</div>
            <div className="small-muted">need action</div>
            <div className="stat-icon"><AlertTriangle size={20} /></div>
          </div>
        </Card>

        <Card title="Approved">
          <div className="stat">
            <div className="stat-value">102</div>
            <div className="small-muted">this month</div>
            <div className="stat-icon"><CheckCircle2 size={20} /></div>
          </div>
        </Card>

        <Card title="Appointments">
          <div className="stat">
            <div className="stat-value">8</div>
            <div className="small-muted">today</div>
            <div className="stat-icon"><Calendar size={20} /></div>
          </div>
        </Card>
      </div>

      <div className="dashboard-lower">
        <Card
          title={
            <div className="card-title-flex">
              <span>Requests Trend</span>
              <select
                value={trendType}
                onChange={(e) => setTrendType(e.target.value as "weekly" | "monthly" | "yearly")}
                className="trend-select"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          }
        >
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="#60a5fa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Quick Actions" className="quick-actions-card">
          <div className="row">
            <button className="btn-primary">Send Notifications</button>
            <button className="btn-ghost">Export CSV</button>
            <button className="btn-ghost">Block Time</button>
          </div>
        </Card>

      </div>
    </div>
  );
}
