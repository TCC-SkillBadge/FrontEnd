import React from "react";
import "../styles/Navbar.css" 
import "bootstrap-icons/font/bootstrap-icons.css"; // Importa os ícones do Bootstrap
import { useState } from "react";
import { Link } from "react-router-dom";

const NavBar = ({ userType, user }) => {
  const [showMenu, setShowMenu] = useState(false);

  const renderNavItems = () => {
    switch (userType) {
      case "common":
        return (
          <>
            <Link to="/home" className="tab">
              Home
            </Link>
            <Link to="/wallet" className="tab">
              Wallet
            </Link>
            <Link to="/skill-test" className="tab">
              Skill Test
            </Link>
            <Link to="/about" className="tab">
              About
            </Link>
          </>
        );
      case "business":
        return (
          <>
            <Link to="/home" className="tab">
              Home
            </Link>
            <Link to="/plans" className="tab">
              Plans
            </Link>
            <Link to="/badges" className="tab">
              Badges
            </Link>
            <Link to="/contact" className="tab">
              Contact
            </Link>
            <Link to="/about" className="tab">
              About
            </Link>
          </>
        );
      case "admin":
        return (
          <>
            <Link to="/home" className="tab">
              Home
            </Link>
            <Link to="/service-request" className="tab">
              Service Request
            </Link>
            <Link to="/skills" className="tab">
              Skills
            </Link>
            <Link to="/service-plans" className="tab">
              Service Plans
            </Link>
          </>
        );
      default:
        return (
          <>
            <Link to="/home" className="tab">
              Home
            </Link>
            <Link to="/about" className="tab">
              About
            </Link>
          </>
        );
    }
  };

  const renderUserMenu = () => {
    let menuItems;
    switch (userType) {
      case "common":
        menuItems = (
          <>
            <Link to="/profile" className="menuItem">
              <i className="bi bi-person"></i> Profile
            </Link>
            <Link to="/config" className="menuItem">
              <i className="bi bi-gear"></i> Config
            </Link>
            <Link to="/portfolio" className="menuItem">
              <i className="bi bi-briefcase"></i> Portfolio
            </Link>
            <Link to="/logout" className="menuItem">
              <i className="bi bi-box-arrow-right"></i> Log Out
            </Link>
          </>
        );
        break;
      case "business":
        menuItems = (
          <>
            <Link to="/profile" className="menuItem">
              <i className="bi bi-person"></i> Profile
            </Link>
            <Link to="/config" className="menuItem">
              <i className="bi bi-gear"></i> Config
            </Link>
            <Link to="/analysis" className="menuItem">
              <i className="bi bi-bar-chart"></i> Analysis
            </Link>
            <Link to="/logout" className="menuItem">
              <i className="bi bi-box-arrow-right"></i> Log Out
            </Link>
          </>
        );
        break;
      case "admin":
        menuItems = (
          <>
            <Link to="/profile" className="menuItem">
              <i className="bi bi-person"></i> Profile
            </Link>
            <Link to="/config" className="menuItem">
              <i className="bi bi-gear"></i> Config
            </Link>
            <Link to="/logout" className="menuItem">
              <i className="bi bi-box-arrow-right"></i> Log Out
            </Link>
          </>
        );
        break;
      default:
        menuItems = null;
    }

    return <div className="userMenu">{menuItems}</div>;
  };

  return (
    <div className="navbar">
      <div className="navLinks">{renderNavItems()}</div>
      <div className="searchSection">
        <input className="searchInput" type="text" placeholder="Buscar" />
      </div>
      <div className="authButtons">
        {user ? (
          <div
            className="userIcon"
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            {user.image ? (
              <img src={user.image} alt="User" className="userImage" />
            ) : (
              <i className="bi bi-person-circle userAvatar"></i>
            )}
            {showMenu && renderUserMenu()}
          </div>
        ) : (
          <>
            <Link to="/sign-in" className="signIn">
              Sign In
            </Link>
            <Link to="/sign-up" className="signUp">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
