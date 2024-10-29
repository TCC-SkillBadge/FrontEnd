import React, { useState, useEffect } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const email = JSON.parse(sessionStorage.getItem("userInfo")).email;
        const response = await axios.get(
          `http://localhost:7001/badges/wallet?email=${email}`
        );
        setMedals(response.data);
        setFilteredMedals(response.data);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const handleOrderChange = (e) => {
    setOrderBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterMedals(term);
  };

  const filterMedals = (term) => {
    if (!term) {
      setFilteredMedals(medals);
    } else {
      const fragments = term.toLowerCase().split(" ");
      const filtered = medals.filter((medal) =>
        fragments.every((fragment) =>
          medal.name_badge.toLowerCase().includes(fragment)
        )
      );
      setFilteredMedals(filtered);
    }
  };

  const getSortedMedals = () => {
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
  };

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedals = getSortedMedals().slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredMedals.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
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
            <div className="wallet-medal-slide">
              {currentMedals.map((medal) => (
                <div key={medal.id} className="wallet-medal-card">
                  <img
                    src={medal.image_url}
                    alt={medal.name_badge}
                    className="medal-img"
                  />
                  <h3>{medal.name_badge}</h3>
                  <button>Details</button>
                </div>
              ))}
            </div>
            <div className="pagination">
              <div className="pagination-buttons">
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => handlePageChange(number + 1)}
                    className={`pagination-button ${
                      currentPage === number + 1 ? "active" : ""
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
              </div>
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
