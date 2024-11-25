// src/components/charts/RadarChartComponent.js
import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
} from "recharts";

const RadarChartComponent = ({ data, title, dataKey, stroke, name }) => {
  // Verificar se os dados estão presentes
  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3>{title}</h3>
        <p>No data available to display.</p>
      </div>
    );
  }

  // Calcular o valor máximo de 'assigned_count' para ajustar o domínio
  const maxAssignedCount = Math.max(...data.map((d) => d.assigned_count));
  const radiusDomainMax = maxAssignedCount + Math.ceil(maxAssignedCount * 0.2); // Adiciona 20% ao máximo para melhor visualização

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        {" "}
        {/* Aumentar a altura para 400 */}
        <RadarChart
          data={data}
          outerRadius="80%"
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <PolarGrid />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "#ffffff", fontSize: "0.9rem" }}
            angle={0}
            tickLine={false}
            axisLine={false}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, radiusDomainMax]}
            tick={{ fill: "#ffffff" }} // Cor dos ticks
            tickCount={5} // Define o número de ticks
          />
          <Tooltip />
          <Legend />
          <Radar
            name={name}
            dataKey={dataKey}
            stroke={stroke}
            fill={stroke}
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;
