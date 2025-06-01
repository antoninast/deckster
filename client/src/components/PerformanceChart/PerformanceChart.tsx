import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PerformanceChartProps {
  attempts: Array<{
    attemptAccuracy: number;
    timestamp: string;
  }>;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  attempts,
}) => {
  const data = attempts.map((attempt) => ({
    accuracy: attempt.attemptAccuracy,
    time: new Date(attempt.timestamp).toLocaleTimeString(),
  }));

  return (
    <div style={{ width: "100%", height: 300, marginTop: "2rem" }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="time" angle={-45} textAnchor="end" height={60} />
          <YAxis
            domain={[0, 100]}
            label={{
              value: "Accuracy %",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Bar dataKey="accuracy" fill="var(--color-tan)" name="Accuracy" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
