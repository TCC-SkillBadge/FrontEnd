import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = sessionStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:7004/admin/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setOrders(response.data);
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

    fetchOrders();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <Navbar />
      <div className="container orders-container">
        <h1 className="orders-title">Minhas Ordens</h1>
        <table className="orders-table">
          <thead>
            <tr>
              <th>Número do Pedido</th>
              <th>Data</th>
              <th>Canal</th>
              <th>Prioridade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.numero_pedido}>
                <td>{order.numero_pedido}</td>
                <td>{order.data}</td>
                <td>{order.canal}</td>
                <td>{order.prioridade}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
