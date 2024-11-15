// src/pages/Price.js
import React, { useState, useEffect } from "react";
import { PlusCircle } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
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

  useEffect(() => {
    // Buscar informações do usuário
    const storedUserType = sessionStorage.getItem("tipoUsuario");
    const storedUserInfo = sessionStorage.getItem("userInfo");
    let storedEmail = null;

    if (storedUserInfo) {
      try {
        const userInfo = JSON.parse(storedUserInfo);
        storedEmail = userInfo.email_comercial || null;
      } catch (e) {
        console.error("Erro ao analisar userInfo do sessionStorage:", e);
      }
    }

    setUserType(storedUserType);
    setEmailComercial(storedEmail);

    console.log("Stored User Type:", storedUserType);
    console.log("Stored Email:", storedEmail);
  }, []);

  // Abrir modal de confirmação de exclusão
  const openConfirmationModal = (planId) => {
    setPlanToDelete(planId);
    setShowModal(true);
  };

  // Fechar modal de confirmação de exclusão
  const handleCloseModal = () => {
    setShowModal(false);
    setPlanToDelete(null);
  };

  // Confirmar exclusão do plano
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:9090/api/plans/${planToDelete}`);
      setPlans((prevPlans) =>
        prevPlans.filter((plan) => plan.id !== planToDelete)
      );
      toast.success("Plano deletado com sucesso!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    } catch (error) {
      console.error("Erro ao deletar o plano!", error);
      toast.error("Falha ao deletar o plano.", {
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

  // Iniciar processo de pagamento
  const handlePayment = (planId) => {
    const selectedPlan = plans.find((plan) => plan.id === planId);
    openPaymentModal(selectedPlan);
  };

  // Abrir modal de confirmação de pagamento
  const openPaymentModal = (plan) => {
    setPlanToPurchase(plan);
    setShowPaymentModal(true);
  };

  // Fechar modal de confirmação de pagamento
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPlanToPurchase(null);
    setPaymentStatus(null);
  };

  // Confirmar pagamento e associar plano
  const handleConfirmPayment = async () => {
    console.log("Plano a Comprar:", planToPurchase);
    console.log("Email Comercial:", emailComercial);

    if (!emailComercial) {
      toast.error("Usuário não autenticado. Por favor, faça login novamente.", {
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

    // Validação adicional de formato de email (opcional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailComercial)) {
      toast.error("Email comercial inválido.", {
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

    setIsProcessingPayment(true); // Iniciar o carregamento
    setPaymentStatus("processing"); // Iniciar o processamento

    try {
      const response = await axios.post(
        "http://localhost:7003/api/usuarios/associar-plano",
        {
          planId: planToPurchase.id,
          userEmail: emailComercial,
        }
      );
      toast.success(
        response.data.message || "Pagamento realizado com sucesso!",
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
      // Atualizar o plano atual
      setCurrentPlan(response.data.plan);
      setPaymentStatus("success"); // Sucesso
    } catch (error) {
      console.error("Erro ao processar o pagamento:", error);
      let errorMessage = "Falha ao processar o pagamento.";
      if (error.response) {
        // O servidor respondeu com um status diferente de 2xx
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // A requisição foi feita, mas nenhuma resposta foi recebida
        errorMessage =
          "Nenhuma resposta do servidor. Tente novamente mais tarde.";
      } else {
        // Algo aconteceu ao configurar a requisição
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
      setPaymentStatus("failure"); // Falha
    } finally {
      setIsProcessingPayment(false); // Finalizar o carregamento
      handleClosePaymentModal();
    }
  };

  // Abrir modal de confirmação de cancelamento
  const openCancellationModal = () => {
    setShowCancellationModal(true);
  };

  // Fechar modal de confirmação de cancelamento
  const handleCloseCancellationModal = () => {
    setShowCancellationModal(false);
    setCancellationStatus(null);
  };

  // Confirmar cancelamento do plano
  const handleConfirmCancellation = async () => {
    setCancellationStatus("processing");
    try {
      await cancelCurrentPlan();
      setCancellationStatus("success");
      // Opcional: Atualize outros estados ou faça outras ações necessárias
    } catch (error) {
      setCancellationStatus("failure");
      // Erros já são tratados no hook, então nenhuma ação extra é necessária aqui
    } finally {
      handleCloseCancellationModal();
    }
  };

  const highlightedPlan = plans.find((plan) => plan.prioridade);
  const otherPlans = plans.filter((plan) => !plan.prioridade);

  // Tooltip para o botão de adicionar plano
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Você não pode ter mais de 4 planos.
    </Tooltip>
  );

  const isAdmin = userType === "UA";
  const isEnterpriseUser = userType === "UE";

  return (
    <div>
      <Navbar />
      <div className="price-page">
        <h1 className="title">
          Os <span className="highlight">MELHORES</span> planos
        </h1>
        <h2 className="subtitle">Com que frequência você deseja pagar?</h2>
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
                    handleCancel={openCancellationModal} // Passar a função de cancelamento
                    isCurrent={currentPlan && currentPlan.id === plan.id}
                    isDimmed={currentPlan && currentPlan.id !== plan.id}
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
                  handleCancel={openCancellationModal} // Passar a função de cancelamento
                  isCurrent={
                    currentPlan && currentPlan.id === highlightedPlan.id
                  }
                  isDimmed={
                    currentPlan && currentPlan.id !== highlightedPlan.id
                  }
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
                    handleCancel={openCancellationModal} // Passar a função de cancelamento
                    isCurrent={currentPlan && currentPlan.id === plan.id}
                    isDimmed={currentPlan && currentPlan.id !== plan.id}
                    isProcessingPayment={isProcessingPayment}
                  />
                ))}
            </>
          )}
        </div>

        {/* Tooltip e desabilitar botão se houverem quatro ou mais planos */}
        {isAdmin && (
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
              Adicionar Plano de Serviço
            </button>
          </OverlayTrigger>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão do Plano"
        body="Tem certeza de que deseja excluir este plano?"
        confirmButtonText="Excluir"
        cancelButtonText="Cancelar"
      />

      {/* Modal de Confirmação de Pagamento */}
      <PaymentConfirmationModal
        show={showPaymentModal}
        onHide={handleClosePaymentModal}
        onConfirm={handleConfirmPayment}
        plan={planToPurchase}
        isProcessing={isProcessingPayment}
        paymentStatus={paymentStatus}
      />

      {/* Modal de Confirmação de Cancelamento */}
      <CancellationConfirmationModal
        show={showCancellationModal}
        onHide={handleCloseCancellationModal}
        onConfirm={handleConfirmCancellation}
        isProcessing={cancellationStatus === "processing"}
        cancellationStatus={cancellationStatus}
      />

      {/* Container do ReactToastify */}
      <ToastContainer />
    </div>
  );
};

export default Price;
