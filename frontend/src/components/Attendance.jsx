import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Attendance.css';

export const Attendance = () => {
  const { classid, lectureId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const studentResponse = await fetch(`http://localhost:8081/students/${classid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!studentResponse.ok) {
          throw new Error('Failed to fetch students');
        }

        const studentData = await studentResponse.json();
        setStudents(studentData);

        setAttendance(
          studentData.reduce((acc, student) => {
            acc[student.id] = false;
            return acc;
          }, {})
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classid]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status === 'Present',
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');
      const payload = {
        lectureId,
        attendance: students.map((student) => ({
          studentId: student.id,
          isPresent: attendance[student.id] ?? false,
        })),
      };

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('http://localhost:8081/saveAttendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save attendance');
      }

      alert('Attendance saved successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Loading students...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Attendance for Class {classid}</h2>

      {students.length > 0 ? (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <select
                    className="attendance-select"
                    value={attendance[student.id] ? 'Present' : 'Absent'}
                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-students">No students found for this class.</div>
      )}
      <div className='save-atd-btn'>
      <button className="save-attendance-btn" onClick={handleSubmit}>
        Save Attendance
      </button>
      </div>
    </div>
  );
};

export default Attendance;
