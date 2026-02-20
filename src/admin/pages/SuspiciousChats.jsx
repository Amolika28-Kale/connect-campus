// pages/admin/SuspiciousChats.jsx - Enhanced UI & Fully Responsive
import { useEffect, useState } from "react";
import { getSuspiciousChatsAPI } from "../services/adminService";
import { 
  AlertTriangle, 
  Search,
  Filter,
  Eye,
  Shield,
  Clock,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  MoreVertical,
  Sparkles,
  Ban,
  ShieldAlert
} from "lucide-react";

function SuspiciousChats() {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedChat, setSelectedChat] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedChats, setExpandedChats] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  });

  const suspiciousKeywords = [
    "abuse", "money", "scam", "fake", "nude", "upi", "paytm",
    "sex", "drugs", "violence", "hate", "threat", "kill",
    "fraud", "cheat", "illegal", "weapon", "attack"
  ];

  useEffect(() => {
    fetchSuspiciousChats();
  }, []);

  useEffect(() => {
    filterAndSortChats();
    calculateStats();
  }, [chats, searchTerm, filterSeverity, sortBy, sortOrder]);

  const fetchSuspiciousChats = async () => {
    try {
      setLoading(true);
      const { data } = await getSuspiciousChatsAPI();
      setChats(data);
      setFilteredChats(data);
    } catch (error) {
      console.error("Failed to fetch suspicious chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortChats = () => {
    let filtered = [...chats];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(chat => 
        chat.sender?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.sender?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(chat => {
        const severity = getMessageSeverity(chat.content);
        return severity === filterSeverity;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'severity') {
        const severityA = getSeverityScore(a.content);
        const severityB = getSeverityScore(b.content);
        return sortOrder === 'desc' ? severityB - severityA : severityA - severityB;
      } else if (sortBy === 'sender') {
        const nameA = a.sender?.fullName || '';
        const nameB = b.sender?.fullName || '';
        return sortOrder === 'desc' 
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      }
      return 0;
    });

    setFilteredChats(filtered);
  };

  const calculateStats = () => {
    const high = chats.filter(c => getMessageSeverity(c.content) === 'high').length;
    const medium = chats.filter(c => getMessageSeverity(c.content) === 'medium').length;
    const low = chats.filter(c => getMessageSeverity(c.content) === 'low').length;
    
    setStats({
      total: chats.length,
      highRisk: high,
      mediumRisk: medium,
      lowRisk: low
    });
  };

  const getMessageSeverity = (content) => {
    const words = content.toLowerCase().split(' ');
    const matchedKeywords = suspiciousKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    ).length;
    
    if (matchedKeywords >= 3) return 'high';
    if (matchedKeywords >= 1) return 'medium';
    return 'low';
  };

  const getSeverityScore = (content) => {
    const words = content.toLowerCase().split(' ');
    return suspiciousKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    ).length;
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'high':
        return { bg: 'bg-red-500/20', text: 'text-red-500', label: 'High Risk', icon: AlertTriangle };
      case 'medium':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Medium Risk', icon: AlertCircle };
      case 'low':
        return { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Low Risk', icon: Shield };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'Unknown', icon: Shield };
    }
  };

  const highlightSuspiciousWords = (content) => {
    const words = content.split(' ');
    return words.map((word, i) => {
      const isSuspicious = suspiciousKeywords.some(keyword => 
        word.toLowerCase().includes(keyword)
      );
      return isSuspicious 
        ? `<span key={i} class="bg-red-500/20 text-red-500 px-1 rounded font-bold">${word}</span>`
        : word;
    }).join(' ');
  };

  const toggleExpand = (chatId) => {
    setExpandedChats(prev => ({
      ...prev,
      [chatId]: !prev[chatId]
    }));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldAlert size={24} className="text-red-500 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-400 animate-pulse">Scanning for suspicious activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl shadow-lg shadow-red-500/30">
            <ShieldAlert size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Suspicious Chats
            </h1>
            <p className="text-gray-400 mt-1">Monitor and flag inappropriate conversations</p>
          </div>
        </div>

        <button
          onClick={fetchSuspiciousChats}
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
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Suspicious</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">High Risk</p>
              <p className="text-2xl font-bold text-red-500">{stats.highRisk}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertCircle size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.mediumRisk}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Low Risk</p>
              <p className="text-2xl font-bold text-blue-500">{stats.lowRisk}</p>
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
            placeholder="Search by name, email or message content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder-gray-500"
          />
        </div>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-red-500 text-white"
        >
          <option value="all">All Severities</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-red-500 text-white"
          >
            <option value="date">Sort by Date</option>
            <option value="severity">Sort by Severity</option>
            <option value="sender">Sort by Sender</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition flex items-center gap-2 text-white"
          >
            {sortOrder === 'desc' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* Suspicious Chats List */}
      <div className="space-y-4">
        {filteredChats.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No suspicious chats found</p>
            <p className="text-gray-500 text-sm">All conversations appear to be clean</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const severity = getMessageSeverity(chat.content);
            const severityBadge = getSeverityBadge(severity);
            const SeverityIcon = severityBadge.icon;
            const matchedKeywords = getSeverityScore(chat.content);
            const isExpanded = expandedChats[chat._id];

            return (
              <div
                key={chat._id}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-red-500/50 transition group overflow-hidden"
              >
                {/* Chat Header */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getSeverityColor(severity)} bg-opacity-10`}>
                        <SeverityIcon size={20} className={severityBadge.text} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-white text-lg">{chat.sender?.fullName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityBadge.bg} ${severityBadge.text}`}>
                            {severityBadge.label}
                          </span>
                          {matchedKeywords > 0 && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                              {matchedKeywords} keyword{matchedKeywords > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {chat.sender?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(chat.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(chat._id)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                        <Eye size={16} />
                      </button>
                      
                      <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition">
                        <Ban size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="mt-3">
                    <div 
                      className={`bg-gray-900 rounded-lg p-3 text-gray-300 ${
                        isExpanded ? '' : 'line-clamp-2'
                      }`}
                      dangerouslySetInnerHTML={{ 
                        __html: isExpanded ? chat.content : highlightSuspiciousWords(chat.content)
                      }}
                    />
                  </div>

                  {/* Suspicious Keywords */}
                  {matchedKeywords > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suspiciousKeywords
                        .filter(keyword => chat.content.toLowerCase().includes(keyword))
                        .map((keyword, i) => (
                          <span key={i} className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                            {keyword}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-700 p-5 bg-gray-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sender Details */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <User size={14} />
                          Sender Details
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-white">
                            <span className="text-gray-400">User ID:</span> {chat.sender?._id}
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Name:</span> {chat.sender?.fullName}
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Email:</span> {chat.sender?.email}
                          </p>
                        </div>
                      </div>

                      {/* Message Details */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <MessageSquare size={14} />
                          Message Details
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Message ID:</span> {chat._id}
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Sent at:</span> {new Date(chat.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm text-white">
                            <span className="text-gray-400">Severity Score:</span> 
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${severityBadge.bg} ${severityBadge.text}`}>
                              {severityBadge.label} ({matchedKeywords} keywords)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 justify-end">
                      <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition flex items-center gap-2">
                        <Flag size={16} />
                        Warn User
                      </button>
                      <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition flex items-center gap-2">
                        <Ban size={16} />
                        Suspend User
                      </button>
                      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                        Mark as Reviewed
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      {filteredChats.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
          <p>
            Showing <span className="text-white font-medium">{filteredChats.length}</span> of{' '}
            <span className="text-white font-medium">{chats.length}</span> suspicious chats
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              High: {stats.highRisk}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Medium: {stats.mediumRisk}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Low: {stats.lowRisk}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuspiciousChats;