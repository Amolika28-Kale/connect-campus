// pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { getDashboardStatsAPI } from "../services/adminService";
import { Users, UserCheck, UserX, Heart, AlertTriangle, Activity } from "lucide-react";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStatsAPI();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const cards = [
    { title: "Total Users", value: stats?.totalUsers, icon: Users, color: "bg-blue-500" },
    { title: "Total Girls", value: stats?.totalGirls, icon: UserCheck, color: "bg-pink-500" },
    { title: "Total Boys", value: stats?.totalBoys, icon: UserCheck, color: "bg-purple-500" },
    { title: "Pending Approvals", value: stats?.pendingApprovals, icon: UserX, color: "bg-yellow-500" },
    { title: "Total Matches", value: stats?.totalMatches, icon: Heart, color: "bg-red-500" },
    { title: "Total Reports", value: stats?.totalReports, icon: AlertTriangle, color: "bg-orange-500" },
    { title: "Active Today", value: stats?.activeUsersToday, icon: Activity, color: "bg-green-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard 📊</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon size={24} className="text-white" />
              </div>
              <span className="text-3xl font-bold">{card.value}</span>
            </div>
            <h3 className="text-gray-400">{card.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;