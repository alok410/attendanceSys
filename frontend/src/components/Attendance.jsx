import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Attendance.css"

export const Attendance = () => {
  // Destructure both classid and lectureid from the URL params
  const { classid, lectureId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState({}); // State for attendance

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
        if (!token) throw new Error('Token not found');

        // Fetch students data for the specific classId
        const studentResponse = await fetch(`http://localhost:8081/students/${classid}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token for authentication
          },
        });
        if (!studentResponse.ok) {
          throw new Error('Failed to fetch students');
        }

        const studentData = await studentResponse.json();
        setStudents(studentData); // Set students data in state

        // Initialize attendance state with default values
        setAttendance(
          studentData.reduce((acc, student) => {
            acc[student.id] = false; // Default attendance is "Absent"
            return acc;
          }, {})
        );
      } catch (error) {
        setError(error.message); // Set error message if any error occurs
      } finally {
        setLoading(false); // Set loading to false once data is fetched or error occurs
      }
    };

    fetchStudents(); // Call the fetchStudents function
  }, [classid]); // Re-run the effect if classid changes

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status === 'Present', // Convert to boolean
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');
      const payload = {
        lectureId: lectureId, // Ensure you're sending the correct lectureId
        attendance: students.map((student) => ({
          studentId: student.id,
          isPresent: attendance[student.id] ?? false, // Use false if not modified
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

  // Show loading message while data is being fetched
  if (loading) return <div>Loading students...</div>;

  // Show error message if any error occurs
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Attendance for Class {classid}</h2>

      {/* Display student list */}
      {students.length > 0 ? (
        <table>
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
        <div>No students found for this class.</div>
      )}

      <button onClick={handleSubmit}>Save Attendance</button>
    </div>
  );
};

export default Attendance;
