import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "react-bootstrap-icons"; // Importando o ícone de "+" do react-bootstrap-icons
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/Price.css";
import PlanCard from "../components/PlanCard";
import { ClipLoader } from "react-spinners"; // Importando o ClipLoader do react-spinners

const Price = () => {
  const [plans, setPlans] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/plans");
        setPlans(response.data);
        setLoading(false);
      } catch (error) {
        console.error("There was an error fetching the plans!", error);
        setLoading(false);
      }
    };

    fetchPlans();

    const storedUserType = sessionStorage.getItem("tipoUsuario");
    setUserType(storedUserType);
  }, []);

  // Reorganize os planos para garantir que o plano com prioridade fique no meio
  const highlightedPlan = plans.find((plan) => plan.prioridade);
  const otherPlans = plans.filter((plan) => !plan.prioridade);

  return (
    <div>
      <Navbar />
      <div className="price-page">
        <h1 className="title">
          The <span className="highlight">BEST</span> plans
        </h1>
        <h2 className="subtitle">How often do you want to pay?</h2>
        <div className="plans-container">
          {loading ? (
            <div className="loading-spinner">
              <ClipLoader size={150} color={"#123abc"} loading={loading} />
            </div>
          ) : (
            <>
              {otherPlans
                .slice(0, Math.floor(otherPlans.length / 2))
                .map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAdmin={userType === "UA"}
                  />
                ))}
              {highlightedPlan && (
                <PlanCard
                  key={highlightedPlan.id}
                  plan={highlightedPlan}
                  isAdmin={userType === "UA"}
                />
              )}
              {otherPlans
                .slice(Math.floor(otherPlans.length / 2))
                .map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAdmin={userType === "UA"}
                  />
                ))}
            </>
          )}
        </div>
        {userType === "UA" && (
          <Link to="/createServicePlan" className="add-plan-button">
            <PlusCircle className="icon" />
            Add Service Plan
          </Link>
        )}
      </div>
    </div>
  );
};

export default Price;
