// pages/admin/Reports.jsx - Enhanced UI & Fully Responsive
import { useEffect, useState } from "react";
import { 
  getReportsAPI,
  takeReportActionAPI 
} from "../services/adminService";
import { 
  AlertCircle, 
  CheckCircle, 
  Search,
  Filter,
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flag,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  Ban,
  UserX,
  UserCheck,
  MessageSquare,
  Download,
  X,
  Check
} from "lucide-react";

function Reports() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedReports, setExpandedReports] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highPriority: 0
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterAndSortReports();
    calculateStats();
  }, [reports, searchTerm, filterStatus, filterType, sortBy, sortOrder]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await getReportsAPI();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortReports = () => {
    let filtered = [...reports];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.reporter?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reporter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reported?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reported?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    // Apply type filter (based on reason keywords)
    if (filterType !== 'all') {
      filtered = filtered.filter(report => {
        const reason = report.reason?.toLowerCase() || '';
        switch(filterType) {
          case 'harassment':
            return reason.includes('harass') || reason.includes('bully');
          case 'spam':
            return reason.includes('spam') || reason.includes('fake');
          case 'inappropriate':
            return reason.includes('inappropriate') || reason.includes('offensive');
          case 'other':
            return !reason.includes('harass') && !reason.includes('spam') && !reason.includes('inappropriate');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'status') {
        const statusOrder = { 'pending': 0, 'resolved': 1 };
        const statusA = statusOrder[a.status] || 2;
        const statusB = statusOrder[b.status] || 2;
        return sortOrder === 'desc' ? statusB - statusA : statusA - statusB;
      } else if (sortBy === 'reporter') {
        const nameA = a.reporter?.fullName || '';
        const nameB = b.reporter?.fullName || '';
        return sortOrder === 'desc' 
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      }
      return 0;
    });

    setFilteredReports(filtered);
  };

  const calculateStats = () => {
    const pending = reports.filter(r => r.status === 'pending').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    
    // High priority based on report age (> 48 hours pending)
    const now = new Date();
    const highPriority = reports.filter(r => {
      if (r.status !== 'pending') return false;
      const reportDate = new Date(r.createdAt);
      const hoursDiff = (now - reportDate) / (1000 * 60 * 60);
      return hoursDiff > 48;
    }).length;

    setStats({
      total: reports.length,
      pending,
      resolved,
      highPriority
    });
  };

  const handleAction = async (reportId, action) => {
    setActionLoading(true);
    try {
      await takeReportActionAPI(reportId, { action });
      await fetchReports();
      setShowActionModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Failed to take action:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityLevel = (report) => {
    if (report.status !== 'pending') return 'resolved';
    
    const reportDate = new Date(report.createdAt);
    const now = new Date();
    const hoursDiff = (now - reportDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) return 'high';
    if (hoursDiff > 24) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-blue-500 to-cyan-500';
      case 'resolved': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high':
        return { bg: 'bg-red-500/20', text: 'text-red-500', label: 'High Priority', icon: AlertTriangle };
      case 'medium':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Medium Priority', icon: AlertCircle };
      case 'low':
        return { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Low Priority', icon: Shield };
      case 'resolved':
        return { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Resolved', icon: CheckCircle };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'Unknown', icon: Shield };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (reportId) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };

  // Action Modal
  const ActionModal = () => {
    if (!selectedReport) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-gray-800 rounded-3xl p-8 max-w-md w-full animate-popIn border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Take Action</h3>
            <button
              onClick={() => setShowActionModal(false)}
              className="p-2 hover:bg-gray-700 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Reported User</p>
              <p className="text-white font-medium">{selectedReport.reported?.fullName}</p>
              <p className="text-sm text-gray-400">{selectedReport.reported?.email}</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Reason</p>
              <p className="text-white">{selectedReport.reason}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleAction(selectedReport._id, "warn")}
              disabled={actionLoading}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2"
            >
              {actionLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (
                <>
                  <AlertCircle size={18} />
                  Warn User
                </>
              )}
            </button>
            
            <button
              onClick={() => handleAction(selectedReport._id, "suspend")}
              disabled={actionLoading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2"
            >
              <UserX size={18} />
              Suspend User (7 days)
            </button>
            
            <button
              onClick={() => handleAction(selectedReport._id, "ban")}
              disabled={actionLoading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2"
            >
              <Ban size={18} />
              Ban User Permanently
            </button>

            <button
              onClick={() => setShowActionModal(false)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Flag size={24} className="text-yellow-500 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-400 animate-pulse">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Action Modal */}
      {showActionModal && <ActionModal />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg shadow-yellow-500/30">
            <Flag size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Reports
            </h1>
            <p className="text-gray-400 mt-1">Manage user reports and take action</p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition flex items-center gap-2 text-white"
        >
          <RefreshCw size={18} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Flag size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Reports</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">High Priority</p>
              <p className="text-2xl font-bold text-red-500">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by reporter, reported user, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 text-white placeholder-gray-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-500 text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-500 text-white"
        >
          <option value="all">All Types</option>
          <option value="harassment">Harassment</option>
          <option value="spam">Spam/Fake</option>
          <option value="inappropriate">Inappropriate</option>
          <option value="other">Other</option>
        </select>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-yellow-500 text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="reporter">Sort by Reporter</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition flex items-center gap-2 text-white"
          >
            {sortOrder === 'desc' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No reports found</p>
            <p className="text-gray-500 text-sm">All reports have been resolved</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const priority = getPriorityLevel(report);
            const priorityBadge = getPriorityBadge(priority);
            const PriorityIcon = priorityBadge.icon;
            const isExpanded = expandedReports[report._id];

            return (
              <div
                key={report._id}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition group overflow-hidden"
              >
                {/* Report Header */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getPriorityColor(priority)} bg-opacity-10`}>
                        <PriorityIcon size={20} className={priorityBadge.text} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-white">Report #{report._id.slice(-6)}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                          }`}>
                            {report.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                            {priorityBadge.label}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(report._id)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {report.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowActionModal(true);
                          }}
                          className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition flex items-center gap-2"
                        >
                          <Shield size={16} />
                          <span className="hidden sm:inline">Take Action</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Report Preview */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <User size={12} />
                        Reporter
                      </p>
                      <p className="text-white font-medium">{report.reporter?.fullName}</p>
                      <p className="text-xs text-gray-400">{report.reporter?.email}</p>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <User size={12} />
                        Reported User
                      </p>
                      <p className="text-white font-medium">{report.reported?.fullName}</p>
                      <p className="text-xs text-gray-400">{report.reported?.email}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">Reason</p>
                    <div className="bg-gray-900 rounded-lg p-3 text-gray-300">
                      {report.reason}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-700 p-5 bg-gray-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Reporter Details */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <User size={14} />
                          Reporter Details
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-white">
                            <span className="text-gray-400">User ID:</span> {report.reporter?._id}
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Name:</span> {report.reporter?.fullName}
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Email:</span> {report.reporter?.email}
                          </p>
                        </div>
                      </div>

                      {/* Reported User Details */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <User size={14} />
                          Reported User Details
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-white">
                            <span className="text-gray-400">User ID:</span> {report.reported?._id}
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Name:</span> {report.reported?.fullName}
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Email:</span> {report.reported?.email}
                          </p>
                          {report.reported?.warningCount > 0 && (
                            <p className="text-sm text-yellow-500">
                              ⚠️ Warning count: {report.reported.warningCount}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Report Metadata */}
                      <div className="space-y-3 md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <Clock size={14} />
                          Report Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Report ID</p>
                            <p className="text-sm text-white font-mono">{report._id}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Created At</p>
                            <p className="text-sm text-white">{new Date(report.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Last Updated</p>
                            <p className="text-sm text-white">{new Date(report.updatedAt).toLocaleString()}</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Priority Level</p>
                            <p className={`text-sm font-medium ${priorityBadge.text}`}>{priorityBadge.label}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Pending Reports */}
                    {report.status === 'pending' && (
                      <div className="flex gap-2 mt-4 justify-end">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowActionModal(true);
                          }}
                          className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition flex items-center gap-2"
                        >
                          <Shield size={16} />
                          Take Action
                        </button>
                      </div>
                    )}

                    {report.status === 'resolved' && (
                      <div className="flex gap-2 mt-4 justify-end">
                        <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-lg flex items-center gap-2">
                          <CheckCircle size={16} />
                          Resolved
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      {filteredReports.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
          <p>
            Showing <span className="text-white font-medium">{filteredReports.length}</span> of{' '}
            <span className="text-white font-medium">{reports.length}</span> reports
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Pending: {stats.pending}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Resolved: {stats.resolved}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              High Priority: {stats.highPriority}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;