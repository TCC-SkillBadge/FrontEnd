// src/views/DataVisualization.js
import React, { useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query"; // Correct import
import "../styles/DataVisualization.css";

const DataVisualization = () => {
  const token = sessionStorage.getItem("token");
  const userType = sessionStorage.getItem("tipoUsuario");
  const userInfo = useMemo(() => {
    const info = sessionStorage.getItem("userInfo");
    return info ? JSON.parse(info) : {};
  }, []);

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
      <h2>Data Visualization</h2>
      <div className="charts-grid">
        {/* Badges Assigned */}
        <div className="chart-card">
          <h3>Badges Assigned in the Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ name: "Badges", count: badgesAssigned }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Badges Assigned" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attribution Rate */}
        <div className="chart-card">
          <h3>Attribution Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Attributed", value: attributionRate },
                  { name: "Not Attributed", value: 100 - attributionRate },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#82ca9d"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Average Time */}
        <div className="chart-card">
          <h3>Average Time Between Emission and Assignment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: "Average Time",
                  time: averageTime ? (averageTime / 60).toFixed(2) : 0,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{ value: "Minutes", angle: -90, position: "insideLeft" }}
                allowDecimals={false}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="time" fill="#ffc658" name="Avg Time (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Acceptance Rate */}
        <div className="chart-card">
          <h3>Acceptance Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Accepted", value: acceptanceRate },
                  { name: "Not Accepted", value: 100 - acceptanceRate },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#ff8042"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assignment Trends */}
        <div className="chart-card">
          <h3>Assignment Trends Over the Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={assignmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                name="Assignments"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Soft Skills Impact */}
        <div className="chart-card">
          <h3>Impact on Soft Skills</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={softSkillsImpact}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="assigned_count"
                stroke="#ff7300"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Analysis */}
        <div className="chart-card">
          <h3>Conversion Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
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
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Popularity Trends */}
        <div className="chart-card">
          <h3>Badge Popularity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={popularityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="recent_badges.assigned_count"
                stroke="#82ca9d"
                name="Recent Badges"
              />
              <Line
                type="monotone"
                dataKey="old_badges.assigned_count"
                stroke="#ffc658"
                name="Old Badges"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
