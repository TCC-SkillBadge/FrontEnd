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

const RadarChartComponent = ({ data, title, dataKey, stroke, name }) => (
  <div className="chart-card">
    <h3>{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
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

export default RadarChartComponent;
