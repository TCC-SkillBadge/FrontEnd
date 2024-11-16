import React, { useState, useEffect } from "react";
import { PlusCircle } from "react-bootstrap-icons";
import axios from "axios";
import "../styles/Price.css";
import PlanCard from "../components/PlanCard";
import { ClipLoader } from "react-spinners";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationModal from "../components/ConfirmationModal";

const Price = () => {
  const [plans, setPlans] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

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
      // Mostra o Toastify ao deletar com sucesso
      toast.success("Plan deleted successfully!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error) {
      console.error("There was an error deleting the plan!", error);
    } finally {
      handleCloseModal();
    }
  };

  const highlightedPlan = plans.find((plan) => plan.prioridade);
  const otherPlans = plans.filter((plan) => !plan.prioridade);

  // Tooltip para o botão de adicionar plano
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      You cannot have more than 4 plans.
    </Tooltip>
  );

  return (
    <div>
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
                    handleDelete={openConfirmationModal}
                  />
                ))}
              {highlightedPlan && (
                <PlanCard
                  key={highlightedPlan.id}
                  plan={highlightedPlan}
                  isAdmin={userType === "UA"}
                  handleDelete={openConfirmationModal}
                />
              )}
              {otherPlans
                .slice(Math.floor(otherPlans.length / 2))
                .map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAdmin={userType === "UA"}
                    handleDelete={openConfirmationModal}
                  />
                ))}
            </>
          )}
        </div>

        {/* Adicionar Tooltip e desabilitar o botão se houver quatro ou mais planos */}
        {userType === "UA" && (
          <OverlayTrigger
            placement="top"
            overlay={plans.length >= 4 ? renderTooltip : <></>}
          >
            <button
              className={`add-plan-button ${
                plans.length >= 4 ? "disabled" : ""
              }`}
              onClick={(e) => {
                if (plans.length >= 4) {
                  e.preventDefault();
                } else {
                  window.location.href = "/createServicePlan";
                }
              }}
            >
              <PlusCircle className="icon" />
              Add Service Plan
            </button>
          </OverlayTrigger>
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

      {/* Container do ReactToastify */}
      <ToastContainer />
    </div>
  );
};

export default Price;
