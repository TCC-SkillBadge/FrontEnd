import React, { useState, useEffect } from "react";
import "../styles/Navbar.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink, useNavigate } from "react-router-dom";

const NavBar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserType = sessionStorage.getItem("tipoUsuario");
    const storedUserInfo = JSON.parse(sessionStorage.getItem("userInfo"));

    if (storedUserType) {
      setUserType(storedUserType);
    }

    if (storedUserInfo) {
      setUser(storedUserInfo);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const renderNavItems = () => {
    const navLinkClasses = ({ isActive }) => (isActive ? "tab active" : "tab");

    switch (userType) {
      case "UC":
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
      case "UE":
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
      case "UA":
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
      case "UC":
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
            <div className="menuItem" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Log Out
            </div>
          </>
        );
        break;
      case "UE":
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
            <div className="menuItem" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Log Out
            </div>
          </>
        );
        break;
      case "UA":
        menuItems = (
          <>
            <NavLink to="/profile" className="menuItem">
              <i className="bi bi-person"></i> Profile
            </NavLink>
            <NavLink to="/config" className="menuItem">
              <i className="bi bi-gear"></i> Config
            </NavLink>
            <div className="menuItem" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> Log Out
            </div>
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
            <NavLink to="/login" className="signIn">
              Sign In
            </NavLink>
            <NavLink to="/cadastro" className="signUp">
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
