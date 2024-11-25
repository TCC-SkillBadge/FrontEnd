// src/views/AdminDataVisualization.js
import React, { useEffect } from "react";
import axios from "axios";
import { useQueries } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/DataVisualization.css";

const COLORS = ["#1F2937", "#4B5563", "#9CA3AF", "#F3F4F6", "#6B7280"]; // Paleta personalizada

const AdminDataVisualization = () => {
  const token = sessionStorage.getItem("token");
  const userType = sessionStorage.getItem("tipoUsuario");

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5001";

  // Definição das consultas (queries)
  const queries = useQueries({
    queries: [
      {
        queryKey: ["generalStatsAdmin"],
        queryFn: () =>
          axios
            .get(
              `${API_BASE_URL}/api/analysis/admin/general_request_statistics`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .then((res) => res.data),
        enabled: !!token && userType === "UA",
      },
      {
        queryKey: ["requestsStatusBreakdown"],
        queryFn: () =>
          axios
            .get(
              `${API_BASE_URL}/api/analysis/admin/requests_status_breakdown`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .then((res) => res.data.status_breakdown),
        enabled: !!token && userType === "UA",
      },
      {
        queryKey: ["completedRequestsTrend"],
        queryFn: () =>
          axios
            .get(
              `${API_BASE_URL}/api/analysis/admin/completed_requests_trend`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: { timeframe: "monthly" },
              }
            )
            .then((res) => res.data.completed_requests_trend),
        enabled: !!token && userType === "UA",
      },
      {
        queryKey: ["requestStatusProportions"],
        queryFn: () =>
          axios
            .get(
              `${API_BASE_URL}/api/analysis/admin/request_status_proportions`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .then((res) => res.data),
        enabled: !!token && userType === "UA",
      },
    ],
  });

  // Mapeamento dos dados recebidos
  const [
    generalStatsAdmin,
    requestsStatusBreakdown,
    completedRequestsTrend,
    requestStatusProportions,
  ] = queries.map((query) => query.data);

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errorMessage = queries.find((query) => query.isError)?.error?.message;

  // Log para depuração
  useEffect(() => {
    console.log("Received Data:", {
      generalStatsAdmin,
      requestsStatusBreakdown,
      completedRequestsTrend,
      requestStatusProportions,
    });
  }, [
    generalStatsAdmin,
    requestsStatusBreakdown,
    completedRequestsTrend,
    requestStatusProportions,
  ]);

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

  if (userType !== "UA") {
    return (
      <div className="info-message">
        Access restricted to administrators only.
      </div>
    );
  }

  // Verificação da existência dos campos esperados
  const totalRequests = generalStatsAdmin?.total_requests;
  const completedRequestsCount = generalStatsAdmin?.total_completed_requests;

  console.log("Total Requests:", totalRequests);
  console.log("Completed Requests:", completedRequestsCount);

  // Estrutura de dados para o BarChart
  const barData = [
    {
      name: "Requests",
      "Total Requests": totalRequests || 0,
      "Completed Requests": completedRequestsCount || 0,
    },
  ];

  // Estrutura de dados para os PieCharts
  const pieDataStatusBreakdown = Object.entries(
    requestsStatusBreakdown || {}
  ).map(([status, count]) => ({ name: status, value: count }));

  const pieDataStatusProportions = Object.entries(
    requestStatusProportions || {}
  ).map(([status, proportion]) => ({ name: status, value: proportion }));

  // Estrutura de dados para o LineChart
  let lineData = [];

  if (Array.isArray(completedRequestsTrend)) {
    lineData = completedRequestsTrend.map((item) => ({
      period: item.month || item.period || "N/A",
      count: item.count || 0,
    }));
  } else if (
    completedRequestsTrend &&
    typeof completedRequestsTrend === "object"
  ) {
    lineData = Object.entries(completedRequestsTrend).map(
      ([period, count]) => ({
        period,
        count: count || 0,
      })
    );
  } else {
    console.warn(
      "completedRequestsTrend is not an array or expected object. Verify API response."
    );
  }

  return (
    <div className="data-visualization-container">
      <h2>Administrative Data Analysis</h2>
      <div className="charts-grid">
        {/* Gráfico de Barras Atualizado */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>General Statistics and Completed Requests</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total Requests" fill="#1F2937" />
              <Bar dataKey="Completed Requests" fill="#6B7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Distribuição de Status de Solicitações */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Requests Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieDataStatusBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieDataStatusBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Tendência de Solicitações Completadas */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Completed Requests Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            {lineData.length > 0 ? (
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#9013FE"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            ) : (
              <p className="no-data-message">
                Insufficient data to display the trend chart.
              </p>
            )}
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Proporção de Status de Solicitações */}
        {/* <div className="chart-card">
          <div className="chart-header">
            <h3>Requests Status Proportion</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieDataStatusProportions}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                label
              >
                {pieDataStatusProportions.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div> */}
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

export default AdminDataVisualization;
