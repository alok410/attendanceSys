import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Subject.css';

const Subject = () => {
  const { classId } = useParams(); // Get the classId from the URL params
  const navigate = useNavigate(); // Initialize the navigate function
  const [subjects, setSubjects] = useState([]); // To store subjects of the selected class
  const [classDetails, setClassDetails] = useState({}); // To store class details (sem, department, program)
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    console.log("classid",classId)
    // Fetch class details
    const fetchClassDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found in local storage');

        const response = await fetch(`http://localhost:8081/class/${classId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch class details. Status: ${response.status}`);

        const data = await response.json();
        setClassDetails(data); // Set class details (sem, department, program)
      } catch (error) {
        console.error('Error fetching class details:', error.message);
      }
    };

    // Fetch subjects
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
        setLoading(false); // Stop loading after both fetches
      }
    };

    fetchClassDetails();
    fetchSubjects();
  }, [classId]); // Fetch data whenever classId changes

  // Show loading message while data is being fetched
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Function to handle subject button click
  const handleSubjectClick = (subjectId) => {
    navigate(`/lectures/${subjectId}`); // Navigate to the lectures page with subjectId
  };

  return (
    <div className="subject-container">
      <h2>Class {classId}</h2>
      <div className="class-details">
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
              key={subject.Id}
              className="subject-item"
              onClick={() => handleSubjectClick(subject.id)} // Navigate to lectures on click
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
