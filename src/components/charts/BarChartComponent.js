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

const BarChartComponent = ({ data, title, dataKey, fill, name }) => (
  <div className="chart-card">
    <h3>{title}</h3>
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
