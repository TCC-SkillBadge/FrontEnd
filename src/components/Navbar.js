import React from "react";
import "../styles/Navbar.css" 
import "bootstrap-icons/font/bootstrap-icons.css"; // Importa os ícones do Bootstrap

const NavBar = ({ userType, user }) => {
  const renderNavItems = () => {
    switch (userType) {
      case "common":
        return (
          <>
            <div className="tab">Home</div>
            <div className="tab">Wallet</div>
            <div className="tab">Skill Test</div>
            <div className="tab">About</div>
          </>
        );
      case "business":
        return (
          <>
            <div className="tab">Home</div>
            <div className="tab">Plans</div>
            <div className="tab">Badges</div>
            <div className="tab">Contact</div>
            <div className="tab">About</div>
          </>
        );
      case "admin":
        return (
          <>
            <div className="tab">Home</div>
            <div className="tab">Service Request</div>
            <div className="tab">Skills</div>
            <div className="tab">Service Plans</div>
          </>
        );
      default:
        return null;
    }
  };

  const renderUserMenu = () => {
    if (!user) return null;

    let menuItems;
    switch (userType) {
      case "common":
        menuItems = (
          <>
            <div className="menuItem">Profile</div>
            <div className="menuItem">Config</div>
            <div className="menuItem">Portfolio</div>
            <div className="menuItem">Log Out</div>
          </>
        );
        break;
      case "business":
        menuItems = (
          <>
            <div className="menuItem">Profile</div>
            <div className="menuItem">Config</div>
            <div className="menuItem">Analysis</div>
            <div className="menuItem">Log Out</div>
          </>
        );
        break;
      case "admin":
        menuItems = (
          <>
            <div className="menuItem">Profile</div>
            <div className="menuItem">Config</div>
            <div className="menuItem">Log Out</div>
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
          <div className="userIcon">
            {user.image ? (
              <img src={user.image} alt="User" className="userImage" />
            ) : (
              <i className="bi bi-person-circle userAvatar"></i>
            )}
            {renderUserMenu()}
          </div>
        ) : (
          <>
            <div className="signIn">Sign In</div>
            <div className="signUp">Sign Up</div>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;
