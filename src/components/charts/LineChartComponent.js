import React, { useState } from "react";
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
}) => {
  // Estado para armazenar o mês selecionado e o número de atribuições
  const [selectedData, setSelectedData] = useState(null);

  const handlePointClick = (e) => {
    if (e && e.activeLabel) {
      const selectedMonth = e.activeLabel; // Mês selecionado
      const dataPoint = data.find((d) => d.month === selectedMonth);
      setSelectedData(dataPoint); // Armazena os dados selecionados
    }
  };

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} onClick={handlePointClick}>
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
      {/* Exibe os dados selecionados */}
      {selectedData && (
        <div className="selected-data">
          <p>
            <strong>Month:</strong> {selectedData.month}
          </p>
          <p>
            <strong>Assignments:</strong> {selectedData.count}
          </p>
        </div>
      )}
    </div>
  );
};

export default LineChartComponent;
