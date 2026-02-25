"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DIMENSION_COLORS: Record<string, string> = {
  "Identity & Motivation": "#6366f1",
  "Working Style & Psychology": "#f59e0b",
  "Skills & Capabilities": "#10b981",
  "Structural & Practical": "#ef4444",
  "Relationship & Trust": "#8b5cf6",
  overall: "#18181b",
};

interface Props {
  data: Record<string, unknown>[];
}

export function TrendChart({ data }: Props) {
  if (data.length === 0) return null;

  const dimensions = Object.keys(data[0]).filter((k) => k !== "date");

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#a1a1aa" />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e4e4e7",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          {dimensions.map((dim) => (
            <Line
              key={dim}
              type="monotone"
              dataKey={dim}
              stroke={DIMENSION_COLORS[dim] || "#71717a"}
              strokeWidth={dim === "overall" ? 3 : 1.5}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
