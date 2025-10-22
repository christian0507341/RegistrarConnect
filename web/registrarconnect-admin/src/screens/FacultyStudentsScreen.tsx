import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Search, FileText, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface Student {
  id: number;
  name: string;
  student_id: string;
  email: string;
  course: string;
  year: string;
  appointments: number;
}

export default function FacultyStudentsScreen() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.faculty.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.includes(searchTerm)
  );
  
  if (loading) {
    return (
      <div className="faculty-students-screen">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-students-screen">
      <div className="screen-header">
        <h1>My Students</h1>
        <p>View and manage student information</p>
        <button onClick={fetchStudents} className="action-btn secondary">
          <RefreshCw size={16} />
          Refresh
        </button>
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
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <h3>No students found</h3>
            <p>You don't have any students assigned yet</p>
          </div>
        ) : (
          filteredStudents.map(student => (
            <div key={student.id} className="student-card">
              <div className="student-avatar">
                {student.name.charAt(0)}
              </div>
              <div className="student-info">
                <h3>{student.name}</h3>
                <p className="student-id">{student.student_id}</p>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}

