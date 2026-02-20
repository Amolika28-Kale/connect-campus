// pages/Messages.jsx - Enhanced with Profile Photos
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { 
  MessageCircle, 
  ChevronRight, 
  Clock, 
  Check, 
  CheckCheck,
  Circle,
  Search,
  Filter,
  MoreVertical,
  Heart,
  Star,
  Users,
  Sparkles,
  X,
  Camera
} from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/match");
      const matchesData = res.data;
      setMatches(matchesData);
      
      // Fetch details for each match
      const details = {};
      for (const match of matchesData) {
        try {
          // Get messages
          const msgRes = await API.get(`/chat/${match._id}`);
          const messages = msgRes.data;
          
          // Get other user details
          const otherUser = match.users.find(u => u._id !== user?._id);
          
          // Count unread messages
          const unreadCount = messages.filter(
            msg => msg.sender !== user?._id && !msg.seen
          ).length;
          
          // Get last message
          const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
          
          // Get last message status
          let lastMsgStatus = 'none';
          if (lastMsg) {
            if (lastMsg.sender === user?._id) {
              lastMsgStatus = lastMsg.seen ? 'seen' : 'sent';
            }
          }
          
          details[match._id] = {
            otherUser,
            messages,
            lastMsg,
            unreadCount,
            lastMsgStatus,
            totalMessages: messages.length
          };
          
        } catch (err) {
          console.error(`Failed to fetch messages for match ${match._id}:`, err);
        }
      }
      
      setMatchDetails(details);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter matches based on search and unread filter
  const filteredMatches = matches.filter(match => {
    const details = matchDetails[match._id];
    const otherUser = details?.otherUser;
    
    if (!otherUser) return false;
    
    const matchesSearch = otherUser.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnread = filterUnread ? (details?.unreadCount || 0) > 0 : true;
    
    return matchesSearch && matchesUnread;
  });

  const formatTime = (date) => {
    if (!date) return '';
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Today
    if (msgDate.toDateString() === today.toDateString()) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Yesterday
    if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Within a week
    const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return msgDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Older
    return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getMessageStatusIcon = (status) => {
    switch(status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'seen':
        return <CheckCheck size={14} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  // Get profile image URL with HTTPS support
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL
    if (imagePath.startsWith('http')) {
      // Ensure HTTPS in production
      if (window.location.protocol === 'https:' && imagePath.startsWith('http://')) {
        return imagePath.replace('http://', 'https://');
      }
      return imagePath;
    }
    
    // Base URL for production
    const baseUrl = 'https://campus-backend-3axn.onrender.com';
    
    // Handle different path formats
    if (imagePath.includes('uploads/')) {
      const cleanPath = imagePath.replace(/\\/g, '/');
      const filename = cleanPath.split('uploads/').pop();
      return `${baseUrl}/uploads/${filename}`;
    }
    
    return `${baseUrl}/uploads/profiles/${imagePath}`;
  };

  const getRandomGradient = (seed) => {
    const gradients = [
      'from-pink-400 to-purple-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-red-400 to-pink-500',
      'from-indigo-400 to-purple-500',
    ];
    const index = (seed?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  // Handle image error
  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-500 animate-pulse">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 md:pb-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl shadow-lg shadow-pink-500/30">
            <MessageCircle size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Messages
            </h1>
            <p className="text-sm text-gray-500">Connect with your matches</p>
          </div>
        </div>
        
        {matches.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Search Toggle Button - Mobile */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="sm:hidden p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              <Search size={20} className="text-gray-600" />
            </button>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full transition ${
                filterUnread || showFilters 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter size={20} />
            </button>
            
            {/* Total Chats Badge */}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
              {matches.length} {matches.length === 1 ? 'Chat' : 'Chats'}
            </span>
          </div>
        )}
      </div>

      {/* Search Bar - Desktop & Mobile */}
      {(showSearch || !searchTerm) && (
        <div className={`mb-4 transition-all duration-300 ${showSearch ? 'block' : 'hidden sm:block'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100 animate-slideDown">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Filter Conversations</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full ${filterUnread ? 'bg-pink-500' : 'bg-gray-300'}`}>
                  {filterUnread && <Check size={14} className="text-white m-0.5" />}
                </div>
                <span className="font-medium">Unread only</span>
              </div>
              <span className="text-sm text-gray-500">
                {Object.values(matchDetails).filter(d => d?.unreadCount > 0).length} chats
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Empty State */}
      {matches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={48} className="text-pink-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">No conversations yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Match with someone special to start chatting and make new connections!
          </p>
          <button
            onClick={() => navigate("/discovery")}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 inline-flex items-center gap-2"
          >
            <Sparkles size={18} />
            Find Matches
          </button>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match) => {
            const details = matchDetails[match._id];
            const otherUser = details?.otherUser;
            const lastMsg = details?.lastMsg;
            const unreadCount = details?.unreadCount || 0;
            const lastMsgStatus = details?.lastMsgStatus;
            const profileImageUrl = getProfileImageUrl(otherUser?.profileImage);
            const hasImageError = imageErrors[otherUser?._id];
            
            if (!otherUser) return null;
            
            return (
              <div
                key={match._id}
                onClick={() => navigate(`/chat/${match._id}`)}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-pink-200"
              >
                {/* Unread Indicator Line */}
                {unreadCount > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500"></div>
                )}
                
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar with Profile Photo */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md transform group-hover:scale-105 transition-transform duration-300">
                      {profileImageUrl && !hasImageError ? (
                        <img 
                          src={profileImageUrl} 
                          alt={otherUser?.fullName}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(otherUser?._id)}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${getRandomGradient(otherUser?._id)} flex items-center justify-center text-white font-bold text-2xl`}>
                          {getInitials(otherUser?.fullName)}
                        </div>
                      )}
                    </div>
                    
                    {/* Online Status */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    
                    {/* Unread Badge - Mobile */}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 md:hidden">
                        {unreadCount === 1 ? (
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
                        ) : (
                          <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-pulse border-2 border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className={`text-base truncate ${
                        unreadCount > 0 
                          ? 'font-bold text-gray-900' 
                          : 'font-semibold text-gray-700'
                      }`}>
                        {otherUser?.fullName}
                      </h3>
                      {lastMsg && (
                        <span className="text-xs text-gray-400 flex items-center gap-1 ml-2 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-full">
                          <Clock size={10} />
                          {formatTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Message Preview with Status */}
                      <div className={`flex-1 flex items-center gap-1.5 text-sm truncate ${
                        unreadCount > 0 
                          ? 'text-gray-900 font-medium' 
                          : 'text-gray-500'
                      }`}>
                        {lastMsg ? (
                          <>
                            {lastMsg.sender === user?._id && (
                              <span className="flex-shrink-0">
                                {getMessageStatusIcon(lastMsgStatus)}
                              </span>
                            )}
                            <span className="truncate">
                              {lastMsg.sender === user?._id ? 'You: ' : ''}
                              {lastMsg.content}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Start a conversation</span>
                        )}
                      </div>
                      
                      {/* Unread Badge - Desktop */}
                      {unreadCount > 0 && (
                        <div className="hidden md:block">
                          {unreadCount === 1 ? (
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                          ) : (
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center animate-pulse">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Stats (for mobile) */}
                    <div className="flex items-center gap-3 mt-2 md:hidden">
                      {unreadCount > 0 && (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <Circle size={8} className="fill-green-500" />
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow Icon - Desktop */}
                  <ChevronRight 
                    size={20} 
                    className="hidden md:block text-gray-300 group-hover:text-pink-500 transition-all transform group-hover:translate-x-1 flex-shrink-0" 
                  />
                </div>

                {/* Hover Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions - Mobile */}
      <div className="md:hidden fixed bottom-20 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={() => navigate("/discovery")}
          className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-pink-500/50 hover:scale-110 transition-transform duration-300"
        >
          <Sparkles size={20} />
        </button>
      </div>
    </div>
  );
};

export default Messages;