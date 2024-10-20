import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
import axios from "axios";
import "../styles/Price.css";
import PlanCard from "../components/PlanCard";
import { ClipLoader } from "react-spinners";
import ConfirmationModal from "../components/ConfirmationModal"; // Usando o modal existente

const Price = () => {
  const [plans, setPlans] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Controla a exibição do modal
  const [planToDelete, setPlanToDelete] = useState(null); // Armazena o ID do plano a ser deletado

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

  // Abre o modal de confirmação e define o plano a ser deletado
  const openConfirmationModal = (planId) => {
    setPlanToDelete(planId);
    setShowModal(true);
  };

  // Fecha o modal de confirmação
  const handleCloseModal = () => {
    setShowModal(false);
    setPlanToDelete(null);
  };

  // Função para deletar o plano após a confirmação
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:9090/api/plans/${planToDelete}`);
      setPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.id !== planToDelete)
      );
      alert("Plan deleted successfully.");
    } catch (error) {
      console.error("There was an error deleting the plan!", error);
    } finally {
      handleCloseModal(); // Fecha o modal após a confirmação
    }
  };

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
                    handleDelete={openConfirmationModal} // Usa a função que abre o modal de confirmação
                  />
                ))}
              {highlightedPlan && (
                <PlanCard
                  key={highlightedPlan.id}
                  plan={highlightedPlan}
                  isAdmin={userType === "UA"}
                  handleDelete={openConfirmationModal} // Usa a função que abre o modal de confirmação
                />
              )}
              {otherPlans
                .slice(Math.floor(otherPlans.length / 2))
                .map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAdmin={userType === "UA"}
                    handleDelete={openConfirmationModal} // Usa a função que abre o modal de confirmação
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

      {/* Modal de confirmação de exclusão */}
      <ConfirmationModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Plan Deletion"
        body="Are you sure you want to delete this plan?"
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default Price;
