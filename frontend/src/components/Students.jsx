import React, { useState, useEffect } from 'react';
import "./Students.css";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    class_id: ''
  });
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 6;

  // Password visibility state
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Filter state for program, department, and semester
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Fetching classes with token validation
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const response = await fetch('http://localhost:8081/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch classes');

        const data = await response.json();

        // Sort classes by program (A-Z), department (A-Z), and semester (1-8)
        data.sort((a, b) => {
          if (a.program.localeCompare(b.program) !== 0) {
            return a.program.localeCompare(b.program);
          }
          if (a.department.localeCompare(b.department) !== 0) {
            return a.department.localeCompare(b.department);
          }
          return a.semester - b.semester;
        });

        setClasses(data);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to fetch classes');
      }
    };

    fetchClasses();
  }, []);

  // Fetching students only once
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const response = await fetch('http://localhost:8081/studentslist', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Handling page change for pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAddStudentClick = () => {
    setShowForm(true);
  };

  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const response = await fetch('http://localhost:8081/addStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStudent),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Show success alert
        alert('Student added successfully!');

        // Close the form (popup)
        setShowForm(false);

        // Reset the form fields
        setNewStudent({ name: '', email: '', password: '', role: 'Student', class_id: '' });

        // Optionally, refresh the students list after successful submission
        const updatedResponse = await fetch('http://localhost:8081/studentslist', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedData = await updatedResponse.json();
        setStudents(updatedData);
      } else {
        // If the email already exists, show an alert and close the popup
        if (responseData.error === 'Email already exists') {
          alert('This email is already registered.');
        } else {
          alert(responseData.error || 'Failed to add student');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setNewStudent({ name: '', email: '', password: '', role: 'Student', class_id: '' });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  
  // Filter students based on selected criteria
  const filteredStudents = students.filter((student) => {
    const studentClass = classes.find((cls) => cls.id === student.class_id);
    return (
      (!selectedProgram || studentClass?.program === selectedProgram) &&
      (!selectedDepartment || studentClass?.department === selectedDepartment) &&
      (!selectedSemester || studentClass?.semester === parseInt(selectedSemester))
    );
  });

  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  if (loading) {
    return <div>Loading students...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="students-list-container">
      <button style={{ background: "black" }} onClick={handleAddStudentClick}>Add Student</button>

      <h2>Students List</h2>

      <div className="filter-container">
        <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
          <option value="">Filter by Program</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.program}>{cls.program}</option>
          ))}
        </select>
        <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
          <option value="">Filter by Department</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.department}>{cls.department}</option>
          ))}
        </select>
        <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
          <option value="">Filter by Semester</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.semester}>{cls.semester}</option>
          ))}
        </select>
      </div>

      {students.length === 0 ? (
        <p>No students found</p>
      ) : (
        <div className="students-table-container">
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>Name</th>
                <th style={{ textAlign: "center" }}>Email</th>
                <th style={{ textAlign: "center" }}>Role</th>

                <th style={{ textAlign: "center" }}>Class</th>
                <th style={{ textAlign: "center" }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => {
                const studentClass = classes.find((cls) => cls.id === student.class_id);
                return (
                  <tr key={student.id}>
                    <td style={{ textAlign: "center" }}>{student.name}</td>
                    <td style={{ textAlign: "center" }}>{student.email}</td>
                    <td style={{ textAlign: "center" }}>{student.role}</td>
                    <td style={{ textAlign: "center" }}>
                      {studentClass ? `${studentClass.program} - ${studentClass.department} (sem - ${studentClass.semester})` : 'Class Not Found'}
                    </td>
                <td style={{ textAlign: "center" }}><butto onClick={()=>{alert("heh")}} style={{cursor:"pointer"}}>Delete</butto></td>

                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length > studentsPerPage && (
            <div className="pagination">
              {Array.from({ length: Math.ceil(filteredStudents.length / studentsPerPage) }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? 'active' : ''}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Student</h3>
            <form onSubmit={handleFormSubmit} className="student-form">
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={newStudent.name}
                  onChange={handleFormInputChange}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleFormInputChange}
                  required
                />
              </label>
              <label>
                Password:
                <div style={{ display: 'flex' }}>
                  <input
                    style={{ width: '80%' }}
                    type={passwordVisible ? 'text' : 'password'}
                    name="password"
                    value={newStudent.password}
                    onChange={handleFormInputChange}
                    required
                  />
                  <button
                    style={{
                      background: 'none',
                      width: '30px',
                      height: '30px',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                    }}
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? '🙈' : '👁️'}
                  </button>
                </div>
              </label>
              <label>
                Role:
                <input
                  type="text"
                  name="role"
                  value={newStudent.role}
                  disabled
                />
              </label>
              <label>
                Class ID:
                <select
                  name="class_id"
                  value={newStudent.class_id}
                  onChange={handleFormInputChange}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.program} - {cls.department} (sem - {cls.semester})
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit">Submit</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
