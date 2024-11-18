// src/components/AboutContent.js

import React from "react";
import "../styles/ApiReference.css"; // Usando os estilos de API Reference

const AboutContent = () => {
  return (
    <div className="api-reference-container">
      <h1 className="api-title">About Us</h1>
      <div className="api-section">
        <p className="api-description">
          Our project was born from a college thesis (TCC), developed by a team
          of five young enthusiasts passionate about technology and education.
          Motivated by lectures and events, we envisioned a platform that
          encourages continuous learning and offers outstanding cost-benefit for
          businesses. Our platform’s clean, intuitive design ensures an
          accessible and effective experience, making knowledge pursuit
          enjoyable and beneficial for everyone.
        </p>
      </div>
    </div>
  );
};

export default AboutContent;
