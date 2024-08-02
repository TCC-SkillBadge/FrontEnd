import React, { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Navbar from "../components/Navbar";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import "../styles/Wallet.css";

const Wallet = () => {
  const [medals, setMedals] = useState([]);
  const [filteredMedals, setFilteredMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState("assigned-last");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBadges = async () => {
      const email = JSON.parse(sessionStorage.getItem("userInfo")).email;
      try {
        const response = await axios.get(
          `http://localhost:7000/api/badges?email=${email}`
        );
        setMedals(response.data);
        setFilteredMedals(response.data);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterMedals(e.target.value);
  };

  const filterMedals = (term) => {
    if (!term) {
      setFilteredMedals(medals);
    } else {
      const filtered = medals.filter((medal) =>
        medal.descricao.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredMedals(filtered);
    }
  };

  const getSortedMedals = () => {
    switch (orderBy) {
      case "assigned-first":
        return [...filteredMedals].sort(
          (a, b) => new Date(a.dt_emissao) - new Date(b.dt_emissao)
        );
      case "name":
        return [...filteredMedals].sort((a, b) =>
          a.descricao.localeCompare(b.descricao)
        );
      case "assigned-last":
      default:
        return [...filteredMedals].sort(
          (a, b) => new Date(b.dt_emissao) - new Date(a.dt_emissao)
        );
    }
  };

  const renderMedalsInSlides = (medals) => {
    const slides = [];
    const itemsPerSlide = 3;

    for (let i = 0; i < medals.length; i += itemsPerSlide) {
      slides.push(
        <div className="wallet-medal-slide" key={`slide-${i}`}>
          {medals.slice(i, i + itemsPerSlide).map((medal) => (
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
        </div>
      );
    }

    return slides;
  };

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
              value={searchTerm}
              onChange={handleSearchChange}
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
        <div className="wallet-info">
          You have {filteredMedals.length} medals
        </div>
        <div className="wallet-divider"></div>
        {loading ? (
          <div className="loading-spinner">
            <ClipLoader size={150} color={"#123abc"} loading={loading} />
          </div>
        ) : (
          <div className="wallet-medals">
            <Carousel
              showArrows={true}
              infiniteLoop={true}
              showThumbs={false}
              showStatus={false}
              emulateTouch={true}
              className="wallet-carousel"
            >
              {renderMedalsInSlides(getSortedMedals())}
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
