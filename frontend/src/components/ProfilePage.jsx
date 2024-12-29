import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UpdateProfileDialog from "./UpdateProfileDialog";
import "./ProfilePage.css"; // Import the CSS file

const ProfilePage = () => {
  const [user, setUser] = useState(null); // User information state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  // Fetch user data using the token from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect to login if token is not available
      return;
    }

    // Fetch user profile after login
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send the token for authentication
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUser(data); // Set the user data received from the API
      } catch (error) {
        setErrorMessage("Error fetching user data. Please try again later.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleEditClick = () => {
    setIsModalOpen(true); // Open the modal when the edit button is clicked
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token on logout
    navigate("/login"); // Redirect to login page
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  if (loading) {
    return <p>Loading user data...</p>; // Display loading state
  }

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>


      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Show error message */}
      {user ? (
        <div className="profile-details">
          <p><strong>Name:</strong> {user.name} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {/* <button onClick={handleEditClick}>Edit Profile</button> */}
          <button style={{marginLeft:"700px"}} onClick={handleLogout}>Logout</button>
             
          
    {/* Back button */}
    <button style={{marginTop:"30px"}}  onClick={handleBackClick}>Back</button> 
        </div>
      ) : (
        <p>No user data available</p>
      )}

      {/* Modal for updating profile */}
      {/* {isModalOpen && <UpdateProfileDialog user={user} onClose={() => setIsModalOpen(false)} />} */}
    </div>
  );
};

export default ProfilePage;
