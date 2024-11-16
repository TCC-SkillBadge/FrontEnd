import React from "react";
import "../styles/About.css";

const About = () => {
  return (
    <div>
      <div className="about-background">
        <h1 className="about-title">About Us</h1>
        
          <div className="about-description-container">
            <p className="about-description">
              Our project was born from a college thesis (TCC), developed by a
              team of five young enthusiasts passionate about technology and
              education. Motivated by lectures and events, we envisioned a
              platform that encourages continuous learning and offers
              outstanding cost-benefit for businesses. Our platform’s clean,
              intuitive design ensures an accessible and effective experience,
              making knowledge pursuit enjoyable and beneficial for everyone.
            </p>
          </div>
        
        <section className="team-section">
          <h2 className="team-title">Meet Our Team</h2>
          <p className="team-description">
            A dedicated group with diverse backgrounds, united by a shared goal
            of making a positive impact in education.
          </p>
          <img
            src="path/to/team-image.jpg" // Substitua com o caminho da imagem da equipe
            alt="Team"
            className="team-image"
          />
        </section>
      </div>
    </div>
  );
};

export default About;
