import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useQuery } from "@apollo/client";
import { GET_RECENT_SESSION_STATS } from "../../utils/queries";
import "./RecentSessionsChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RecentSessionsProps {
  deckId: string;
}

export default function RecentSessionsChart({ deckId }: RecentSessionsProps) {
  const { data, loading, error } = useQuery(GET_RECENT_SESSION_STATS, {
    variables: {
      deckId,
      limit: 10,
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.error("Error fetching session stats:", error);
    return <div>Error loading chart data</div>;
  }
  if (!data?.recentSessionsStats?.length) {
    return <div>No session data available</div>;
  }

  const sortedSessions = [...data.recentSessionsStats]
    .sort((a, b) => {
      // convert timestamps to numbers for comparison
      const timeA = parseInt(a.timestamp);
      const timeB = parseInt(b.timestamp);
      // sort descending (newest first)
      return timeB - timeA;
    })
    // Take only the 5 most recent
    .slice(0, 5);

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp));
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error parsing date:", error);
      return "Invalid Date";
    }
  };

  const chartData = {
    labels: sortedSessions.map((session) => formatDate(session.timestamp)),
    datasets: [
      {
        label: "Session Accuracy (%)",
        data: sortedSessions.map((session) => session.sessionAccuracy),
        backgroundColor: "rgba(204, 213, 174, 0.8)",
        borderColor: "rgba(204, 213, 174, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Recent Study Sessions Performance",
      },
    },
    scales: {
      x: {
        reverse: true, // show newest on right
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Accuracy (%)",
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="session-history" style={{ height: "400px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
