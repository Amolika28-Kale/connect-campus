// pages/Messages.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { MessageCircle, ChevronRight, Clock } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/match");
      setMatches(res.data);
      
      // Fetch last message for each match
      res.data.forEach(async (match) => {
        try {
          const msgRes = await API.get(`/chat/${match._id}`);
          if (msgRes.data.length > 0) {
            const lastMsg = msgRes.data[msgRes.data.length - 1];
            setLastMessages(prev => ({
              ...prev,
              [match._id]: lastMsg
            }));
          }
        } catch (err) {
          console.error(`Failed to fetch messages for match ${match._id}:`, err);
        }
      });
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    
    if (msgDate.toDateString() === today.toDateString()) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const diffDays = Math.floor((today - msgDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return msgDate.toLocaleDateString([], { weekday: 'short' });
    return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
        Messages
      </h1>

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
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {matches.map((match) => {
            const otherUser = match.users.find(u => u._id !== user?._id);
            const lastMsg = lastMessages[match._id];
            
            return (
              <div
                key={match._id}
                onClick={() => navigate(`/chat/${match._id}`)}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition cursor-pointer group"
              >
                {/* Avatar */}
                <div className="w-14 h-14 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                  {otherUser?.fullName?.charAt(0).toUpperCase()}
                </div>

                {/* Message Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {otherUser?.fullName}
                    </h3>
                    {lastMsg && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {lastMsg ? (
                      <>
                        {lastMsg.sender === user?._id ? 'You: ' : ''}
                        {lastMsg.content}
                      </>
                    ) : (
                      <span className="text-gray-400">Start a conversation</span>
                    )}
                  </p>
                </div>

                {/* Arrow Icon */}
                <ChevronRight 
                  size={20} 
                  className="text-gray-400 group-hover:text-pink-500 transition transform group-hover:translate-x-1" 
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;