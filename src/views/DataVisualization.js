// src/views/DataVisualization.js
import React, { useState, useEffect } from "react";
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
import "../styles/DataVisualization.css";

const DataVisualization = () => {
  const [badgesAssigned, setBadgesAssigned] = useState([]);
  const [attributionRate, setAttributionRate] = useState(null);
  const [averageTime, setAverageTime] = useState(null);
  const [acceptanceRate, setAcceptanceRate] = useState(null);
  const [assignmentTrends, setAssignmentTrends] = useState([]);
  const [softSkillsImpact, setSoftSkillsImpact] = useState([]);
  const [conversionAnalysis, setConversionAnalysis] = useState(null);
  const [popularityTrends, setPopularityTrends] = useState([]);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");
  const userType = sessionStorage.getItem("tipoUsuario");
  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

  const navigate = useNavigate();

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://192.168.15.31:5000";

  useEffect(() => {
    if (!token || userType !== "UE") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // 1. Badges Assigned in Period
        const badgesResponse = await axios.get(
          `${API_BASE_URL}/api/analysis/badges_assigned/6`,
          {
            ...config,
            params: { email: userInfo.email_comercial },
          }
        );
        setBadgesAssigned(badgesResponse.data.count);

        // 2. Attribution Rate
        const attributionResponse = await axios.get(
          `${API_BASE_URL}/api/analysis/attribution_rate`,
          {
            ...config,
            params: { email: userInfo.email_comercial },
          }
        );
        setAttributionRate(attributionResponse.data.attribution_rate);

        // 3. Average Time Between Emission and Assignment
        const avgTimeResponse = await axios.get(
          `${API_BASE_URL}/api/analysis/avg_time_between_emission_assignment`,
          {
            ...config,
            params: { email: userInfo.email_comercial },
          }
        );
        setAverageTime(avgTimeResponse.data.average_time_seconds);

        // 4. Acceptance Rate
        const acceptanceResponse = await axios.get(
          `${API_BASE_URL}/api/analysis/acceptance_rate`,
          {
            ...config,
            params: { email: userInfo.email_comercial },
          }
        );
        setAcceptanceRate(acceptanceResponse.data.acceptance_rate);

        // 5. Assignment Trends
        const trendsResponse = await axios.get(
          `${API_BASE_URL}/api/analysis/assignment_trends`,
          {
            ...config,
            params: { email: userInfo.email_comercial, period: 6 },
          }
        );
        setAssignmentTrends(trendsResponse.data.trend);

        // 6. Soft Skills Impact
        const skillsResponse = await axios.get(
          `${API_BASE_URL}/api/analysis/soft_skills_impact`,
          {
            ...config,
            params: { email: userInfo.email_comercial },
          }
        );
        setSoftSkillsImpact(
          Object.entries(skillsResponse.data.skills).map(([skill, data]) => ({
            skill,
            assigned_count: data.assigned_count,
            ...data,
          }))
        );

        // 7. Conversion Analysis
        const conversionResponse = await axios.get(
          `${API_BASE_URL}/api/analysis/conversion_analysis`,
          {
            ...config,
            params: { email: userInfo.email_comercial },
          }
        );
        setConversionAnalysis(conversionResponse.data);

        // 8. Popularity Trends
        const popularityResponse = await axios.get(
          `${API_BASE_URL}/api/analysis/popularity_trends`,
          {
            ...config,
            params: { email: userInfo.email_comercial },
          }
        );
        setPopularityTrends(popularityResponse.data);
      } catch (err) {
        console.error("Erro ao buscar dados de análise:", err);
        setError("Falha ao carregar os dados de análise.");
      }
    };

    fetchData();
  }, [token, userType, userInfo, navigate, API_BASE_URL]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (userType !== "UE") {
    return (
      <div className="info-message">
        Acesso restrito para usuários empresariais.
      </div>
    );
  }

  return (
    <div className="data-visualization-container">
      <h2>Visualização de Dados</h2>
      <div className="charts-grid">
        {/* Badges Assigned */}
        <div className="chart-card">
          <h3>Badges Atribuídas nos Últimos 6 Meses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ name: "Badges", count: badgesAssigned }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Badges Atribuídas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attribution Rate */}
        <div className="chart-card">
          <h3>Taxa de Atribuição</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Atribuídas", value: attributionRate },
                  { name: "Não Atribuídas", value: 100 - attributionRate },
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
          <h3>Tempo Médio entre Emissão e Atribuição</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  name: "Tempo Médio",
                  time: averageTime ? (averageTime / 60).toFixed(2) : 0,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{ value: "Minutos", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="time" fill="#ffc658" name="Tempo Médio (min)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Acceptance Rate */}
        <div className="chart-card">
          <h3>Taxa de Aceitação</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Aceitas", value: acceptanceRate },
                  { name: "Não Aceitas", value: 100 - acceptanceRate },
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
          <h3>Tendências de Atribuição nos Últimos 6 Meses</h3>
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
                name="Atribuições"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Soft Skills Impact */}
        <div className="chart-card">
          <h3>Impacto nas Soft Skills</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={softSkillsImpact}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="assigned_count" stroke="#ff7300" />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Analysis */}
        <div className="chart-card">
          <h3>Análise de Conversão</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Conversões",
                    value: conversionAnalysis
                      ? conversionAnalysis.conversion_rate
                      : 0,
                  },
                  {
                    name: "Não Conversões",
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
          <h3>Tendências de Popularidade de Badges</h3>
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
                name="Badges Recentes"
              />
              <Line
                type="monotone"
                dataKey="old_badges.assigned_count"
                stroke="#ffc658"
                name="Badges Antigas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
