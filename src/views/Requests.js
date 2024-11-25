import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { EyeFill } from "react-bootstrap-icons";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Requests.css";

const Requests = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBadgeId, setSearchBadgeId] = useState("");
  const [orderBy, setOrderBy] = useState("date-desc");
  
  const userType = sessionStorage.getItem("tipoUsuario");
  
  const navigate = useNavigate();

  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;
  const adminUrl = process.env.REACT_APP_API_ADMIN;

  // Mapeamento dos nomes de canais para algo mais intuitivo
  const channelMap = {
    criacao_badge: "Badge Creation",
    edicao_badge: "Badge Editing",
    suporte: "Support",
  };
  
  useEffect(() => {
    const fetchOrders = async () => {
      const token = sessionStorage.getItem("token");

      try {
        const response = await axios.post(
          `${adminUrl}/admin/requests`,
          { token },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setOrders(response.data);
          setFilteredOrders(response.data);
        } else {
          setError("Failed to load orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    const checkLogin = async () => {
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
      } 
      else if (userType === "UA") {
        let userInfoResponse = await axios.get(
          `${adminUrl}/admin/acessa-info`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      else {
        navigate("/home")
      }
    };

    checkLogin();
    fetchOrders();
  }, []);

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
    filterOrders(e.target.value, searchBadgeId);
  };

  const handleSearchBadgeIdChange = (e) => {
    setSearchBadgeId(e.target.value);
    filterOrders(searchTerm, e.target.value);
  };

  const handleOrderChange = (e) => {
    setOrderBy(e.target.value);
    setFilteredOrders(sortOrders(filteredOrders, e.target.value));
  };

  const filterOrders = (term, badgeId) => {
    let filtered = orders;

    if (term) {
      filtered = filtered.filter((order) =>
        order.cliente.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (badgeId) {
      filtered = filtered.filter((order) =>
        order.badgeId.toString().includes(badgeId)
      );
    }

    setFilteredOrders(sortOrders(filtered, orderBy));
  };

  const sortOrders = (ordersToSort, sortBy) => {
    switch (sortBy) {
      case "date-asc":
        return [...ordersToSort].sort(
          (a, b) => new Date(a.data) - new Date(b.data)
        );
      case "priority-asc":
        return [...ordersToSort].sort((a, b) =>
          a.prioridade.localeCompare(b.prioridade)
        );
      case "priority-desc":
        return [...ordersToSort].sort((a, b) =>
          b.prioridade.localeCompare(a.prioridade)
        );
      case "date-desc":
      default:
        return [...ordersToSort].sort(
          (a, b) => new Date(b.data) - new Date(a.data)
        );
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="orders-page">
      <div className="container orders-container">
      <ToastContainer />
        <div className="orders-header">
          <div className="orders-search-group">
            <input
              type="text"
              className="orders-search"
              placeholder="Search by client"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
            <input
              type="text"
              className="orders-search"
              placeholder="Search by badge ID"
              value={searchBadgeId}
              onChange={handleSearchBadgeIdChange}
            />
          </div>
          <div className="orders-order">
            <span>Order by:</span>
            <select
              className="orders-select"
              value={orderBy}
              onChange={handleOrderChange}
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="priority-asc">Priority (Lowest)</option>
              <option value="priority-desc">Priority (Highest)</option>
            </select>
          </div>
        </div>
        <div className="orders-info">
          You have {filteredOrders.length} orders
        </div>
        <div className="orders-divider"></div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Request Number</th>
              <th>Date</th>
              <th>Channel</th>
              <th>Priority</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Badge</th>
              <th style={{ textAlign: "center" }}>Options</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id_request}>
                <td>{order.id_request}</td>
                <td>{new Date(order.data).toLocaleDateString()}</td>{" "}
                <td>{channelMap[order.canal] || order.canal}</td>{" "}
                <td>{order.prioridade}</td>
                <td>{order.status}</td>
                <td style={{ textAlign: "center" }}>
                  {order.name_badge || "-"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {order.id_badge && (
                    <Link to={`/workflow/${order.id_request}`}>
                      <EyeFill className="eye-icon"/>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requests;
