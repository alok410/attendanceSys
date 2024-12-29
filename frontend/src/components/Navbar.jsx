import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <a href="/" className="navbar-logo">MyApp</a>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
      </div>
      <button className="navbar-logout" onClick={() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
