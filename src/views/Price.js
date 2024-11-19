// src/pages/Price.js

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
import PaymentConfirmationModal from "../components/PaymentConfirmationModal";
import CancellationConfirmationModal from "../components/CancellationConfirmationModal";
import usePlans from "../hooks/usePlans";

const Price = () => {
  const {
    plans,
    setPlans,
    currentPlan,
    setCurrentPlan,
    loading,
    cancelCurrentPlan,
  } = usePlans();
  const [userType, setUserType] = useState(null);
  const [emailComercial, setEmailComercial] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failure', 'processing'
  const [showModal, setShowModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [planToPurchase, setPlanToPurchase] = useState(null);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationStatus, setCancellationStatus] = useState(null); // 'success', 'failure', 'processing'

  const [sticks, setSticks] = useState(false);

  //Este useEffect é responsável por verificar se o botão de adicionar plano deve ficar fixo no rodapé da página
  //Sua implementação foi necessária para que o botão de adicionar plano não ficasse em cima do footer
  //Modificações foram feitas também no arquivo Price.css
  useEffect(() => {
    const handleScroll = () => {
      const addButton = document.querySelector("#add-plan-button");
      const footer = document.querySelector("#footer");

      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const buttonHeight = addButton ? addButton.offsetHeight : 0;
        const windowHeight = window.innerHeight;
        
        if (footerTop <= windowHeight + buttonHeight) {
          setSticks(true);
        } else {
          setSticks(false);
        }
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    // Fetch user information
    const storedUserType = sessionStorage.getItem("tipoUsuario");
    const storedUserInfo = sessionStorage.getItem("userInfo");
    let storedEmail = null;

    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        storedEmail = userInfo.email_comercial || null;
      } catch (e) {
        console.error("Error parsing userInfo from sessionStorage:", e);
      }
    }

    setUserType(storedUserType);
    setEmailComercial(storedEmail);

    console.log("Stored User Type:", storedUserType);
    console.log("Stored Email:", storedEmail);
  }, []);

  const openConfirmationModal = (planId) => {
    setPlanToDelete(planId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPlanToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:9090/api/plans/${planToDelete}`);
      setPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.id !== planToDelete)
      );
      toast.success("Plan successfully deleted!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    } catch (error) {
      console.error("Error deleting plan!", error);
      toast.error("Failed to delete plan.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    } finally {
      handleCloseModal();
    }
  };

  const handlePayment = (planId) => {
    const selectedPlan = plans.find((plan) => plan.id === planId);
    openPaymentModal(selectedPlan);
  };

  const openPaymentModal = (plan) => {
    setPlanToPurchase(plan);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPlanToPurchase(null);
    setPaymentStatus(null);
  };

  const handleConfirmPayment = async () => {
    console.log("Plan to Purchase:", planToPurchase);
    console.log("Commercial Email:", emailComercial);

    if (!emailComercial) {
      toast.error("User not authenticated. Please log in again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
      handleClosePaymentModal();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailComercial)) {
      toast.error("Invalid commercial email.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
      handleClosePaymentModal();
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus("processing");

    try {
      const response = await axios.post(
        "http://localhost:7003/api/usuarios/associar-plano",
        {
          planId: planToPurchase.id,
          userEmail: emailComercial,
        }
      );
      toast.success(
        response.data.message || "Payment processed successfully!",
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: "dark",
        }
      );
      setCurrentPlan(response.data.plan);
      setPaymentStatus("success");
    } catch (error) {
      console.error("Error processing payment:", error);
      let errorMessage = "Failed to process payment.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server. Please try again later.";
      } else {
        errorMessage = error.message;
      }
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
      setPaymentStatus("failure");
    } finally {
      setIsProcessingPayment(false);
      handleClosePaymentModal();
    }
  };

  const openCancellationModal = () => {
    setShowCancellationModal(true);
  };

  const handleCloseCancellationModal = () => {
    setShowCancellationModal(false);
    setCancellationStatus(null);
  };

  const handleConfirmCancellation = async () => {
    setCancellationStatus("processing");
    try {
      await cancelCurrentPlan();
      setCancellationStatus("success");
    } catch (error) {
      setCancellationStatus("failure");
    } finally {
      handleCloseCancellationModal();
    }
  };

  const highlightedPlan = plans.find((plan) => plan.prioridade);
  const otherPlans = plans.filter((plan) => !plan.prioridade);

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      You cannot have more than 4 plans.
    </Tooltip>
  );

  const isAdmin = userType === "UA";
  const isEnterpriseUser = userType === "UE";

  return (
    <div>
      <div className="coinBackgroundPrice"></div>
      <div className="price-page">
        <h1 className="title">
          The <span className="highlight">BEST</span> Plans
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
                    isAdmin={isAdmin}
                    isEnterpriseUser={isEnterpriseUser}
                    handleDelete={openConfirmationModal}
                    handlePayment={handlePayment}
                    handleCancel={openCancellationModal}
                    isCurrent={currentPlan && currentPlan.id === plan.id}
                    isDisabled={!!currentPlan && currentPlan.id !== plan.id} // Desabilita se houver um plano ativo
                    isProcessingPayment={isProcessingPayment}
                  />
                ))}
              {highlightedPlan && (
                <PlanCard
                  key={highlightedPlan.id}
                  plan={highlightedPlan}
                  isAdmin={isAdmin}
                  isEnterpriseUser={isEnterpriseUser}
                  handleDelete={openConfirmationModal}
                  handlePayment={handlePayment}
                  handleCancel={openCancellationModal}
                  isCurrent={
                    currentPlan && currentPlan.id === highlightedPlan.id
                  }
                  isDisabled={
                    !!currentPlan && currentPlan.id !== highlightedPlan.id
                  } // Desabilita se houver um plano ativo
                  isProcessingPayment={isProcessingPayment}
                />
              )}
              {otherPlans
                .slice(Math.floor(otherPlans.length / 2))
                .map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isAdmin={isAdmin}
                    isEnterpriseUser={isEnterpriseUser}
                    handleDelete={openConfirmationModal}
                    handlePayment={handlePayment}
                    handleCancel={openCancellationModal}
                    isCurrent={currentPlan && currentPlan.id === plan.id}
                    isDisabled={!!currentPlan && currentPlan.id !== plan.id} // Desabilita se houver um plano ativo
                    isProcessingPayment={isProcessingPayment}
                  />
                ))}
            </>
          )}
        </div>

        {isAdmin && (
          <OverlayTrigger
            placement="top"
            overlay={plans.length >= 4 ? renderTooltip : <></>}
          >
            <button
              id="add-plan-button"
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
              style={{
                position: sticks ? "absolute" : "fixed",
                bottom: sticks ? "10px" : "20px",
              }}
            >
              <PlusCircle className="icon" />
              Add Service Plan
            </button>
          </OverlayTrigger>
        )}
      </div>

      <ConfirmationModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirm Plan Deletion"
        body="Are you sure you want to delete this plan?"
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      <PaymentConfirmationModal
        show={showPaymentModal}
        onHide={handleClosePaymentModal}
        onConfirm={handleConfirmPayment}
        plan={planToPurchase}
        isProcessing={isProcessingPayment}
        paymentStatus={paymentStatus}
      />

      <CancellationConfirmationModal
        show={showCancellationModal}
        onHide={handleCloseCancellationModal}
        onConfirm={handleConfirmCancellation}
        isProcessing={cancellationStatus === "processing"}
        cancellationStatus={cancellationStatus}
      />

      <ToastContainer />
    </div>
  );
};

export default Price;
