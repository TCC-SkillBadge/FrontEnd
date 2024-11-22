// src/components/charts/LineChartComponent.js
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const LineChartComponent = ({
  data,
  title,
  dataKey,
  stroke,
  name,
  // For multiple lines
  dataKeys,
  colors,
  names,
}) => (
  <div className="chart-card">
    <h3>{title}</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {dataKey && (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            name={name}
            strokeWidth={2}
          />
        )}
        {dataKeys &&
          dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index]}
              name={names[index]}
              strokeWidth={2}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default LineChartComponent;
