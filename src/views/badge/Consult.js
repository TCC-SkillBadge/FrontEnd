import React, { useState, useEffect, useMemo } from "react";
import "../../styles/Badge.css";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import { Link, useNavigate } from "react-router-dom";
import { PencilFill, TrashFill } from "react-bootstrap-icons";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ToastContainer, toast } from "react-toastify";
import debounce from "lodash.debounce";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../../components/ConfirmationModal";
import "../../styles/GlobalStylings.css";

const Consult = () => {
  const [badges, setBadges] = useState([]);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState("created-last");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [badgeToInactivate, setBadgeToInactivate] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const badgeUrl = process.env.REACT_APP_API_BADGE;
  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;

  const navigate = useNavigate();

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de debounce

    handler();

    return () => {
      handler.cancel();
    };
  }, [searchTerm]);

  const fetchBadges = async () => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      const email =
        userInfo &&
        (userInfo.email || userInfo.email_admin || userInfo.email_comercial)
          ? userInfo.email || userInfo.email_admin || userInfo.email_comercial
          : "teste@email.com";
      const response = await axios.get(
        `${badgeUrl}/badges/consult?search=${email}`
      );
      setBadges(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching badges:", error);
      setBadges([]);
      setLoading(false);
    }
  };

  const verificaLogin = async () => {
    const token = sessionStorage.getItem("token");
    const userType = sessionStorage.getItem("tipoUsuario");

    if (userType === "UE") {
      let userInfoResponse = await axios.get(
        `${enterpriseUrl}/api/acessar-info-usuario-jwt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserType("business");
      setUser(userInfoResponse.data);
    } else {
      navigate("/home");
    }
  };

  useEffect(() => {
    fetchBadges();
    verificaLogin();
  }, []);

  const handleOrderChange = (e) => {
    setOrderBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const filteredBadges = useMemo(() => {
    if (!debouncedSearchTerm) {
      return badges;
    }
    const fragments = debouncedSearchTerm.toLowerCase().split(" ");
    return badges.filter((badge) =>
      fragments.every((fragment) =>
        badge.name_badge.toLowerCase().includes(fragment)
      )
    );
  }, [badges, debouncedSearchTerm]);

  const sortedBadges = useMemo(() => {
    return [...filteredBadges].sort((a, b) => {
      switch (orderBy) {
        case "assigned-first":
          return new Date(a.dt_emission) - new Date(b.dt_emission);
        case "name":
          return a.name_badge.localeCompare(b.name_badge);
        case "assigned-last":
        default:
          return new Date(b.dt_emission) - new Date(a.dt_emission);
      }
    });
  }, [filteredBadges, orderBy]);

  const currentBadges = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedBadges.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedBadges, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredBadges.length / itemsPerPage);

  const openConfirmationModal = (e) => {
    setBadgeToInactivate(e.currentTarget.getAttribute("data-id_badge"));
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
      formDataToSend.append("id_badge", `${id_badge}`);
      formDataToSend.append("inactivated_user", `${user.email_comercial}`);

      let response = await axios.put(
        `${badgeUrl}/badges/inactivate`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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
        badges.slice(i, i + itemsPerSlide).map((badge) => (
          <div key={badge.id_badge} className="badge-card default-border-image">
            <Link
              onClick={openConfirmationModal}
              data-id_badge={badge.id_badge}
              className="delete-icon"
            >
              <TrashFill />
            </Link>
            <Link to={`/badges/edit/${badge.id_badge}`} className="edit-icon">
              <PencilFill />
            </Link>
            <img src={badge.image_url} className="badge-preview" />
            <h3>{badge.name_badge}</h3>
            <Link to={`/badges/details/${badge.id_badge}`}>
              <button>Details</button>
            </Link>
          </div>
        ))
      );
    }

    return slides;
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }
      if (currentPage - delta > 2) {
        range.unshift("...");
      }
      if (currentPage + delta < totalPages - 1) {
        range.push("...");
      }
      range.unshift(1);
      if (totalPages > 1) range.push(totalPages);
      return range;
    };
    return (
      <div className="pagination-buttons">
        {getPageNumbers().map((number, index) =>
          number === "..." ? (
            <span key={index} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`pagination-button ${
                currentPage === number ? "active" : ""
              }`}
            >
              {number}
            </button>
          )
        )}
      </div>
    );
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
          <div className="badge-slide">
            {renderBadgesInSlides(currentBadges)}
          </div>
          <div className="pagination">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            <select
              className="items-per-page-select"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={6}>6 per page</option>
              <option value={9}>9 per page</option>
              <option value={12}>12 per page</option>
            </select>
          </div>
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
    </div>
  );
};

export default Consult;
