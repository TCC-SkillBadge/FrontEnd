import React, { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/Wallet.css";

const Wallet = () => {
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState("assigned-last");

  useEffect(() => {
    const fetchBadges = async () => {
      const email = JSON.parse(sessionStorage.getItem("userInfo")).email;
      try {
        const response = await axios.get(
          `http://localhost:7000/api/badges?email=${email}`
        );
        setMedals(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching badges:", error);
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const handleOrderChange = (e) => {
    setOrderBy(e.target.value);
  };

  const getSortedMedals = () => {
    switch (orderBy) {
      case "assigned-first":
        return [...medals].sort(
          (a, b) => new Date(a.dt_emissao) - new Date(b.dt_emissao)
        );
      case "name":
        return [...medals].sort((a, b) =>
          a.descricao.localeCompare(b.descricao)
        );
      case "assigned-last":
      default:
        return [...medals].sort(
          (a, b) => new Date(b.dt_emissao) - new Date(a.dt_emissao)
        );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wallet-page">
      <Navbar />
      <div className="wallet-container">
        <div className="wallet-header">
          <div className="wallet-search-group">
            <input
              type="text"
              className="wallet-search"
              placeholder="Search by name"
            />
            <input
              type="text"
              className="wallet-search"
              placeholder="Search by code"
            />
          </div>
          <div className="wallet-order">
            <span>Order by:</span>
            <select
              className="wallet-select"
              value={orderBy}
              onChange={handleOrderChange}
            >
              <option value="assigned-last">assigned last</option>
              <option value="assigned-first">assigned first</option>
              <option value="name">name</option>
            </select>
          </div>
        </div>
        <div className="wallet-info">You have {medals.length} medals</div>
        <div className="wallet-divider"></div>
        <div className="wallet-medals">
          <Carousel
            showArrows={true}
            infiniteLoop={true}
            showThumbs={false}
            showStatus={false}
            centerMode={true}
            centerSlidePercentage={33.33} // 3 cards por seção
            emulateTouch={true}
          >
            {getSortedMedals().map((medal) => (
              <div key={medal.id} className="wallet-medal-card">
                <img
                  src={medal.imagem_b}
                  alt={medal.descricao}
                  className="medal-img"
                />
                <h3>{medal.descricao}</h3>
                <button>Details</button>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
