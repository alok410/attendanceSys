import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Lectures.css';

const Lectures = () => {
  const { subjectId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [classId, setClassId] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [newLecture, setNewLecture] = useState({
    lectureTitle: '',
    summary: '',
    date: '',
    time: '',
  });
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const fetchLectures = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const subjectResponse = await fetch(`http://localhost:8081/subjects/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!subjectResponse.ok) {
        const errorMessage = await subjectResponse.text();
        throw new Error(`Failed to fetch subject details: ${errorMessage}`);
      }

      const subjectData = await subjectResponse.json();
      setClassId(subjectData.classid);
      setSubjectName(subjectData.subjectName);

      const lectureResponse = await fetch(`http://localhost:8081/lectures?subjectId=${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!lectureResponse.ok) {
        const errorMessage = await lectureResponse.text();
        throw new Error(`Failed to fetch lectures: ${errorMessage}`);
      }

      const lectureData = await lectureResponse.json();
      lectureData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLectures(lectureData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [subjectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLecture((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { lectureTitle, summary, date, time } = newLecture;
    if (!lectureTitle || !summary || !date || !time) {
      alert('Please fill in all the fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const payload = { lectureTitle, summary, date, time, subjectId, classId };
      const response = await fetch('http://localhost:8081/createlecture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lecture');
      }

      const createdLecture = await response.json();
      setLectures((prevLectures) => [...prevLectures, createdLecture]);
      setShowForm(false);
      setNewLecture({ lectureTitle: '', summary: '', date: '', time: '' });
      alert('Lecture created successfully!');
      fetchLectures();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setNewLecture({ lectureTitle: '', summary: '', date: '', time: '' });
  };

  if (loading) {
    return <div className="loading">Loading lectures...</div>;
  }

  return (
    <div className="lectures-container">
      <h2 className="lectures-title">Lectures for Subject: {subjectName}</h2>
      <button onClick={() => setShowForm(true)} className="add-lecture-btn">
        Add Lecture
      </button>

      {showForm && (
        <div className="popup-form">
          <div className="popup-content">
            <h3>Create New Lecture</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="lectureTitle">Lecture Title</label>
                <input
                  type="text"
                  id="lectureTitle"
                  name="lectureTitle"
                  value={newLecture.lectureTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="summary">Summary</label>
                <textarea
                  id="summary"
                  name="summary"
                  value={newLecture.summary}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newLecture.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={newLecture.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit">Create Lecture</button>
                <button type="button" onClick={handleCancel}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lectures.length === 0 ? (
        <p>No lectures available for this subject.</p>
      ) : (
        <div className="lectures-list">
          {lectures.map((lecture) => (
            <div key={lecture.id} className="lecture-item">
              <h3>{lecture.lectureTitle}</h3>
              <p>{lecture.summary}</p>
              <p>Date: {new Date(lecture.date).toLocaleDateString()}</p>
              <p>Time: {new Date(`1970-01-01T${lecture.time}Z`).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
              <button
                onClick={() => navigate(`/attendances/${classId}/${lecture.id}`)}
              >
                Mark Attendance
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lectures;
