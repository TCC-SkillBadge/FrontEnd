// src/views/AdminDataVisualization.js
import React from "react";
import axios from "axios";
import { useQueries } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import BarChartComponent from "../components/charts/BarChartComponent";
import PieChartComponent from "../components/charts/PieChartComponent";
import LineChartComponent from "../components/charts/LineChartComponent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/DataVisualization.css";

const AdminDataVisualization = () => {
  const token = sessionStorage.getItem("token");
  const userType = sessionStorage.getItem("tipoUsuario");

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5001";

  const queries = useQueries({
    queries: [
      {
        queryKey: ["generalStatsAdmin"],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/admin/general_stats`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res.data),
        enabled: !!token && userType === "UA",
      },
      {
        queryKey: ["completedRequests"],
        queryFn: () =>
          axios
            .get(`${API_BASE_URL}/api/analysis/admin/completed_requests`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res.data.completed_requests),
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

  const [
    generalStatsAdmin,
    completedRequests,
    requestsStatusBreakdown,
    completedRequestsTrend,
    requestStatusProportions,
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

  if (userType !== "UA") {
    return (
      <div className="info-message">Access restricted to administrators.</div>
    );
  }

  return (
    <div className="data-visualization-container">
      <h2>Admin Data Analysis</h2>
      <div className="charts-grid">
        <BarChartComponent
          data={[{ name: "General Stats", count: generalStatsAdmin?.total }]}
          title="General Statistics"
          dataKey="count"
          fill="#4A90E2"
          name="General Stats"
        />
        <BarChartComponent
          data={[{ name: "Completed Requests", count: completedRequests }]}
          title="Completed Requests"
          dataKey="count"
          fill="#F5A623"
          name="Completed Requests"
        />
        <PieChartComponent
          data={Object.entries(requestsStatusBreakdown || {}).map(
            ([status, count]) => ({ name: status, value: count })
          )}
          title="Request Status Breakdown"
          dataKey="value"
          nameKey="name"
        />
        <LineChartComponent
          data={completedRequestsTrend}
          title="Completed Requests Trend"
          dataKey="count"
          stroke="#9013FE"
          name="Requests Trend"
        />
        <PieChartComponent
          data={Object.entries(requestStatusProportions || {}).map(
            ([status, proportion]) => ({
              name: status,
              value: proportion,
            })
          )}
          title="Request Status Proportions"
          dataKey="value"
          nameKey="name"
        />
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
