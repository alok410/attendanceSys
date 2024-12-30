import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Subject.css';

const Subject = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [classDetails, setClassDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    subjectCode: '',
    subjectName: '',
    faculty_1: '',
    faculty_2: '',
    faculty_3: '',
    faculty_4: '',
  });
  const [facultyList, setFacultyList] = useState([]); // State to store the list of faculties

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found in local storage');

        const response = await fetch(`http://localhost:8081/class/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch class details. Status: ${response.status}`);
        const data = await response.json();
        setClassDetails(data);
      } catch (error) {
        console.error('Error fetching class details:', error.message);
      }
    };

    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found in local storage');

        const response = await fetch(`http://localhost:8081/subjects?classId=${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch subjects. Status: ${response.status}`);
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFaculties = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found in local storage');

        const response = await fetch('http://localhost:8081/faculties', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch faculties. Status: ${response.status}`);
        const data = await response.json();
        setFacultyList(data); // Store the faculty list
      } catch (error) {
        console.error('Error fetching faculties:', error.message);
      }
    };

    fetchClassDetails();
    fetchSubjects();
    fetchFaculties(); // Fetch faculties when the component mounts
  }, [classId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handleSubjectClick = (subjectId) => {
    navigate(`/lectures/${subjectId}`);
  };

  const handleCreateSubjectClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject((prevSubject) => ({
      ...prevSubject,
      classid: classId,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found in local storage');
  
      const response = await fetch(`http://localhost:8081/createsubjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSubject),
      });
  
      if (!response.ok) throw new Error('Failed to create subject');
  
      const createdSubject = await response.json();
      setSubjects((prevSubjects) => [...prevSubjects, createdSubject]);
  
      // Reset the form fields
      setNewSubject({
        subjectCode: '',
        subjectName: '',
        faculty_1: '',
        faculty_2: '',
        faculty_3: '',
        faculty_4: '',
      });
  
      handleCloseModal();  // Close the modal after successful creation
    } catch (error) {
      console.error('Error creating subject:', error.message);
    }
  };
  

  return (
    <div className="subject-container">
      <h2>Class {classId}</h2>
      <button className="create-subject-btn" onClick={handleCreateSubjectClick}>
        Create Subject
      </button>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={handleCloseModal}>
              &times;
            </span>
            <h3>Create Subject</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="subjectCode">Subject Code</label>
                <input
                  type="text"
                  id="subjectCode"
                  name="subjectCode"
                  value={newSubject.subjectCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subjectName">Subject Name</label>
                <input
                  type="text"
                  id="subjectName"
                  name="subjectName"
                  value={newSubject.subjectName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {['faculty_1', 'faculty_2', 'faculty_3', 'faculty_4'].map((facultyField, index) => (
                <div key={index} className="form-group">
                  <label htmlFor={facultyField}>Faculty {index + 1}</label>
                  <select
                    id={facultyField}
                    name={facultyField}
                    value={newSubject[facultyField]}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Faculty</option>
                    {facultyList.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button type="submit">Create</button>
              <button onClick={()=>{handleCloseModal()}}  >Cancle</button>
            </form>
          </div>
        </div>
      )}

      <div style={{marginTop:"30px"}} className="class-details">
        <p><strong>Program:</strong> {classDetails.program || 'Not available'}</p>
        <p><strong>Department:</strong> {classDetails.department || 'Not available'}</p>
        <p><strong>Semester:</strong> {classDetails.semester || 'Not available'}</p>
      </div>

      {subjects.length === 0 ? (
        <p>No subjects available for this class.</p>
      ) : (
        <ul className="subject-list">
          {subjects.map((subject) => (
            <li
              key={subject.id}
              className="subject-item"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <button>
                <span className="subject-code">{subject.subjectCode || 'No Code Available'}</span>
                <span className="subject-name">{subject.subjectName || 'Unnamed Subject'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Subject;
