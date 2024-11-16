import React, { useState } from "react";
import "../styles/Footer.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router-dom";


const Footer = ({ userType, user }) => {
  const [showMenu, setShowMenu] = useState(false);

  const renderFooterItems = () => {
    return (
      <>
        <div className="footer-item">
          © 2024, Next Badge. All rights reserved.
        </div>
        <NavLink to="/home" className="footer-item">
          Home
        </NavLink>
        <NavLink to="/pricing" className="footer-item">
          Pricing
        </NavLink>
        <NavLink to="/about" className="footer-item">
          About
        </NavLink>
        <NavLink to="/contact" className="footer-item">
          Contact
        </NavLink>
      </>
    );
  };

  const renderFooterRedes = () => {
    return (
      <>
        <NavLink to="https://br.linkedin.com/in/rodrigobossini" className="footer-rede">
          <i className="bi bi-linkedin"></i>
        </NavLink>
        <NavLink to="https://fatecipiranga.cps.sp.gov.br" className="footer-rede">
          <i className="bi bi-google" href="https://fatecipiranga.cps.sp.gov.br"></i>
        </NavLink>
        <NavLink to="https://github.com/professorbossini" className="footer-rede">
          <i className="bi bi-github" href="https://github.com/professorbossini"></i>
        </NavLink>
      </>
    );
  };

  return (
    <footer className="footer">
      <div className="footer-components-display">{renderFooterItems()}</div>
      <div className="footer-components-display">{renderFooterRedes()}</div>
    </footer>
  );
};

export default Footer;
