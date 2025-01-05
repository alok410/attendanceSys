import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to decode the JWT token
import './HomePage.css'; // Import the CSS file
import Navbar from './Navbar';

const HomePage = () => {
  const [isAuthorized, setIsAuthorized] = useState(null); // `null` while loading, `true` if authorized, `false` otherwise.
  const [users, setUsers] = useState([]); // Users fetched from the protected endpoint.
  const [userDetails, setUserDetails] = useState(null); // To store logged-in user details.
  
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

 

  // Handle filter change
  const handleFilterChange = () => {
  };

  const handleLogout = () => {
    console.log('Logout hit');
    localStorage.removeItem('token');
    navigate('/login');
    
  };

  // Loading state
  if (isAuthorized === null) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="unauthorized-container">
        <h2>Unauthorized</h2>
        <p>You are not authorized to access this page.</p>
        <button
        style={{backgroundColor:"red "}}
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

  // Authorized state
  return (
    <>
      <Navbar />
      <div>
      <button
                className="class-button home-btn"
                onClick={() => navigate(`/class`)} // Navigate to the class details page
                >
                Attendance
              </button>
              <button
                className="class-button home-btn"
                onClick={() => navigate(`/students`)} // Navigate to the class details page
                >
                Add Students
              </button>
                </div>
    </>
  );
};

export default HomePage;
