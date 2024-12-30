import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import "./class.css"
const ClassPage = () => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [newClass, setNewClass] = useState({
    department: '',
    semester: '',
    program: '',
  });
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const navigate = useNavigate();

  // Fetch classes function
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const response = await fetch('http://localhost:8081/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch classes');

      const data = await response.json();
      setClasses(data);
      setFilteredClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const decodedToken = jwtDecode(token);
        setUserDetails(decodedToken);

        const response = await fetch('http://localhost:8081/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Unauthorized');

        const data = await response.json();
        setIsAuthorized(true);
        setUsers(data);
      } catch (error) {
        console.error(error.message);
        setIsAuthorized(false);
      }
    };

    fetchUsers();
    fetchClasses();
  }, []);

  const filterClasses = () => {
    let filtered = classes;

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(cls => cls.department === departmentFilter);
    }

    if (semesterFilter !== 'all') {
      filtered = filtered.filter(cls => cls.semester === semesterFilter);
    }

    if (programFilter !== 'all') {
      filtered = filtered.filter(cls => cls.program === programFilter);
    }

    setFilteredClasses(filtered);
  };

  const handleFilterChange = () => {
    filterClasses();
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const response = await fetch('http://localhost:8081/createClass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClass),
      });

      if (!response.ok) {
        throw new Error('Failed to create class');
      }

      const data = await response.json();

      // Fetch the updated list of classes after adding the new one
      fetchClasses(); // Refresh the classes list

      setNewClass({
        department: '',
        semester: '',
        program: '',
      });

      setShowCreateClassModal(false); // Close the modal after successful class creation
      alert('Class created successfully!');
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    }
  };

  if (isAuthorized === null) {
    return <div id="loading" className="loading">Loading...</div>;
  }

  if (!isAuthorized) {
    return (
      <div id="unauthorized-container" className="unauthorized-container">
        <h2>Unauthorized</h2>
        <p>You are not authorized to access this page.</p>
        <button
          id="login-button"
          onClick={() => {
            localStorage.removeItem('token');
            setIsAuthorized(null);
            navigate('/login');
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div id="classes-container" className="classes-container">
      <h2>GPER - Classes</h2>
      <div id="filters-container" className="filters">
        <div className="filter">
          <label htmlFor="department">Department</label>
          <select
            id="department-filter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
        </div>

        <div className="filter">
          <label htmlFor="semester">Semester</label>
          <select
            id="semester-filter"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
          >
            <option value="all">All</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        <div className="filter">
          <label htmlFor="program">Program</label>
          <select
            id="program-filter"
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Diploma">Diploma</option>
            <option value="BE">BE</option>
            <option value="Integrated MSc">Integrated MSc</option>
          </select>
        </div>

        <button
          id="apply-filters-button"
          className=""
          onClick={handleFilterChange}
        >
          Apply Filters
        </button>
      </div>

      <button
        id="create-class-button"
        className=""
        onClick={() => setShowCreateClassModal(true)} // Show the modal
      >
        Create Class
      </button>

      {showCreateClassModal && (
        <div id="create-class-modal" className="modal">
          <div id="modal-content" className="modal-content">
            <h3>Create New Class</h3>
            <form onSubmit={handleCreateClass}>
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="new-department"
                  value={newClass.department}
                  onChange={(e) => setNewClass({ ...newClass, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="semester">Semester</label>
                <input
                  type="number"
                  id="semester"
                  min="1"
                  max="8"
                  value={newClass.semester}
                  onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="program">Program</label>
                <select
                  id="program"
                  value={newClass.program}
                  onChange={(e) => setNewClass({ ...newClass, program: e.target.value })}
                >
                  <option value="">Select Program</option>
                  <option value="Diploma">Diploma</option>
                  <option value="BE">BE</option>
                  <option value="Integrated MSc">Integrated MSc</option>
                </select>
              </div>

              <div className="">
                <button  type="submit">Create Class</button>
                <button
                  style={{marginTop:"7px"}}
                  type="button"
                  onClick={() => setShowCreateClassModal(false)} // Close modal
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div id="classes-list" className="classes-list">
        {filteredClasses.length === 0 ? (
          <p>No classes available</p>
        ) : (
          filteredClasses.map((cls) => (
            <div key={cls.id} id={`class-${cls.id}`} >
              <button className='class-btn' 
                onClick={() => navigate(`/class/${cls.id}`)}
              >
                {cls.department} <br/> {cls.program} <br/>(sem - {cls.semester})
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassPage;
