import React, { useState } from "react";
import "../styles/Navbar.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router-dom";

const NavBar = ({ userType, user }) => {
  const [showMenu, setShowMenu] = useState(false);

  const renderNavItems = () => {
    const navLinkClasses = ({ isActive }) => (isActive ? "tab active" : "tab");

    switch (userType) {
      case "common":
        return (
          <>
            <NavLink to="/home" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/wallet" className={navLinkClasses}>
              Wallet
            </NavLink>
            <NavLink to="/skill-test" className={navLinkClasses}>
              Skill Test
            </NavLink>
            <NavLink to="/about" className={navLinkClasses}>
              About
            </NavLink>
          </>
        );
      case "business":
        return (
          <>
            <NavLink to="/home" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/plans" className={navLinkClasses}>
              Plans
            </NavLink>
            <NavLink to="/badges" className={navLinkClasses}>
              Badges
            </NavLink>
            <NavLink to="/contact" className={navLinkClasses}>
              Contact
            </NavLink>
            <NavLink to="/about" className={navLinkClasses}>
              About
            </NavLink>
          </>
        );
      case "admin":
        return (
          <>
            <NavLink to="/home" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/service-request" className={navLinkClasses}>
              Service Request
            </NavLink>
            <NavLink to="/skills" className={navLinkClasses}>
              Skills
            </NavLink>
            <NavLink to="/service-plans" className={navLinkClasses}>
              Service Plans
            </NavLink>
          </>
        );
      default:
        return (
          <>
            <NavLink to="/home" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/about" className={navLinkClasses}>
              About
            </NavLink>
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
            <NavLink to="/profile" className="menuItem">
              <i className="bi bi-person"></i> Profile
            </NavLink>
            <NavLink to="/config" className="menuItem">
              <i className="bi bi-gear"></i> Config
            </NavLink>
            <NavLink to="/portfolio" className="menuItem">
              <i className="bi bi-briefcase"></i> Portfolio
            </NavLink>
            <NavLink to="/logout" className="menuItem">
              <i className="bi bi-box-arrow-right"></i> Log Out
            </NavLink>
          </>
        );
        break;
      case "business":
        menuItems = (
          <>
            <NavLink to="/profile" className="menuItem">
              <i className="bi bi-person"></i> Profile
            </NavLink>
            <NavLink to="/config" className="menuItem">
              <i className="bi bi-gear"></i> Config
            </NavLink>
            <NavLink to="/analysis" className="menuItem">
              <i className="bi bi-bar-chart"></i> Analysis
            </NavLink>
            <NavLink to="/logout" className="menuItem">
              <i className="bi bi-box-arrow-right"></i> Log Out
            </NavLink>
          </>
        );
        break;
      case "admin":
        menuItems = (
          <>
            <NavLink to="/profile" className="menuItem">
              <i className="bi bi-person"></i> Profile
            </NavLink>
            <NavLink to="/config" className="menuItem">
              <i className="bi bi-gear"></i> Config
            </NavLink>
            <NavLink to="/logout" className="menuItem">
              <i className="bi bi-box-arrow-right"></i> Log Out
            </NavLink>
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
            <NavLink to="/sign-in" className="signIn">
              Sign In
            </NavLink>
            <NavLink to="/sign-up" className="signUp">
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
