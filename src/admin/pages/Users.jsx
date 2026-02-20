// admin/pages/Users.jsx - Enhanced UI with Complete User Details
import { useEffect, useState } from "react";
import {
  getUsersAPI,
  approveUserAPI,
  rejectUserAPI,
  banUserAPI,
} from "../services/adminService";
import { 
  Users as UsersIcon,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  CreditCard,
  User,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Trash2,
  Lock,
  Unlock,
  RefreshCw
} from "lucide-react";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCollegeId, setShowCollegeId] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getUsersAPI();
      setUsers(data.users);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await approveUserAPI(id);
    fetchUsers();
  };

  const handleReject = async (id) => {
    await rejectUserAPI(id);
    fetchUsers();
  };

  const handleBan = async (id) => {
    await banUserAPI(id);
    fetchUsers();
  };

  const toggleRowExpand = (userId) => {
    setExpandedRows(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const diff = new Date() - new Date(dob);
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return age;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'banned': return 'bg-red-500';
      case 'rejected': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle size={14} className="text-green-500" />;
      case 'pending': return <Clock size={14} className="text-yellow-500" />;
      case 'banned': return <Lock size={14} className="text-red-500" />;
      case 'rejected': return <XCircle size={14} className="text-gray-500" />;
      default: return <AlertCircle size={14} className="text-gray-500" />;
    }
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg shadow-pink-500/30">
            <UsersIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Users
            </h1>
            <p className="text-sm text-gray-400">Manage all registered users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3">
          <div className="bg-gray-800 px-4 py-2 rounded-xl">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-xl">
            <p className="text-xs text-gray-400">Active</p>
            <p className="text-xl font-bold text-green-500">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-xl">
            <p className="text-xs text-gray-400">Pending</p>
            <p className="text-xl font-bold text-yellow-500">
              {users.filter(u => u.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 text-white placeholder-gray-500"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-pink-500 text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="banned">Banned</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          onClick={fetchUsers}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition flex items-center gap-2 text-white"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-400">User</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Contact</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">College</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Age/Gender</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Joined</th>
                <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <>
                  <tr key={user._id} className="hover:bg-gray-700/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.fullName}</p>
                          <p className="text-xs text-gray-400">ID: {user._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm text-white flex items-center gap-1">
                          <Mail size={12} className="text-gray-400" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-white flex items-center gap-1">
                            <Phone size={12} className="text-gray-400" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-white">{user.college?.name || 'N/A'}</p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm text-white">{calculateAge(user.dob)} years</p>
                        <p className="text-xs text-gray-400 capitalize">{user.gender}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)} bg-opacity-20 text-${user.status === 'active' ? 'green' : user.status === 'pending' ? 'yellow' : 'red'}-500`}>
                        {getStatusIcon(user.status)}
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-white">{formatDate(user.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRowExpand(user._id)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                          title="View Details"
                        >
                          {expandedRows[user._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {user.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(user._id)}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(user._id)}
                              className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        {user.status === "active" && (
                          <button
                            onClick={() => handleBan(user._id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                            title="Ban User"
                          >
                            <Lock size={16} />
                          </button>
                        )}

                        {user.status === "banned" && (
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                            title="Unban User"
                          >
                            <Unlock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row - Complete User Details */}
                  {expandedRows[user._id] && (
                    <tr className="bg-gray-900/50">
                      <td colSpan="7" className="p-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <User size={18} className="text-pink-500" />
                            Complete Details - {user.fullName}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Personal Info */}
                            <div className="bg-gray-800 p-4 rounded-xl">
                              <h4 className="text-sm font-medium text-gray-400 mb-3">Personal Information</h4>
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Full Name:</span> {user.fullName}
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Email:</span> {user.email}
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Phone:</span> {user.phone || 'N/A'}
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Gender:</span> {user.gender}
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Date of Birth:</span> {formatDate(user.dob)}
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Age:</span> {calculateAge(user.dob)} years
                                </p>
                              </div>
                            </div>

                            {/* College & Verification */}
                            <div className="bg-gray-800 p-4 rounded-xl">
                              <h4 className="text-sm font-medium text-gray-400 mb-3">College & Verification</h4>
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">College:</span> {user.college?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Status:</span> 
                                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(user.status)} bg-opacity-20`}>
                                    {user.status}
                                  </span>
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Warning Count:</span> {user.warningCount || 0}
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Last Active:</span> {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                                </p>
                                <p className="text-sm text-white">
                                  <span className="text-gray-400">Member Since:</span> {formatDate(user.createdAt)}
                                </p>
                              </div>

                              {/* College ID Button */}
                              {user.collegeIdImage && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowCollegeId(!showCollegeId);
                                  }}
                                  className="mt-3 w-full flex items-center justify-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm text-white"
                                >
                                  <CreditCard size={16} />
                                  {showCollegeId && selectedUser?._id === user._id ? 'Hide' : 'View'} College ID
                                </button>
                              )}

                              {/* College ID Preview */}
                              {showCollegeId && selectedUser?._id === user._id && user.collegeIdImage && (
                                <div className="mt-3 relative">
                                  <img 
                                    src={user.collegeIdImage.startsWith('http') ? user.collegeIdImage : `https://campus-backend-3axn.onrender.com/${user.collegeIdImage}`}
                                    alt="College ID"
                                    className="w-full rounded-lg border-2 border-gray-600"
                                  />
                                  <a
                                    href={user.collegeIdImage.startsWith('http') ? user.collegeIdImage : `https://campus-backend-3axn.onrender.com/${user.collegeIdImage}`}
                                    download
                                    className="absolute top-2 right-2 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
                                  >
                                    <Download size={16} />
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Interests & Bio */}
                            <div className="bg-gray-800 p-4 rounded-xl">
                              <h4 className="text-sm font-medium text-gray-400 mb-3">Interests & Bio</h4>
                              {user.bio && (
                                <div className="mb-3">
                                  <p className="text-xs text-gray-400 mb-1">Bio:</p>
                                  <p className="text-sm text-white">{user.bio}</p>
                                </div>
                              )}
                              {user.interests?.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-400 mb-2">Interests:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {user.interests.map((interest, i) => (
                                      <span key={i} className="px-2 py-1 bg-pink-500/20 text-pink-500 rounded-full text-xs">
                                        {interest}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 justify-end">
                            {user.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(user._id)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition flex items-center gap-2"
                                >
                                  <CheckCircle size={16} />
                                  Approve User
                                </button>
                                <button
                                  onClick={() => handleReject(user._id)}
                                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-sm font-medium transition flex items-center gap-2"
                                >
                                  <XCircle size={16} />
                                  Reject User
                                </button>
                              </>
                            )}
                            {user.status === "active" && (
                              <button
                                onClick={() => handleBan(user._id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition flex items-center gap-2"
                              >
                                <Lock size={16} />
                                Ban User
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-500">
            {users.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-500">
            {users.filter(u => u.status === 'pending').length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Banned Users</p>
          <p className="text-2xl font-bold text-red-500">
            {users.filter(u => u.status === 'banned').length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Users;