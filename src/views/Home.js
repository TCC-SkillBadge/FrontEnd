import React, { useState, useEffect } from "react";
import FeatureCard from "../components/FeatureCard"; // Importe o novo componente
import "../styles/Home.css"; // Certifique-se de criar este arquivo de estilo
import "../styles/GlobalStylings.css"

const Home = () => {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  const verificaLogin = () => {
    const tipoUsuario = sessionStorage.getItem("tipoUsuario");
    const userInfo = sessionStorage.getItem("userInfo");

    if (tipoUsuario) {
      setUserType(tipoUsuario);
    }

    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  };

  useEffect(() => {
    verificaLogin();
    window.addEventListener("storage", verificaLogin);
    return () => {
      window.removeEventListener("storage", verificaLogin);
    };
  }, []);

  return (
    <div>
      <div className="coinBackgroundHome">
      </div>
      <div className="container-fluid home-content">
        <div className="text-container">
          <h1 className="home-title">
            All your achievements in one secure place.
          </h1>
          <p className="home-subtitle">
            <span className="emitir">Earn</span>,{" "}
            <span className="conquistar">store</span>{" "}and{" "}
            <span className="armazenar">showcase</span> your badges with ease and confidence.
          </p>
        </div>
      </div>
      <div className="divisoria1">
        <img
          className="iconShieldSmall"
          alt="Shield Icon 1"
          src="/icons/home/icon-shield-fill.svg"
        />
        <img
          className="iconShieldLarge"
          alt="Shield Icon 2"
          src="/icons/home/icon-shield-fill1.svg"
        />
        <img
          className="iconShieldSmall"
          alt="Shield Icon 3"
          src="/icons/home/icon-shield-fill2.svg"
        />
      </div>
      <div className="container">
        <div className="why-digital-medals default-border-image">
          <h2>Sharing</h2>
          <p>
            Share your achievements with a wider audience. By displaying
            badges on social media, resumes, or portfolios, your
            accomplishments are communicated in a visual and impactful way,
            inspiring and opening opportunities in the educational and
            professional world.
          </p>
          <br />

          <h2>Modern Resume and Portfolio</h2>
          <p>
            Badges are becoming a modern part of resumes and
            portfolios. They add a dynamic visual element, making your
            history more engaging and informative. This catches the attention
            of employers and educational institutions and serves as a
            highlight in a competitive market.
          </p>
          <br />

          <h2>Demonstration of Skills and Competencies</h2>
          <p>
            Badges are a solid way to demonstrate your skills and
            competencies. They not only tell a story but also validate your
            competencies in an objective manner.
          </p>
          <br />

          <h2>Stand Out</h2>
          <p>
            In an increasingly competitive world, badges help you
            stand out. Besides being symbols of achievement, they are also
            indicators of a dedicated and success-oriented professional or
            individual.
          </p>
        </div>
      </div>
      <div className="divisoria2">
        <img
          className="iconSmall"
          alt="New Icon 1"
          src="/icons/home/slhield1.svg"
        />
        <img
          className="iconLarge"
          alt="New Icon 2"
          src="/icons/home/slhield1.svg"
        />
        <img
          className="iconSmall"
          alt="New Icon 3"
          src="/icons/home/slhield1.svg"
        />
      </div>
      <div className="container">
        <div className="credibilidade-seguranca default-border-image">
          <h2>Credibility and Security</h2>
          <p>
            Our badges are designed with a set of robust security
            measures, ensuring the integrity and authenticity of each medal.
            This means that when someone receives a digital medal, it is more
            than just a beautiful symbol of achievement - it is a solid
            testament to their skills and accomplishments.
          </p>
        </div>
      </div>
      <div className="divisoria3">
        <img
          className="iconSmall"
          alt="New Icon 1"
          src="/icons/home/new-icon2.svg"
        />
        <img
          className="iconLarge"
          alt="New Icon 2"
          src="/icons/home/new-icon2.svg"
        />
        <img
          className="iconSmall"
          alt="New Icon 2"
          src="/icons/home/new-icon2.svg"
        />
      </div>
      <div className="container">
        <div className="features-section">
          <FeatureCard icon="Mission" title="Mission">
            Facilitate the recognition of achievements and skills through an
            innovative system of badges and soft skills, promoting engagement
            and motivation in educational, professional, and social environments.
          </FeatureCard>
          <FeatureCard icon="Vision" title="Vision">
            To be a renowned platform in the digital recognition of skills and
            achievements, transforming the way individuals and organizations
            share their accomplishments.
          </FeatureCard>
          <FeatureCard icon="Values" title="Values">
            <ul className="values-list">
              <li>Innovation</li>
              <li>Transparency</li>
              <li>Security</li>
              <li>Excellence</li>
            </ul>
          </FeatureCard>
        </div>
      </div>
      <div className="divisoria4">
        <img
          className="iconSmall"
          alt="Divisoria Icon 1"
          src="/icons/home/shield4.svg"
        />
        <img
          className="iconLarge"
          alt="Divisoria Icon 2"
          src="/icons/home/shield4.svg"
        />
        <img
          className="iconSmall"
          alt="Divisoria Icon 3"
          src="/icons/home/shield4.svg"
        />

      </div>
    </div>
  );
};

export default Home;
