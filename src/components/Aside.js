import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Aside.css"; // Certifique-se de criar este arquivo de estilo

const Aside = ({ userType }) => {
  return (
    <aside className="aside">
      <div className="aside-header">
        <h2>Menu</h2>
      </div>
      <nav className="aside-nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? "aside-link active" : "aside-link"
          }
        >
          Home
        </NavLink>
        {userType === "UC" && (
          <>
            <NavLink
              to="/wallet"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Wallet
            </NavLink>
            <NavLink
              to="/skill-test"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Skill Test
            </NavLink>
          </>
        )}
        {userType === "UE" && (
          <>
            <NavLink
              to="/plans"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Plans
            </NavLink>
            <NavLink
              to="/badges"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Badges
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Contact
            </NavLink>
          </>
        )}
        {userType === "UA" && (
          <>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Service Request
            </NavLink>
            <NavLink
              to="/skills"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Skills
            </NavLink>
            <NavLink
              to="/plans"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Service Plans
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                isActive ? "aside-link active" : "aside-link"
              }
            >
              Analytics
            </NavLink>
          </>
        )}
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "aside-link active" : "aside-link"
          }
        >
          About
        </NavLink>
      </nav>
    </aside>
  );
};

export default Aside;
