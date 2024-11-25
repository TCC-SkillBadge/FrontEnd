// src/views/Wallet.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import debounce from "lodash.debounce";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Wallet.css";
import "../styles/GlobalStylings.css";

const MedalCard = React.memo(({ medal }) => {
  return (
    <div
      key={medal.id}
      className="wallet-medal-card default-border-image"
      style={{ border: "1px" }}
    >
      <img
        src={medal.image_url}
        alt={medal.name_badge}
        className="medal-img"
        loading="lazy"
      />
      <h3>{medal.name_badge}</h3>
      <Link to={`/details/common/${medal.id_badge}`}>
        <button className="details-button">Details</button>
      </Link>
    </div>
  );
});

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
            className={`pagination-button ${currentPage === number ? "active" : ""
              }`}
          >
            {number}
          </button>
        )
      )}
    </div>
  );
};

const Wallet = () => {
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState("assigned-last");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const navigate = useNavigate();

  const badgeUrl = process.env.REACT_APP_API_BADGE;

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userInfo = sessionStorage.getItem("userInfo");
        if (!userInfo) throw new Error("User not logged in");
        const email = JSON.parse(userInfo).email;
        const response = await axios.get(
          `${badgeUrl}/badges/wallet?email=${email}`
        );
        setMedals(response.data);
      } catch (error) {
        console.error("Error fetching badges:", error);
        navigate("/login"); // Redireciona para a página de login se o usuário não estiver logado
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [navigate]);

  // Debounce para a busca
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de debounce

    handler();

    return () => {
      handler.cancel();
    };
  }, [searchTerm]);

  const filteredMedals = useMemo(() => {
    if (!debouncedSearchTerm) {
      return medals;
    }
    const fragments = debouncedSearchTerm.toLowerCase().split(" ");
    return medals.filter((medal) =>
      fragments.every((fragment) =>
        medal.name_badge.toLowerCase().includes(fragment)
      )
    );
  }, [medals, debouncedSearchTerm]);

  const sortedMedals = useMemo(() => {
    return [...filteredMedals].sort((a, b) => {
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
  }, [filteredMedals, orderBy]);

  const currentMedals = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedMedals.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedMedals, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMedals.length / itemsPerPage);

  const handleOrderChange = (e) => {
    setOrderBy(e.target.value);
    setCurrentPage(1); // Resetar para a primeira página ao mudar a ordem
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetar para a primeira página ao buscar
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="wallet-page">
      <div className="coinBackgroundWallet"></div>
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
          </div>
          <div className="wallet-order">
            <span>Order by:</span>
            <select
              className="wallet-select"
              value={orderBy}
              onChange={handleOrderChange}
            >
              <option value="assigned-last">Assigned Last</option>
              <option value="assigned-first">Assigned First</option>
              <option value="name">Name</option>
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
            <div className="wallet-medal-slide">
              {currentMedals.map((medal) => (
                <MedalCard key={medal.id} medal={medal} />
              ))}
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
        )}
      </div>
    </div>
  );
};

export default Wallet;
