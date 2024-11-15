// Price.js
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

const Price = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null); // Novo estado para o plano atual
  const [userType, setUserType] = useState(null);
  const [emailComercial, setEmailComercial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [planToPurchase, setPlanToPurchase] = useState(null);

  useEffect(() => {
    const fetchPlansAndCurrentPlan = async () => {
      try {
        // Buscar todos os planos
        const response = await axios.get("http://localhost:9090/api/plans");
        setPlans(response.data);

        // Buscar o plano atual do usuário
        const token = sessionStorage.getItem("token"); // Assumindo que o token está armazenado no sessionStorage
        if (token) {
          const currentPlanResponse = await axios.get(
            "http://localhost:7003/api/current-plan",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setCurrentPlan(currentPlanResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Ocorreu um erro ao buscar os planos ou o plano atual!",
          error
        );
        setLoading(false);
      }
    };

    fetchPlansAndCurrentPlan();

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
      toast.success("Plano deletado com sucesso!", {
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
      console.error("Ocorreu um erro ao deletar o plano!", error);
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

  // Função para iniciar o processo de pagamento
  const handlePayment = (planId) => {
    const selectedPlan = plans.find((plan) => plan.id === planId);
    openPaymentModal(selectedPlan);
  };

  // Abre o modal de confirmação de pagamento
  const openPaymentModal = (plan) => {
    setPlanToPurchase(plan);
    setShowPaymentModal(true);
  };

  // Fecha o modal de confirmação de pagamento
  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPlanToPurchase(null);
  };

  // Função para confirmar o pagamento
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

    try {
      const response = await axios.post(
        "http://localhost:7003/api/usuarios/associar-plano",
        {
          planId: planToPurchase.id,
          userEmail: emailComercial,
        }
      );
      // Exibir mensagem de sucesso
      toast.success(response.data.message, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
      // Atualizar o plano atual
      setCurrentPlan(response.data.plan); // Atualize com os dados do plano retornado
    } catch (error) {
      console.error("Erro ao processar o pagamento:", error);
      toast.error("Falha ao processar o pagamento.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    } finally {
      handleClosePaymentModal();
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
                    isCurrent={currentPlan && currentPlan.id === plan.id} // Nova prop
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
                  isCurrent={
                    currentPlan && currentPlan.id === highlightedPlan.id
                  } // Nova prop
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
                    isCurrent={currentPlan && currentPlan.id === plan.id} // Nova prop
                  />
                ))}
            </>
          )}
        </div>

        {/* Adicionar Tooltip e desabilitar o botão se houver quatro ou mais planos */}
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

      {/* Modal de confirmação de exclusão */}
      <ConfirmationModal
        show={showModal}
        onHide={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão do Plano"
        body="Tem certeza de que deseja excluir este plano?"
        confirmButtonText="Excluir"
        cancelButtonText="Cancelar"
      />

      {/* Modal de confirmação de pagamento */}
      <PaymentConfirmationModal
        show={showPaymentModal}
        onHide={handleClosePaymentModal}
        onConfirm={handleConfirmPayment}
        plan={planToPurchase}
      />

      {/* Container do ReactToastify */}
      <ToastContainer />
    </div>
  );
};

export default Price;
