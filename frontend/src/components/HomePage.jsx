import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to decode the JWT token
import './HomePage.css'; // Import the CSS file
import Navbar from './Navbar';

const HomePage = () => {
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
    
    fetchUsers();
  }, []);

  // Filter classes based on selected filters
 

  // Handle filter change
  const handleFilterChange = () => {
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
      <Navbar />
      <button
                className="class-button"
                onClick={() => navigate(`/class`)} // Navigate to the class details page
              >
                Attendance
              </button>
    </>
  );
};

export default HomePage;
