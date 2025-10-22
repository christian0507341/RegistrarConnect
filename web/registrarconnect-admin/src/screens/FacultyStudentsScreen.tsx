import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Search, FileText } from 'lucide-react';

export default function FacultyStudentsScreen() {
  const navigate = useNavigate();
  const [students] = useState([
    { id: 1, name: "John Doe", studentId: "2020-0001", email: "john@example.com", course: "BSCS", year: "4th Year", appointments: 5 },
    { id: 2, name: "Jane Smith", studentId: "2021-0002", email: "jane@example.com", course: "BSIT", year: "3rd Year", appointments: 3 },
    { id: 3, name: "Mike Johnson", studentId: "2022-0003", email: "mike@example.com", course: "BSCS", year: "2nd Year", appointments: 7 },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Authentication is handled by the protected route in App.tsx
    // TODO: Fetch students data from backend
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.includes(searchTerm)
  );

  return (
    <div className="faculty-students-screen">
      <div className="screen-header">
        <h1>My Students</h1>
        <p>View and manage student information</p>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="students-grid">
        {filteredStudents.map(student => (
          <div key={student.id} className="student-card">
            <div className="student-avatar">
              {student.name.charAt(0)}
            </div>
            <div className="student-info">
              <h3>{student.name}</h3>
              <p className="student-id">{student.studentId}</p>
              <div className="student-details">
                <div className="detail-item">
                  <Mail size={14} />
                  <span>{student.email}</span>
                </div>
                <div className="detail-item">
                  <FileText size={14} />
                  <span>{student.course} - {student.year}</span>
                </div>
                <div className="detail-item">
                  <Calendar size={14} />
                  <span>{student.appointments} appointments</span>
                </div>
              </div>
            </div>
            <div className="card-actions">
              <button className="action-btn primary">View Profile</button>
              <button className="action-btn secondary">Schedule Meeting</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

