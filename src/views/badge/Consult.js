import React, { useState, useEffect } from "react";
import "../../styles/Badge.css";
import axios from "axios";
import Footer from "../../components/Footer";
import { Carousel } from "react-responsive-carousel";
import { Link, useNavigate } from "react-router-dom";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../../components/ConfirmationModal";

const Consult = () => {
  const [badges, setBadges] = useState([]);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState("created-last");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [badgeToInactivate, setBadgeToInactivate] = useState(null);

  const navigate = useNavigate();

  const fetchBadges = async () => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      const email = userInfo && (userInfo.email || userInfo.email_admin || userInfo.email_comercial) ? userInfo.email || userInfo.email_admin || userInfo.email_comercial : "teste@email.com";
      const response = await axios.get(`http://localhost:7001/badges/consult?search=${email}`);
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

  const openConfirmationModal = (e) => {
    setBadgeToInactivate(e.currentTarget.getAttribute('data-id_badge'));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setBadgeToInactivate(null);
  };

  const handleConfirmInactivate = async () => {
    const loadingToastId = toast.loading("Loading...");
    try {
      const id_badge = badgeToInactivate;

      const formDataToSend = new FormData();
      formDataToSend.append('id_badge', `${id_badge}`);
      formDataToSend.append('inactivated_user', `${user.email_comercial}`);

      let response = await axios.put("http://localhost:7001/badges/inactivate", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.dismiss(loadingToastId);

      if (response.status === 200) {
        toast.success("Badge inactivated successfully");
        setTimeout(() => {
          fetchBadges();
        }, 2000);       
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Error inactivated badge:", error);
      toast.error("Error inactivated badge");
    } finally {
      handleCloseModal();
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
              <Link onClick={openConfirmationModal} data-id_badge={badge.id_badge} className="delete-icon">
                <TrashFill />
              </Link>
              <Link to={`/badges/edit/${badge.id_badge}`} className="edit-icon">
                <PencilFill />
              </Link>
              <img
                src={badge.image_url}
                className="badge-preview"
              />
              <h3>{badge.name_badge}</h3>
              <Link to={`/badges/details/${badge.id_badge}`}>
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
          <Link to={"/badges/create"} className="badge-button">
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
      <ConfirmationModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleConfirmInactivate}
        title="Confirm Badge Inactivate"
        body="Are you sure you want to delete this badge?"
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Footer />
    </div>
  );
};

export default Consult;