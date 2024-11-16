// src/components/charts/BarChartComponent.js
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const BarChartComponent = ({
  data,
  title,
  dataKey,
  fill,
  name,
  showMonthsControl, // Nova prop booleana
  badgeMonths, // Valor do número de meses
  handleBadgeMonthsChange, // Função para atualizar o número de meses
}) => (
  <div className="chart-card">
    <div className="chart-header">
      <h3>{title}</h3>
      {showMonthsControl && (
        <div className="badge-months-control">
          <label htmlFor="badgeMonthsSelect">Months:</label>
          <input
            type="number"
            id="badgeMonthsSelect"
            value={badgeMonths}
            onChange={handleBadgeMonthsChange}
            min="1"
            max="60"
            className="badge-months-input"
          />
        </div>
      )}
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={fill} name={name} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default BarChartComponent;
