import React from "react";
import "../styles/Navbar.css"; // Importa o arquivo CSS

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

  return (
    <div className="navbar">
      <div className="navLinks">{renderNavItems()}</div>
      <div className="authSection">
        <div className="searchSection">
          <input className="searchInput" type="text" placeholder="Buscar" />
        </div>
        <div className="authButtons">
          {user ? (
            <img src={user.image} alt="User" className="userImage" />
          ) : (
            <>
              <div className="signIn">Sign In</div>
              <div className="signUp">Sign Up</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;

