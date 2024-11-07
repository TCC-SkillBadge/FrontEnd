// src/pages/About.js
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/About.css"; // Import the specific stylesheet for About page

const About = () => {
  return (
    <div>
      
      <div className="about-background">
        <h1 className="about-title">About Us</h1>
        <p className="about-description">
          This project originated from the concept of a college thesis (TCC). We
          are five young enthusiasts who have always relished tackling
          challenges and addressing diverse needs with our foundational
          knowledge of technology. Regularly attending lectures and events
          focused on education inspired us to create something impactful in the
          educational sector. Our goal was to develop a platform that not only
          encourages the pursuit of knowledge but also offers the best
          cost-benefit ratio for business users. We prioritized a clean and
          intuitive interface to ensure that our objectives are clearly
          understood and easily accessible. With this project, we aspire to
          elevate educational engagement to new heights, making learning more
          accessible and efficient for everyone involved.
        </p>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default About;
