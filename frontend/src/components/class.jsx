import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to decode the JWT token
import './HomePage.css'; // Import the CSS file

const ClassPage = () => {
  const [isAuthorized, setIsAuthorized] = useState(null); // `null` while loading, `true` if authorized, `false` otherwise.
  const [users, setUsers] = useState([]); // Users fetched from the protected endpoint.
  const [userDetails, setUserDetails] = useState(null); // To store logged-in user details.
  const [classes, setClasses] = useState([]); // To store classes fetched from backend
  const [filteredClasses, setFilteredClasses] = useState([]); // To store filtered classes
  const [departmentFilter, setDepartmentFilter] = useState('all'); // Department filter
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        // Decode the JWT token to get user details.
        const decodedToken = jwtDecode(token);
        setUserDetails(decodedToken); // Store user details in state.

        const response = await fetch('http://localhost:8081/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const data = await response.json();
        setIsAuthorized(true);
        setUsers(data);
      } catch (error) {
        console.error(error.message);
        setIsAuthorized(false);
      }
    };

    // Fetch the classes
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const response = await fetch('http://localhost:8081/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }

        const data = await response.json();
        setClasses(data);
        setFilteredClasses(data); // Initially show all classes
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchUsers();
    fetchClasses();
  }, []);

  // Filter classes based on selected filters
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

  // Handle filter change
  const handleFilterChange = () => {
    filterClasses();
  };

  const handleLogout = () => {
    console.log('Logout hit');
    // Remove the token from localStorage to log out the user.
    localStorage.removeItem('token');
    // Redirect the user to the login page.
    navigate('/login');
  };

  // Loading state
  if (isAuthorized === null) {
    return <div className="loading">Loading...</div>;
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="unauthorized-container">
        <h2>Unauthorized</h2>
        <p>You are not authorized to access this page.</p>
        <button
          onClick={() => {
            localStorage.removeItem('token'); // Remove the token
            setIsAuthorized(null); // Reset the authorized state
            navigate('/login'); // Navigate to login
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Authorized state
  return (
    <>
      <div className="classes-container">
        <h2>Classes</h2>
        {/* Filters for Department, Semester, and Program */}
        <div className="filters-container">
          <div className="filter">
            <label>Department</label>
            <select
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
            <label>Semester</label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              <option value="all">All</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label>Program</label>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Diploma">Diploma</option>
              <option value="BE">BE</option>
              <option value="Integrated MSc">Integrated MSc</option>
            </select>
          </div>

          <button style={{ height: "40px", marginTop: "20px" }} onClick={handleFilterChange}>
            Apply Filters
          </button>
        </div>

        {/* Classes List */}
        <div className="classes-list">
          {filteredClasses.length === 0 ? (
            <p>No classes available</p>
          ) : (
            filteredClasses.map((cls) => (
              <button
                key={cls.Id}
                className="class-button"
                onClick={() => navigate(`/class/${cls.id}`)} // Navigate to the class details page
              >
                {cls.department} - {cls.program} (sem - {cls.semester})
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ClassPage;
