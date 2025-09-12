import Card from "../components/Card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
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
  return (
    <div className="reports-screen">
      <div className="grid-two">
        {/* Requests per Day */}
        <Card title="Requests per Day">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={requestData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="requests" fill="#2563eb" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Requests by Status */}
        <Card title="Requests by Status">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-two" style={{ marginTop: "16px" }}>
        {/* Appointments Overview */}
        <Card title="Appointments Overview">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={appointmentData}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="scheduled" fill="#2563eb" radius={[6,6,0,0]} />
              <Bar dataKey="completed" fill="#10b981" radius={[6,6,0,0]} />
              <Bar dataKey="expired" fill="#ef4444" radius={[6,6,0,0]} />
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
