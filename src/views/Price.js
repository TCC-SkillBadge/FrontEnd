import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/Price.css";
import PlanCard from "../components/PlanCard";

const Price = () => {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/plans");
        setPlans(response.data);
      } catch (error) {
        console.error("There was an error fetching the plans!", error);
      }
    };

    fetchPlans();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="price-page">
        <h1 className="title">
          The <span className="highlight">BEST</span> plans
        </h1>
        <h2 className="subtitle">How often do you want to pay?</h2>
        <div className="plans-container">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Price;
