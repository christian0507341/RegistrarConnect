import { useState } from "react";
import Card from "../components/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import "../styles/screens/ReportsScreen.css";

const requestData = [
  { day: "Mon", requests: 12 },
  { day: "Tue", requests: 18 },
  { day: "Wed", requests: 9 },
  { day: "Thu", requests: 14 },
  { day: "Fri", requests: 20 },
];

const statusData = [
  { name: "Approved", value: 45 },
  { name: "Pending", value: 30 },
  { name: "Rejected", value: 25 },
];

const appointmentData = [
  { week: "Week 1", scheduled: 15, completed: 10, expired: 5 },
  { week: "Week 2", scheduled: 18, completed: 12, expired: 4 },
  { week: "Week 3", scheduled: 20, completed: 15, expired: 3 },
  { week: "Week 4", scheduled: 25, completed: 18, expired: 6 },
];

export default function ReportsScreen() {
  const [trendType, setTrendType] = useState<"weekly" | "monthly" | "yearly">("weekly");

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

  const purposeData = [
    { purpose: "COE", count: 35 },
    { purpose: "OTR", count: 28 },
    { purpose: "Diploma Copy", count: 18 },
    { purpose: "Others", count: 12 },
  ];

  const trendData =
    trendType === "weekly" ? weeklyData : trendType === "monthly" ? monthlyData : yearlyData;

  const todayRequests = 18;
  const weekRequests = 73;
  const todayAppointments = 6;
  const weekAppointments = 22;

  return (
    <div className="reports-screen">
      <div className="grid-four summary-cards">
        <div className="summary-card">
          <h3>{todayRequests}</h3>
          <p>Requests Today</p>
        </div>
        <div className="summary-card">
          <h3>{weekRequests}</h3>
          <p>Requests This Week</p>
        </div>
        <div className="summary-card">
          <h3>{todayAppointments}</h3>
          <p>Appointments Today</p>
        </div>
        <div className="summary-card">
          <h3>{weekAppointments}</h3>
          <p>Appointments This Week</p>
        </div>
      </div>

      <Card
        title={
          <div className="card-title-flex">
            <span>Requests Trend</span>
            <select
              value={trendType}
              onChange={(e) =>
                setTrendType(e.target.value as "weekly" | "monthly" | "yearly")
              }
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
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid-two" style={{ marginTop: "16px" }}>
        <Card title="Requests per Day">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={requestData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Requests by Status">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-two" style={{ marginTop: "16px" }}>
        <Card title="Appointments Overview">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appointmentData}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="scheduled" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expired" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Requested Documents">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart layout="vertical" data={purposeData}>
              <XAxis type="number" />
              <YAxis dataKey="purpose" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Other Insights">
          <div className="chart-placeholder">[future report]</div>
        </Card>
      </div>
    </div>
  );
}
