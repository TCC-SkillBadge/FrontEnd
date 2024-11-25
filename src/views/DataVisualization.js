// src/views/DataVisualization.js
import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import BarChartComponent from "../components/charts/BarChartComponent";
import PieChartComponent from "../components/charts/PieChartComponent";
import LineChartComponent from "../components/charts/LineChartComponent";
import RadarChartComponent from "../components/charts/RadarChartComponent";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/DataVisualization.css";

const DataVisualization = () => {
  const token = sessionStorage.getItem("token");
  const userType = sessionStorage.getItem("tipoUsuario"); // Usando a chave correta
  const userInfo = useMemo(() => {
    const info = sessionStorage.getItem("userInfo");
    return info ? JSON.parse(info) : {};
  }, []);

  console.log("Tipo de Usuário:", userType);
  console.log("Email Comercial:", userInfo.email_comercial);

  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5001";

  // Estado para controlar o número de meses para Badges Assigned
  const [badgeMonths, setBadgeMonths] = useState(6); // Valor padrão: 6 meses

  // Função para validar e atualizar o número de meses
  const handleBadgeMonthsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 60) {
      // Limitar entre 1 e 60 meses
      setBadgeMonths(value);
    } else {
      // Opcional: Mostrar uma mensagem de erro ou ajustar automaticamente
      toast.error("Please enter a valid number of months (1-60).");
    }
  };

  const queries = useQueries({
    queries: [
      {
        queryKey: ["badgesAssigned", userInfo.email_comercial, badgeMonths],
        queryFn: () =>
          axios
            .get(
              `${API_BASE_URL}/api/analysis/badges_assigned/${badgeMonths}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: { email: userInfo.email_comercial },
              }
            )
            .then((res) => res.data.count),
        enabled: !!token && userType === "UE",
        staleTime: 5 * 60 * 1000, // Opcional: Tempo de cache
      },
      {
        queryKey: ["attributionRate", userInfo.email_comercial],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/attribution_rate`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { email: userInfo.email_comercial },
            })
            .then((res) => res.data.attribution_rate),
        enabled: !!token && userType === "UE",
      },
      {
        queryKey: ["averageTime", userInfo.email_comercial],
        queryFn: () =>
          axios
            .get(
              `${API_BASE_URL}/api/analysis/avg_time_between_emission_assignment`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: { email: userInfo.email_comercial },
              }
            )
            .then((res) => res.data.average_time_seconds),
        enabled: !!token && userType === "UE",
      },
      {
        queryKey: ["acceptanceRate", userInfo.email_comercial],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/acceptance_rate`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { email: userInfo.email_comercial },
            })
            .then((res) => res.data.acceptance_rate),
        enabled: !!token && userType === "UE",
      },
      {
        queryKey: ["assignmentTrends", userInfo.email_comercial, 6],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/assignment_trends`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { email: userInfo.email_comercial, period: 6 },
            })
            .then((res) => res.data.trend),
        enabled: !!token && userType === "UE",
      },
      {
        queryKey: ["softSkillsImpact", userInfo.email_comercial],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/soft_skills_impact`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { email: userInfo.email_comercial },
            })
            .then((res) =>
              res.data.skills.top_skills.map((skillData) => ({
                skill: skillData.skill,
                assigned_count: skillData.assigned_count,
                monthly_trend: skillData.monthly_trend,
              }))
            ),
        enabled: !!token && userType === "UE",
      },
      {
        queryKey: ["conversionAnalysis", userInfo.email_comercial],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/conversion_analysis`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { email: userInfo.email_comercial },
            })
            .then((res) => res.data),
        enabled: !!token && userType === "UE",
      },
      {
        queryKey: ["popularityTrends", userInfo.email_comercial],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/popularity_trends`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { email: userInfo.email_comercial },
            })
            .then((res) => res.data),
        enabled: !!token && userType === "UE",
      },
    ],
  });

  const [
    badgesAssigned,
    attributionRate,
    averageTime,
    acceptanceRate,
    assignmentTrends,
    softSkillsImpact,
    conversionAnalysis,
    popularityTrends,
  ] = queries.map((query) => query.data);

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errorMessage = queries.find((query) => query.isError)?.error?.message;

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <ClipLoader size={60} color="#4A90E2" loading={true} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-message">
        Failed to load analysis data: {errorMessage}
      </div>
    );
  }

  if (userType !== "UE") {
    return (
      <div className="info-message">Access restricted to business users.</div>
    );
  }

  return (
    <div className="data-visualization-container">
      <h2>Data Analysis</h2>
      <div className="charts-grid">
        {/* Badges Assigned com controle interno */}
        <BarChartComponent
          data={[{ name: "Badges", count: badgesAssigned }]}
          title={`Badges Assigned in the Last ${badgeMonths} Month${
            badgeMonths > 1 ? "s" : ""
          }`}
          dataKey="count"
          fill="#4A90E2"
          name="Badges Assigned"
          showMonthsControl={true} // Propriedade booleana para exibir o controle
          badgeMonths={badgeMonths} // Valor do número de meses
          handleBadgeMonthsChange={handleBadgeMonthsChange} // Função para atualizar o número de meses
        />

        {/* Outros BarCharts sem o controle */}
        <BarChartComponent
          data={[{ name: "Average Performance", count: 75 }]}
          title="Average Performance"
          dataKey="count"
          fill="#F5A623"
          name="Avg Performance"
          showMonthsControl={false} // Não exibir o controle
        />

        {/* Attribution Rate */}
        <PieChartComponent
          data={[
            { name: "Attributed", value: attributionRate, fill: "#50E3C2" }, // Verde para Attributed
            {
              name: "Not Attributed",
              value: 100 - attributionRate,
              fill: "#FF6347",
            }, // Vermelho para Not Attributed
          ]}
          title="Attribution Rate"
          dataKey="value"
          nameKey="name"
        />
        {/* Average Time */}
        <BarChartComponent
          data={[
            {
              name: "Average Time",
              time: averageTime ? (averageTime / 60).toFixed(2) : 0,
            },
          ]}
          title="Average Time Between Emission and Assignment"
          dataKey="time"
          fill="#F5A623"
          name="Avg Time (min)"
          showMonthsControl={false} // Não exibir o controle
        />

        {/* Acceptance Rate */}
        <PieChartComponent
          data={[
            { name: "Accepted", value: acceptanceRate, fill: "#50E3C2" }, // Verde para Accepted
            {
              name: "Not Accepted",
              value: 100 - acceptanceRate,
              fill: "#FF6347",
            }, // Vermelho para Not Accepted
          ]}
          title="Acceptance Rate"
          dataKey="value"
          nameKey="name"
        />

        {/* Assignment Trends */}
        <LineChartComponent
          data={assignmentTrends}
          title="Assignment Trends Over the Last 6 Months"
          dataKey="count"
          stroke="#9013FE"
          name="Assignments"
        />

        {/* Soft Skills Impact */}
        <RadarChartComponent
          data={softSkillsImpact}
          title="Impact on Soft Skills"
          dataKey="assigned_count"
          stroke="#F5A623"
          name="Assigned Count"
        />

        {/* Conversion Analysis */}
        <PieChartComponent
          data={[
            {
              name: "Conversions",
              value: conversionAnalysis
                ? conversionAnalysis.conversion_rate
                : 0,
              fill: "#B8E986",
            },
            {
              name: "Non-Conversions",
              value: conversionAnalysis
                ? 100 - conversionAnalysis.conversion_rate
                : 0,
              fill: "#FF6347",
            },
          ]}
          title="Conversion Analysis"
          dataKey="value"
          nameKey="name"
        />

        {/* Popularity Trends */}
        {/* <LineChartComponent
          data={popularityTrends}
          title="Badge Popularity Trends"
          dataKeys={[
            "recent_badges.assigned_count",
            "old_badges.assigned_count",
          ]}
          colors={["#7ED321", "#417505"]}
          names={["Recent Badges", "Old Badges"]}
        /> */}
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default DataVisualization;
