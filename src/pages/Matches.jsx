// pages/Matches.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { Heart, MessageCircle, Trash2, Sparkles } from "lucide-react";

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/match");
      setMatches(res.data);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnmatch = async (matchId) => {
    if (window.confirm("Are you sure you want to unmatch? This cannot be undone.")) {
      try {
        await API.delete(`/match/unmatch/${matchId}`);
        setMatches(matches.filter(m => m._id !== matchId));
      } catch (err) {
        console.error("Failed to unmatch:", err);
        alert("Failed to unmatch. Please try again.");
      }
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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Your Matches
        </h1>
        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
          {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
        </span>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches yet</h3>
          <p className="text-gray-500 mb-6">Start swiping to find your perfect match!</p>
          <button
            onClick={() => navigate("/discovery")}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 transition shadow-lg shadow-pink-500/30"
          >
            Start Swiping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {matches.map((match) => {
            const otherUser = match.users.find(u => u._id !== user?._id);
            
            return (
              <div 
                key={match._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group"
              >
                <div className="h-32 bg-gradient-to-r from-pink-400 to-purple-500 relative">
                  <div className="absolute -bottom-10 left-4">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-r from-pink-300 to-purple-300 flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-white">
                        {otherUser?.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-12 p-4">
                  <h3 className="font-semibold text-lg">{otherUser?.fullName}</h3>
                  <p className="text-sm text-gray-500 mb-3">{otherUser?.email}</p>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/chat/${match._id}`)}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Message
                    </button>
                    <button
                      onClick={() => handleUnmatch(match._id)}
                      className="px-3 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                      title="Unmatch"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;