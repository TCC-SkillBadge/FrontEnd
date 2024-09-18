import React, { useState, useEffect } from "react";
import "../../styles/Badge.css";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Carousel } from "react-responsive-carousel";
import { Link } from "react-router-dom";
import { PencilFill } from "react-bootstrap-icons";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Consult = () => {
  const [badges, setBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState("created-last");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
        const email = userInfo && userInfo.email ? userInfo.email : "teste@email.com";

        const response = await axios.get(`http://localhost:7001/badge/consultar?pesquisa=${email}`);
        setBadges(response.data);
        setFilteredBadges(response.data);
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
    filterBadges(e.target.value);
  };

  const filterBadges = (term) => {
    if (!term) {
      setFilteredBadges(badges);
    } else {
      const filtered = badges.filter((badge) =>
        badge.name_badge.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredBadges(filtered);
    }
  };

  const getSortedBadges = () => {
    switch (orderBy) {
      case "created-first":
        return [...filteredBadges].sort(
          (a, b) => new Date(a.created_date) - new Date(b.created_date)
        );
      case "name":
        return [...filteredBadges].sort((a, b) =>
          a.name_badge.localeCompare(b.name_badge)
        );
      case "created-last":
      default:
        return [...filteredBadges].sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date)
        );
    }
  };

  const renderBadgesInSlides = (badges) => {
    const slides = [];
    const itemsPerSlide = 3;
    console.log(badges);

    for (let i = 0; i < badges.length; i += itemsPerSlide) {
      slides.push(
        <div className="badge-slide" key={`slide-${i}`}>
          {badges.slice(i, i + itemsPerSlide).map((badge) => (
            <div key={badge.id_badge} className="badge-card">
              <Link to={`/badge/edit/${badge.id_badge}`} className="edit-icon">
                <PencilFill />
              </Link>
              <img
                src={badge.image_url}
                alt={badge.name_badge}
                className="badge-img"
              />
              <h3>{badge.name_badge}</h3>
              <button>Details</button>
            </div>
          ))}
        </div>
      );
    }

    return slides;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="badge-page-consult">
      <Navbar />
      <div className="badge-container-consult">
        <div className="badge-header">
          <div className="badge-search-group">
            <input
              type="text"
              className="badge-search"
              placeholder="Search by name"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="badge-order">
            <span>Order by:</span>
            <select
              className="badge-select"
              value={orderBy}
              onChange={handleOrderChange}
            >
              <option value="created-last">created last</option>
              <option value="created-first">created first</option>
              <option value="name">name</option>
            </select>
          </div>
        </div>
        <div className="badge-info">
          You have {filteredBadges.length} badges
        </div>
        <div className="badge-divider"></div>
        <div className="badges">
          <Carousel
            showArrows={true}
            infiniteLoop={true}
            showThumbs={false}
            showStatus={false}
            emulateTouch={true}
            className="badge-carousel"
          >
            {renderBadgesInSlides(getSortedBadges())}
          </Carousel>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Consult;