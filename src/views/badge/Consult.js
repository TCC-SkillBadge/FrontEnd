import React, { useState, useEffect } from "react";
import "../../styles/Badge.css";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Carousel } from "react-responsive-carousel";
import { Link, useNavigate } from "react-router-dom";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Consult = () => {
  const [badges, setBadges] = useState([]);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState("created-last");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const fetchBadges = async () => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      const email = userInfo && (userInfo.email || userInfo.email_admin || userInfo.email_comercial) ? userInfo.email || userInfo.email_admin || userInfo.email_comercial : "teste@email.com";
      const response = await axios.get(`http://localhost:7001/badge/consultar?pesquisa=${email}`);
      setBadges(response.data);
      setFilteredBadges(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching badges:", error);
      setBadges([]);
      setFilteredBadges([]);
      setLoading(false);
    }
  };

  const verificaLogin = async () => {
    const token = sessionStorage.getItem("token");
    const userType = sessionStorage.getItem("tipoUsuario");

    if (userType === "UE") {
      let userInfoResponse = await axios.get(
        `http://localhost:7003/api/acessar-info-usuario-jwt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserType("business");
      setUser(userInfoResponse.data);
    } else if (userType === "UA") {
      let userInfoResponse = await axios.get(
        `http://localhost:7004/admin/acessa-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserType("admin");
      setUser(userInfoResponse.data);
    }
    else {
      navigate("/home")
    }
  };

  useEffect(() => {
    fetchBadges();
    verificaLogin();
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

  const handleDelete = async (e) => {
    try {
      e.preventDefault();
      const id_badge = e.currentTarget.getAttribute('data-id_badge');

      const formDataToSend = new FormData();
      formDataToSend.append('id_badge', `${id_badge}`);
      formDataToSend.append('inactivated_user', `${user.email_comercial}`);

      let response = await axios.post("http://localhost:7001/badge/excluir", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        alert("Badge inactivated successfully");
        fetchBadges();
      }
    } catch (error) {
      console.error("Error inactivated badge:", error);
      alert("Error inactivated badge");
    }
  };


  const renderBadgesInSlides = (badges) => {
    const slides = [];
    const itemsPerSlide = 3;

    for (let i = 0; i < badges.length; i += itemsPerSlide) {
      slides.push(
        <div className="badge-slide" key={`slide-${i}`}>
          {badges.slice(i, i + itemsPerSlide).map((badge) => (
            <div key={badge.id_badge} className="badge-card">
              <Link onClick={handleDelete} data-id_badge={badge.id_badge} className="delete-icon">
                <TrashFill />
              </Link>
              <Link to={`/badge/edit/${badge.id_badge}`} className="edit-icon">
                <PencilFill />
              </Link>
              <img
                src={badge.image_url}
                alt={badge.name_badge}
                className="badge-img"
              />
              <h3>{badge.name_badge}</h3>
              <Link to={`/badge/details/${badge.id_badge}`}>
                <button>Details</button>
              </Link>
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
        <div className="badges">
          <Link to={"/badge/create"} className="badge-button">
            Create
          </Link>
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