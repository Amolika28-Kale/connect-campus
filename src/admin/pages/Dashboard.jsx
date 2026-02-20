// pages/admin/Dashboard.jsx - Enhanced UI & Fully Responsive
import { useEffect, useState } from "react";
import { getDashboardStatsAPI } from "../services/adminService";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Heart, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Zap,
  Shield,
  Sparkles,
  Download,
  RefreshCw,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const { data } = await getDashboardStatsAPI();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sample data for charts (replace with real data from API)
  const userGrowthData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Users',
        data: [12, 19, 15, 17, 14, 13, 18],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const activityData = {
    labels: ['Matches', 'Messages', 'Likes'],
    datasets: [
      {
        data: [65, 45, 75],
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const genderDistribution = {
    labels: ['Girls', 'Boys'],
    datasets: [
      {
        data: [stats?.totalGirls || 0, stats?.totalBoys || 0],
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles size={24} className="text-pink-500 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const mainCards = [
    { 
      title: "Total Users", 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500",
      change: "+12%",
      trend: "up"
    },
    { 
      title: "Active Today", 
      value: stats?.activeUsersToday || 0, 
      icon: Activity, 
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      textColor: "text-green-500",
      change: "+5%",
      trend: "up"
    },
    { 
      title: "Total Matches", 
      value: stats?.totalMatches || 0, 
      icon: Heart, 
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-500/10",
      textColor: "text-red-500",
      change: "+23%",
      trend: "up"
    },
    { 
      title: "Pending Approvals", 
      value: stats?.pendingApprovals || 0, 
      icon: UserX, 
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-500",
      change: "-2%",
      trend: "down"
    },
  ];

  const statCards = [
    { title: "Total Girls", value: stats?.totalGirls || 0, icon: UserCheck, color: "from-pink-500 to-rose-500" },
    { title: "Total Boys", value: stats?.totalBoys || 0, icon: UserCheck, color: "from-blue-500 to-indigo-500" },
    { title: "Total Reports", value: stats?.totalReports || 0, icon: AlertTriangle, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 mt-1">Welcome back, Admin! Here's what's happening today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-pink-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition relative group"
          >
            <RefreshCw size={20} className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
          </button>

          {/* Export Button */}
          <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-medium hover:opacity-90 transition flex items-center gap-2">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="group relative bg-gray-800 rounded-2xl p-6 overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-700"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <Icon size={24} className={card.textColor} />
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    card.trend === 'up' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {card.change}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</h3>
                <p className="text-gray-400 text-sm">{card.title}</p>
                
                {/* Progress Bar */}
                <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${card.color} transition-all duration-500`}
                    style={{ width: `${Math.min((card.value / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color} bg-opacity-10`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400">{card.title}</p>
                  <p className="text-xl font-bold text-white">{card.value.toLocaleString()}</p>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">User Growth</h3>
              <p className="text-sm text-gray-400">Weekly new user registrations</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                <Calendar size={16} />
              </button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
          <div className="h-64">
            <Line 
              data={userGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#9CA3AF' }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#9CA3AF' }
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { mode: 'index', intersect: false }
                }
              }}
            />
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Activity Distribution</h3>
              <p className="text-sm text-gray-400">Matches, Messages & Likes</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-pink-500/20 text-pink-500 rounded-full text-xs">Today</span>
            </div>
          </div>
          <div className="h-64">
            <Doughnut 
              data={activityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#9CA3AF', padding: 20 }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Gender Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gender Distribution Card */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Gender Distribution</h3>
          <div className="h-48">
            <Bar 
              data={genderDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#9CA3AF' }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#9CA3AF' }
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Platform Stats */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" />
              Platform Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Engagement Rate</span>
                  <span className="text-white font-medium">78%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Response Rate</span>
                  <span className="text-white font-medium">92%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Match Success</span>
                  <span className="text-white font-medium">45%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">5 new users joined</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">3 new matches created</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">2 reports pending</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-green-500" />
            <span className="text-sm text-gray-400">System Status: <span className="text-green-500 font-medium">Operational</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={16} className="text-yellow-500" />
            <span className="text-sm text-gray-400">Last updated: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            <span className="text-sm text-gray-400">Growth: <span className="text-green-500">+12.5%</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;