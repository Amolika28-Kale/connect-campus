// pages/Messages.jsx - With Unread Count & Status Indicators
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
  Circle
} from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState({});
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
          
          // Count unread messages (messages not sent by current user and not seen)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Messages
        </h1>
        {matches.length > 0 && (
          <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
            {matches.length} {matches.length === 1 ? 'Chat' : 'Chats'}
          </span>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No conversations yet</h3>
          <p className="text-gray-500 mb-6">Match with someone to start chatting!</p>
          <button
            onClick={() => navigate("/discovery")}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 transition shadow-lg shadow-pink-500/30"
          >
            Find Matches
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm divide-y overflow-hidden">
          {matches.map((match) => {
            const details = matchDetails[match._id];
            const otherUser = details?.otherUser;
            const lastMsg = details?.lastMsg;
            const unreadCount = details?.unreadCount || 0;
            const lastMsgStatus = details?.lastMsgStatus;
            
            if (!otherUser) return null;
            
            return (
              <div
                key={match._id}
                onClick={() => navigate(`/chat/${match._id}`)}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition cursor-pointer group relative"
              >
                {/* Unread Count Badge - ग्रीन डॉट किंवा number */}
                {unreadCount > 0 && (
                  <div className="absolute left-12 top-4 z-10">
                    {unreadCount === 1 ? (
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                    ) : (
                      <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                )}

                {/* Avatar with Online Status */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {otherUser?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  {/* Online Status Dot */}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-800'}`}>
                      {otherUser?.fullName}
                    </h3>
                    {lastMsg && (
                      <span className="text-xs text-gray-400 flex items-center gap-1 ml-2 whitespace-nowrap">
                        <Clock size={12} />
                        {formatTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate flex-1 ${
                      unreadCount > 0 
                        ? 'text-gray-900 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {lastMsg ? (
                        <span className="flex items-center gap-1">
                          {/* Message Status Icon */}
                          {lastMsg.sender === user?._id && (
                            <span className="mr-1">
                              {getMessageStatusIcon(lastMsgStatus)}
                            </span>
                          )}
                          {/* Message Preview */}
                          <span className="truncate">
                            {lastMsg.sender === user?._id ? 'You: ' : ''}
                            {lastMsg.content}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400">Start a conversation</span>
                      )}
                    </p>
                    
                    {/* Unread Count on Mobile */}
                    {unreadCount > 0 && (
                      <span className="md:hidden bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow Icon */}
                <ChevronRight 
                  size={20} 
                  className="text-gray-400 group-hover:text-pink-500 transition transform group-hover:translate-x-1 flex-shrink-0" 
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Legend / Status Guide (Optional) */}
      <div className="mt-4 flex items-center justify-end gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Check size={12} className="text-gray-400" />
          <span>Sent</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCheck size={12} className="text-blue-500" />
          <span>Seen</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Unread</span>
        </div>
      </div>
    </div>
  );
};

export default Messages;