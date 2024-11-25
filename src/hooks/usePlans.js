// src/hooks/usePlans.js

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const usePlans = (userType) => {
  // Adicionado userType como parâmetro
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const planServiceUrl = process.env.REACT_APP_API_PLAN;
  const enterpriseUrl = process.env.REACT_APP_API_ENTERPRISE;

  const fetchPlansAndCurrentPlan = async () => {
    try {
      // Buscar todos os planos
      const response = await axios.get(`${planServiceUrl}/api/plans`);
      setPlans(response.data);

      // Condicional: Apenas buscar currentPlan se o usuário NÃO for administrativo
      if (userType !== "UA") {
        const token = sessionStorage.getItem("token");
        if (token) {
          const currentPlanResponse = await axios.get(
            `${enterpriseUrl}/api/current-plan`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setCurrentPlan(currentPlanResponse.data);
        }
      } else {
        setCurrentPlan(null); // Opcional: Definir currentPlan como null para admins
      }

      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar os planos ou o plano atual!", error);
      toast.error("Error fetching plans. Please try again later.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userType !== null) {
      // Garantir que userType esteja definido
      fetchPlansAndCurrentPlan();
    }
  }, [userType]); // Adicionado userType como dependência

  // Função para cancelar o plano atual
  const cancelCurrentPlan = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated.");
      }

      const response = await axios.post(
        `${enterpriseUrl}/api/usuarios/cancelar-plano`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message || "Plan successfully canceled!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });

      setCurrentPlan(null); // Atualiza o estado para refletir que não há plano atual
    } catch (error) {
      console.error("Erro ao cancelar o plano:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to cancel the plan.";
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        theme: "dark",
      });
    }
  };

  return {
    plans,
    setPlans,
    currentPlan,
    setCurrentPlan,
    loading,
    cancelCurrentPlan,
  };
};

export default usePlans;
