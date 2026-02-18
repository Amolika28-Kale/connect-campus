// pages/Discovery.jsx - Test Version with Manual Match
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  X, 
  MapPin, 
  GraduationCap, 
  Info, 
  Sparkles, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Award
} from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Discovery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [campusOnly, setCampusOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [matchModal, setMatchModal] = useState(null);

  useEffect(() => {
    fetchFeed();
  }, [campusOnly]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/feed?campusOnly=${campusOnly}`);
      console.log("Feed data:", res.data);
      setUsers(res.data);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Discovery Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (targetUserId) => {
    try {
      console.log("Liking user:", targetUserId);
      const res = await API.post(`/match/like/${targetUserId}`);
      
      console.log("Like response:", res.data);
      
      // Check if it's a match
      if (res.data.matchId) {
        // Show match modal
        setMatchModal({
          matchId: res.data.matchId,
          userName: currentUser.fullName,
          userImage: currentUser.profileImage
        });
      }
      
      // Move to next profile
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Like error", err);
      if (err.response?.status === 403) {
        alert("Cannot like this user");
      }
    }
  };

  // 🔥 TEST FUNCTION: Manual Match Modal
  const testMatchModal = () => {
    if (currentUser) {
      setMatchModal({
        matchId: "test-match-123",
        userName: currentUser.fullName,
        userImage: currentUser.profileImage
      });
    }
  };

  const handlePass = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRefresh = () => {
    fetchFeed();
  };

  const closeModal = () => {
    console.log("Closing modal");
    setMatchModal(null);
  };

  const calculateAge = (dob) => {
    const diff = new Date() - new Date(dob);
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return age;
  };

  const isSameCampus = (userCollegeId) => {
    return userCollegeId?.toString() === user?.college?.toString();
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading profiles...</p>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="max-w-md mx-auto relative pb-20">
      {/* 🔥 TEST BUTTON - काढून टका नंतर */}
      {currentUser && (
        <button
          onClick={testMatchModal}
          className="fixed top-20 right-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-full text-sm shadow-lg"
        >
          Test Match Modal
        </button>
      )}

      {/* Match Modal */}
      <AnimatePresence>
        {matchModal && (
          <motion.div
            key="match-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
              >
                <X size={24} />
              </button>

              {/* Animated Heart */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Heart size={80} className="mx-auto mb-4 fill-white" />
              </motion.div>

              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-2"
              >
                It's a Match! 💕
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl mb-2"
              >
                You and {matchModal.userName}
              </motion.p>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 mb-6"
              >
                liked each other
              </motion.p>

              {/* User Avatars */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center justify-center gap-4 mb-8"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white shadow-lg">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <Heart size={24} className="text-white animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white shadow-lg">
                  {matchModal.userName?.charAt(0).toUpperCase()}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <button
                  onClick={() => {
                    console.log("Navigating to chat:", matchModal.matchId);
                    navigate(`/chat/${matchModal.matchId}`);
                    closeModal();
                  }}
                  className="w-full bg-white text-pink-600 px-6 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  Send Message
                </button>
                
                <button
                  onClick={closeModal}
                  className="w-full bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  Keep Swiping
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Filter */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Discover
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            title="Refresh"
          >
            <Sparkles size={20} className="text-gray-600" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition ${
              showFilters ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-4 rounded-xl shadow-lg mb-4 border border-gray-100"
          >
            <h3 className="font-semibold mb-3">Filter Profiles</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-gray-600" />
                  Same Campus Only
                </span>
                <button
                  onClick={() => {
                    setCampusOnly(!campusOnly);
                  }}
                  className={`relative w-12 h-6 rounded-full transition ${
                    campusOnly ? 'bg-pink-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                      campusOnly ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </label>
              
              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-2 bg-pink-500 text-white py-2 rounded-lg text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Profiles View */}
      {!currentUser ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <Sparkles size={64} className="text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No More Profiles!</h2>
          <p className="text-gray-500 mb-6">
            {campusOnly 
              ? "No more profiles from your campus. Try showing all colleges!" 
              : "Check back later for new matches ✨"}
          </p>
          <div className="space-y-3">
            {campusOnly && (
              <button
                onClick={() => {
                  setCampusOnly(false);
                  setShowFilters(false);
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition"
              >
                Show All Colleges
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Refresh
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Campus Badge */}
          {isSameCampus(currentUser.college?._id) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3"
            >
              <span className="inline-flex items-center gap-1 bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
                <Award size={14} />
                Same Campus
              </span>
            </motion.div>
          )}

          {/* Profile Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentUser._id}
              initial={{ opacity: 0, scale: 0.9, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Profile Image */}
              <div className="h-96 bg-gradient-to-br from-pink-100 to-purple-100 relative">
                {currentUser.profileImage ? (
                  <img 
                    src={currentUser.profileImage} 
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl text-pink-300 font-bold">
                      {currentUser.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-white text-2xl font-bold">
                    {currentUser.fullName}, {calculateAge(currentUser.dob)}
                  </h2>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <MapPin size={16} />
                    <span>{currentUser.college?.name}</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full">
                  <span className="text-white text-sm">
                    {currentIndex + 1}/{users.length}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {currentUser.bio && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Info size={16} /> About
                    </h3>
                    <p className="text-gray-600">{currentUser.bio}</p>
                  </div>
                )}

                {currentUser.interests?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.interests.map((interest, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-6 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePass}
                    className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition shadow-lg"
                  >
                    <X size={32} className="text-gray-600" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(currentUser._id)}
                    className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:opacity-90 transition shadow-lg shadow-pink-500/30"
                  >
                    <Heart size={32} className="text-white fill-white" />
                  </motion.button>
                </div>

                <p className="text-center text-sm text-gray-400 mt-4">
                  Swipe cards or use buttons
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Discovery;