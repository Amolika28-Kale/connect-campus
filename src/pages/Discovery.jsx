// pages/Discovery.jsx - Fully Mobile Responsive with Toast Messages
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
  Award,
  RefreshCw,
  Sliders,
  User,
  Calendar,
  BookOpen,
  Camera,
  Star,
  Zap,
  Coffee,
  Music,
  Palette,
  Dumbbell,
  Plane,
  Film,
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  AlertTriangle
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
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [ageRange, setAgeRange] = useState([18, 30]);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [toast, setToast] = useState(null);

  // Show toast message
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  };

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handlePass();
    } else if (isRightSwipe) {
      if (currentUser) {
        handleLike(currentUser._id);
      }
    }
  };

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
      showToast("Failed to load profiles", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (targetUserId) => {
    try {
      setSwipeDirection('right');
      console.log("Liking user:", targetUserId);
      const res = await API.post(`/match/like/${targetUserId}`);
      
      console.log("Like response:", res.data);
      
      if (res.data.matchId) {
        setMatchModal({
          matchId: res.data.matchId,
          userName: currentUser.fullName,
          userImage: currentUser.profileImage,
          userAge: calculateAge(currentUser.dob),
          userCollege: currentUser.college?.name,
          userBio: currentUser.bio
        });
        setShowMatchAnimation(true);
        setTimeout(() => setShowMatchAnimation(false), 1500);
      }
      
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
      }, 300);
    } catch (err) {
      console.error("Like error", err);
      if (err.response?.status === 403) {
        showToast("Cannot like this user", "warning");
      } else {
        showToast("Failed to like user", "error");
      }
      setSwipeDirection(null);
    }
  };

  const handlePass = () => {
    setSwipeDirection('left');
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };

  const handleRefresh = () => {
    fetchFeed();
    showToast("Refreshing profiles...", "info");
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

  const getInterestIcon = (interest) => {
    const icons = {
      'Music': <Music size={isMobile ? 10 : 14} />,
      'Travel': <Plane size={isMobile ? 10 : 14} />,
      'Sports': <Dumbbell size={isMobile ? 10 : 14} />,
      'Reading': <BookOpen size={isMobile ? 10 : 14} />,
      'Cooking': <Coffee size={isMobile ? 10 : 14} />,
      'Movies': <Film size={isMobile ? 10 : 14} />,
      'Gaming': <Zap size={isMobile ? 10 : 14} />,
      'Photography': <Camera size={isMobile ? 10 : 14} />,
      'Art': <Palette size={isMobile ? 10 : 14} />,
      'Fitness': <Dumbbell size={isMobile ? 10 : 14} />,
    };
    return icons[interest] || <Star size={isMobile ? 10 : 14} />;
  };

  // Toast Component
  const ToastMessage = () => {
    if (!toast) return null;
    
    const icons = {
      success: <CheckCircle className="text-green-500" size={20} />,
      error: <AlertCircle className="text-red-500" size={20} />,
      warning: <AlertTriangle className="text-yellow-500" size={20} />,
      info: <Info className="text-blue-500" size={20} />
    };

    const colors = {
      success: "border-green-500 bg-green-50",
      error: "border-red-500 bg-red-50",
      warning: "border-yellow-500 bg-yellow-50",
      info: "border-blue-500 bg-blue-50"
    };

    return (
      <AnimatePresence>
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-3 rounded-lg border-l-4 shadow-lg ${colors[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="text-sm font-medium text-gray-800">{toast.message}</p>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="text-center px-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6"
          >
            <Heart size={isMobile ? 40 : 48} className="text-pink-500 fill-pink-500" />
          </motion.div>
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm md:text-base text-gray-600 font-medium"
          >
            Finding your perfect match...
          </motion.p>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pb-16 md:pb-0">
      {/* Toast Message */}
      <ToastMessage />

      {/* Match Animation Overlay */}
      <AnimatePresence>
        {showMatchAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-6 md:p-8 shadow-2xl"
            >
              <Heart size={isMobile ? 60 : 80} className="text-white fill-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Modal */}
      <AnimatePresence>
        {matchModal && (
          <motion.div
            key="match-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Confetti Effect */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(isMobile ? 10 : 20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * 300 - 150, 
                      y: Math.random() * 300 - 150,
                      rotate: Math.random() * 360
                    }}
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                    className="absolute"
                  >
                    <Star size={isMobile ? 12 : 20} className="text-white" />
                  </motion.div>
                ))}
              </div>
              
              {/* Close button */}
              <button 
                onClick={closeModal}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-white/80 hover:text-white transition-colors z-10 bg-black/20 rounded-full p-1 backdrop-blur-sm"
              >
                <X size={isMobile ? 16 : 20} />
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
                className="mb-3 md:mb-4"
              >
                <Heart size={isMobile ? 60 : 80} className="mx-auto text-white fill-white" />
              </motion.div>

              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-4xl font-bold mb-1 md:mb-2"
              >
                It's a Match! 💕
              </motion.h2>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base md:text-xl mb-1"
              >
                You and {matchModal.userName}
              </motion.p>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs md:text-sm text-white/80 mb-4 md:mb-8"
              >
                liked each other
              </motion.p>

              {/* User Avatars */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="flex items-center justify-center gap-2 md:gap-4 mb-4 md:mb-8"
              >
                <div className="relative">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl md:text-4xl font-bold border-2 md:border-3 border-white shadow-xl">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <Heart size={isMobile ? 20 : 32} className="text-white animate-pulse" />
                <div className="relative">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl md:text-4xl font-bold border-2 md:border-3 border-white shadow-xl">
                    {matchModal.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </motion.div>

              {/* Match Details */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 mb-4 md:mb-6"
              >
                <p className="text-xs md:text-sm text-white/90">
                  You both share interests in: 
                  <span className="font-semibold"> Music, Travel, Photography</span>
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-2 md:space-y-3"
              >
                <button
                  onClick={() => {
                    console.log("Navigating to chat:", matchModal.matchId);
                    navigate(`/chat/${matchModal.matchId}`);
                    closeModal();
                  }}
                  className="w-full bg-white text-pink-600 px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-pink-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-lg shadow-xl"
                >
                  <MessageCircle size={isMobile ? 16 : 20} />
                  Send Message
                </button>
                
                <button
                  onClick={closeModal}
                  className="w-full bg-transparent border-2 border-white text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold hover:bg-white/10 transition-all text-sm md:text-base"
                >
                  Keep Swiping
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-3 md:px-4 py-4 md:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/30">
              <Sparkles size={isMobile ? 20 : 24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Discover
              </h1>
              <p className="text-[10px] md:text-xs text-gray-500">Find your perfect match</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-1.5 md:p-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
              title="Refresh"
            >
              <RefreshCw size={isMobile ? 16 : 18} className="text-gray-600" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 md:p-2 rounded-xl transition-all ${
                showFilters 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30' 
                  : 'bg-white text-gray-600 shadow-md hover:shadow-lg border border-gray-100'
              }`}
            >
              <Sliders size={isMobile ? 16 : 18} />
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-4 md:p-5 rounded-2xl shadow-xl mb-4 md:mb-6 border border-gray-100"
            >
              <h3 className="font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <Filter size={isMobile ? 14 : 16} className="text-pink-500" />
                Filter Profiles
              </h3>
              
              <div className="space-y-3 md:space-y-4">
                {/* Campus Filter */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs md:text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <GraduationCap size={isMobile ? 14 : 16} className="text-pink-500" />
                      Same Campus Only
                    </span>
                    <button
                      onClick={() => setCampusOnly(!campusOnly)}
                      className={`relative w-10 md:w-12 h-5 md:h-6 rounded-full transition-colors ${
                        campusOnly ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <motion.span
                        layout
                        className={`absolute top-1 w-3 md:w-4 h-3 md:h-4 bg-white rounded-full shadow-md ${
                          campusOnly ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Age Range Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                    <Calendar size={isMobile ? 14 : 16} className="text-pink-500" />
                    Age Range: {ageRange[0]} - {ageRange[1]}
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={ageRange[0]}
                    onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                    className="w-full h-1 md:h-2 accent-pink-500"
                  />
                  <input
                    type="range"
                    min="18"
                    max="50"
                    value={ageRange[1]}
                    onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                    className="w-full h-1 md:h-2 accent-pink-500"
                  />
                </div>

                {/* Apply Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowFilters(false);
                    showToast("Filters applied", "success");
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium shadow-lg shadow-pink-500/30"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Profiles View */}
        {!currentUser ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 text-center border border-gray-100"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6"
            >
              <Sparkles size={isMobile ? 32 : 48} className="text-pink-500" />
            </motion.div>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">No More Profiles!</h2>
            <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8">
              {campusOnly 
                ? "No more profiles from your campus. Try expanding your search!" 
                : "Check back later for new matches in Pune!"}
            </p>
            
            <div className="space-y-2 md:space-y-3">
              {campusOnly && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCampusOnly(false);
                    setShowFilters(false);
                    showToast("Showing all colleges", "info");
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium shadow-lg shadow-pink-500/30"
                >
                  Show All Colleges
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                className="w-full bg-gray-100 text-gray-700 py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium hover:bg-gray-200 transition"
              >
                Refresh
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Campus Badge */}
            {isSameCampus(currentUser.college?._id) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 md:mb-3"
              >
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium shadow-lg">
                  <Award size={isMobile ? 10 : 12} />
                  Same Campus
                </span>
              </motion.div>
            )}

            {/* Profile Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentUser._id}
                initial={{ opacity: 0, scale: 0.9, x: swipeDirection === 'right' ? 100 : swipeDirection === 'left' ? -100 : 0 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: swipeDirection === 'right' ? -100 : 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                onTouchStart={isMobile ? onTouchStart : undefined}
                onTouchMove={isMobile ? onTouchMove : undefined}
                onTouchEnd={isMobile ? onTouchEnd : undefined}
              >
                {/* Profile Image with Gradient Overlay */}
                <div className="relative h-[60vh] md:h-[500px]">
                  {currentUser.profileImage ? (
                    <img 
                      src={currentUser.profileImage} 
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("Image load error, using fallback");
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center';
                        fallback.innerHTML = `<span class="text-7xl md:text-9xl text-pink-300 font-bold opacity-50">${currentUser.fullName?.charAt(0).toUpperCase()}</span>`;
                        parent.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex items-center justify-center">
                      <span className="text-7xl md:text-9xl text-pink-300 font-bold opacity-50">
                        {currentUser.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                    <h2 className="text-xl md:text-3xl font-bold mb-1">
                      {currentUser.fullName}, {currentUser.age || calculateAge(currentUser.dob)}
                    </h2>
                    <div className="flex items-center gap-1 md:gap-2 text-white/90 text-xs md:text-sm mb-2">
                      <MapPin size={isMobile ? 12 : 16} />
                      <span className="truncate">{currentUser.college?.name || 'College not specified'}</span>
                    </div>
                    
                    {/* Additional Details */}
                    <div className="flex flex-wrap gap-1 md:gap-2 mt-1 md:mt-2">
                      {currentUser.gender && (
                        <div className="bg-white/20 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs">
                          {currentUser.gender}
                        </div>
                      )}
                      <div className="bg-white/20 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs">
                        {currentUser.interests?.length || 0} interests
                      </div>
                      {currentUser.bio && (
                        <div className="bg-white/20 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs">
                          Has bio
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile Counter */}
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/50 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full">
                    <span className="text-white text-xs md:text-sm font-medium">
                      {currentIndex + 1}/{users.length}
                    </span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-4 md:p-6">
                  {/* Bio */}
                  {currentUser.bio && (
                    <div className="mb-3 md:mb-5">
                      <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 flex items-center gap-2 text-sm md:text-base">
                        <Info size={isMobile ? 14 : 16} className="text-pink-500" />
                        About
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-3 md:line-clamp-none">
                        {currentUser.bio}
                      </p>
                    </div>
                  )}

                  {/* Interests */}
                  {currentUser.interests?.length > 0 && (
                    <div className="mb-3 md:mb-5">
                      <h3 className="font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Star size={isMobile ? 14 : 16} className="text-pink-500" />
                        Interests
                      </h3>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {currentUser.interests.slice(0, isMobile ? 4 : undefined).map((interest, i) => (
                          <motion.span 
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="px-2 md:px-3 py-1 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-600 rounded-full text-[10px] md:text-xs font-medium flex items-center gap-1 border border-pink-100"
                          >
                            {getInterestIcon(interest)}
                            <span className="hidden md:inline">{interest}</span>
                            <span className="md:hidden">{interest.slice(0, 3)}</span>
                          </motion.span>
                        ))}
                        {isMobile && currentUser.interests.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-medium">
                            +{currentUser.interests.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-3 md:gap-4 mt-4 md:mt-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePass}
                      className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-lg border-2 border-gray-200"
                    >
                      <X size={isMobile ? 24 : 32} className="text-gray-500" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(currentUser._id)}
                      className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:opacity-90 transition shadow-xl shadow-pink-500/30 border-2 md:border-4 border-white"
                    >
                      <Heart size={isMobile ? 24 : 32} className="text-white fill-white" />
                    </motion.button>
                  </div>

                  {/* Swipe Hint */}
                  <p className="text-center text-[10px] md:text-xs text-gray-400 mt-3 md:mt-4">
                    {isMobile ? 'Swipe left/right' : 'Swipe left to pass • Swipe right to like'}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Quick Actions - Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 flex flex-col gap-2 z-40">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/matches")}
          className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-pink-500/50 hover:scale-110 transition-transform duration-300"
        >
          <Users size={isMobile ? 18 : 20} />
        </motion.button>
      </div>
    </div>
  );
};

export default Discovery;