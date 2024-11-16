// src/views/DataVisualization.js
import React, { useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import BarChartComponent from "../components/charts/BarChartComponent";
import PieChartComponent from "../components/charts/PieChartComponent";
import LineChartComponent from "../components/charts/LineChartComponent";
import RadarChartComponent from "../components/charts/RadarChartComponent";
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
    process.env.REACT_APP_API_BASE_URL || "http://192.168.15.31:5000";

  const queries = useQueries({
    queries: [
      {
        queryKey: ["badgesAssigned", userInfo.email_comercial],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/badges_assigned/6`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { email: userInfo.email_comercial },
            })
            .then((res) => res.data.count),
        enabled: !!token && userType === "UE",
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
              Object.entries(res.data.skills).map(([skill, data]) => ({
                skill,
                assigned_count: data.assigned_count,
                attribution_rate: data.attribution_rate,
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
    return <div className="loading">Loading...</div>;
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
        {/* Badges Assigned */}
        <BarChartComponent
          data={[{ name: "Badges", count: badgesAssigned }]}
          title="Badges Assigned in the Last 6 Months"
          dataKey="count"
          fill="#4A90E2"
          name="Badges Assigned"
        />

        {/* Attribution Rate */}
        <PieChartComponent
          data={[
            { name: "Attributed", value: attributionRate },
            { name: "Not Attributed", value: 100 - attributionRate },
          ]}
          title="Attribution Rate"
          dataKey="value"
          nameKey="name"
          fill="#50E3C2"
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
        />

        {/* Acceptance Rate */}
        <PieChartComponent
          data={[
            { name: "Accepted", value: acceptanceRate },
            { name: "Not Accepted", value: 100 - acceptanceRate },
          ]}
          title="Acceptance Rate"
          dataKey="value"
          nameKey="name"
          fill="#4A90E2"
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
          stroke="#F8E71C"
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
            },
            {
              name: "Non-Conversions",
              value: conversionAnalysis
                ? 100 - conversionAnalysis.conversion_rate
                : 0,
            },
          ]}
          title="Conversion Analysis"
          dataKey="value"
          nameKey="name"
          fill="#B8E986"
        />

        {/* Popularity Trends */}
        <LineChartComponent
          data={popularityTrends}
          title="Badge Popularity Trends"
          dataKeys={[
            "recent_badges.assigned_count",
            "old_badges.assigned_count",
          ]}
          colors={["#7ED321", "#417505"]}
          names={["Recent Badges", "Old Badges"]}
        />
      </div>
    </div>
  );
};

export default DataVisualization;
