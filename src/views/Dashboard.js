// src/views/Dashboard.js
import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Line, Bar, Pie, Radar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { useNavigate } from "react-router-dom";

Chart.register(...registerables);

const Dashboard = () => {
  const [data, setData] = useState({
    badgesAssigned: null,
    attributionRate: null,
    acceptanceRate: null,
    assignmentTrends: null,
    softSkillsImpact: null,
    conversionAnalysis: null,
    popularityTrends: null,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const email = sessionStorage.getItem("email");

      if (!token || !email) {
        toast.error("You need to be logged in to access the Dashboard.");
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { email },
      };

      const endpoints = [
        { name: "badgesAssigned", url: `/api/analysis/badges_assigned/6` },
        { name: "attributionRate", url: "/api/analysis/attribution_rate" },
        { name: "acceptanceRate", url: "/api/analysis/acceptance_rate" },
        { name: "assignmentTrends", url: "/api/analysis/assignment_trends" },
        { name: "softSkillsImpact", url: "/api/analysis/soft_skills_impact" },
        {
          name: "conversionAnalysis",
          url: "/api/analysis/conversion_analysis",
        },
        { name: "popularityTrends", url: "/api/analysis/popularity_trends" },
      ];

      const fetchPromises = endpoints.map((endpoint) =>
        axios
          .get(endpoint.url, { ...config })
          .then((response) => ({ name: endpoint.name, data: response.data }))
          .catch((error) => {
            console.error(`Erro ao buscar ${endpoint.name}:`, error);
            return { name: endpoint.name, data: null };
          })
      );

      const results = await Promise.all(fetchPromises);

      const newData = {};
      results.forEach((result) => {
        newData[result.name] = result.data;
      });
      setData(newData);
      toast.success("Data loaded successfully!");
    } catch (error) {
      console.error("Erro ao buscar os dados de análise:", error);
      toast.error("Error loading analysis data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("token") && sessionStorage.getItem("email")) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Configuração dos dados dos gráficos
  const badgesAssignedData = {
    labels: ["Badges Atribuídos"],
    datasets: [
      {
        label: "Total",
        data: [data.badgesAssigned ? data.badgesAssigned.count : 0],
        backgroundColor: "#4CAF50",
      },
    ],
  };

  const attributionRateData = {
    labels: ["Assigned", "Not Assigned"],
    datasets: [
      {
        data: data.attributionRate
          ? [data.attributionRate, 100 - data.attributionRate]
          : [0, 0],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const acceptanceRateData = {
    labels: ["Accepted", "Rejected"],
    datasets: [
      {
        data: data.acceptanceRate
          ? [data.acceptanceRate, 100 - data.acceptanceRate]
          : [0, 0],
        backgroundColor: ["#4BC0C0", "#FF6384"],
      },
    ],
  };

  const assignmentTrendsData = {
    labels: data.assignmentTrends
      ? Object.keys(data.assignmentTrends.trend)
      : [],
    datasets: [
      {
        label: "Assignment Trends",
        data: data.assignmentTrends
          ? Object.values(data.assignmentTrends.trend)
          : [],
        fill: false,
        backgroundColor: "#FFCE56",
        borderColor: "#FFCE56",
      },
    ],
  };

  const softSkillsImpactData = {
    labels: data.softSkillsImpact
      ? Object.keys(data.softSkillsImpact.skills)
      : [],
    datasets: [
      {
        label: "Impact on Soft Skills",
        data: data.softSkillsImpact
          ? Object.values(data.softSkillsImpact.skills)
          : [],
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  };

  const conversionAnalysisData = {
    labels: data.conversionAnalysis
      ? data.conversionAnalysis.by_badge_type.map((item) => item.badge_type)
      : [],
    datasets: [
      {
        label: "Conversion Rate",
        data: data.conversionAnalysis
          ? data.conversionAnalysis.by_badge_type.map(
            (item) => item.conversion_rate
          )
          : [],
        backgroundColor: "#FF6384",
      },
    ],
  };

  const popularityTrendsData = {
    labels: data.popularityTrends
      ? data.popularityTrends.recent_badges.popularity_score.map(
        (item) => item.badge_name
      )
      : [],
    datasets: [
      {
        label: "Recent Popularity",
        data: data.popularityTrends
          ? data.popularityTrends.recent_badges.popularity_score.map(
            (item) => item.popularity_score
          )
          : [],
        backgroundColor: "#36A2EB",
      },
      {
        label: "Old Popularity",
        data: data.popularityTrends
          ? data.popularityTrends.old_badges.popularity_score.map(
            (item) => item.popularity_score
          )
          : [],
        backgroundColor: "#FFCE56",
      },
    ],
  };

  return (
    <>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Analysis Dashboard</h1>
        {loading ? (
          <div className="spinner-container">
            <ClipLoader color="#d273ff" loading={loading} size={150} />
            <p className="loading-text">Loading data...</p>
          </div>
        ) : (
          <div className="charts-grid">
            <div className="chart-card">
              <h2>Assigned Badges</h2>
              <Bar data={badgesAssignedData} />
            </div>
            <div className="chart-card">
              <h2>Attribution Rate</h2>
              <Pie data={attributionRateData} />
            </div>
            <div className="chart-card">
              <h2>Acceptance Rate</h2>
              <Pie data={acceptanceRateData} />
            </div>
            <div className="chart-card">
              <h2>Assignment Trends</h2>
              <Line data={assignmentTrendsData} />
            </div>
            <div className="chart-card">
              <h2>Impact on Soft Skills</h2>
              <Radar data={softSkillsImpactData} />
            </div>
            <div className="chart-card">
              <h2>Conversion Analysis</h2>
              <Bar data={conversionAnalysisData} />
            </div>
            <div className="chart-card">
              <h2>Badge Popularity</h2>
              <Bar data={popularityTrendsData} />
            </div>
          </div>
        )}
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
    </>
  );
};

export default Dashboard;
