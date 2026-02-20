// pages/Matches.jsx - Fully Mobile Responsive
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { 
  Heart, 
  MessageCircle, 
  Trash2, 
  Sparkles,
  Users,
  Clock,
  Calendar,
  Star,
  Zap,
  Coffee,
  Music,
  Camera,
  Award,
  ChevronRight,
  Menu,
  User,
  MapPin,
  GraduationCap,
  Grid3x3,
  List,
  Filter
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Sort matches based on selected option
  const getSortedMatches = () => {
    const matchesList = [...matches];
    
    if (sortBy === 'recent') {
      return matchesList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'name') {
      return matchesList.sort((a, b) => {
        const nameA = a.users.find(u => u._id !== user?._id)?.fullName || '';
        const nameB = b.users.find(u => u._id !== user?._id)?.fullName || '';
        return nameA.localeCompare(nameB);
      });
    }
    
    return matchesList;
  };

  const handleUnmatch = async (matchId) => {
    try {
      await API.delete(`/match/unmatch/${matchId}`);
      setMatches(matches.filter(m => m._id !== matchId));
      setShowUnmatchModal(false);
      setSelectedMatch(null);
    } catch (err) {
      console.error("Failed to unmatch:", err);
      alert("Failed to unmatch. Please try again.");
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
      'from-pink-400 to-rose-500',
      'from-purple-400 to-indigo-500',
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-yellow-400 to-orange-500',
      'from-red-400 to-pink-500',
      'from-indigo-400 to-purple-500',
      'from-teal-400 to-green-500',
    ];
    const index = (seed?.charCodeAt(0) || 0) % gradients.length;
    return gradients[index];
  };

  const formatDate = (date) => {
    const matchDate = new Date(date);
    const today = new Date();
    const diffDays = Math.floor((today - matchDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  };

  // Unmatch Confirmation Modal
  const UnmatchModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-sm w-full animate-popIn mx-4">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center animate-pulse">
          <Heart size={isMobile ? 28 : 36} className="text-white" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-center mb-2 md:mb-3 text-gray-800">Unmatch?</h3>
        <p className="text-sm md:text-base text-gray-500 text-center mb-4 md:mb-6">
          Are you sure you want to unmatch with <span className="font-semibold text-pink-500">{selectedMatch?.fullName}</span>? 
          This action cannot be undone.
        </p>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={() => {
              setShowUnmatchModal(false);
              setSelectedMatch(null);
            }}
            className="flex-1 py-2 md:py-3 rounded-xl bg-gray-100 text-gray-700 text-sm md:text-base font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleUnmatch(selectedMatch?.matchId)}
            className="flex-1 py-2 md:py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm md:text-base font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30"
          >
            Unmatch
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-500 animate-pulse">Loading your matches...</p>
        </div>
      </div>
    );
  }

  const sortedMatches = getSortedMatches();

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-6 pb-20 md:pb-0">
      {/* Unmatch Modal */}
      {showUnmatchModal && <UnmatchModal />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl md:rounded-2xl shadow-lg shadow-pink-500/30">
            <Heart size={isMobile ? 20 : 24} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Matches
            </h1>
            <p className="text-xs md:text-sm text-gray-500">Connect with your perfect matches</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 md:p-2 rounded-md transition ${
                viewMode === 'grid' 
                  ? 'bg-white text-pink-500 shadow-sm' 
                  : 'text-gray-500 hover:text-pink-500'
              }`}
              title="Grid view"
            >
              <Grid3x3 size={isMobile ? 16 : 18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 md:p-2 rounded-md transition ${
                viewMode === 'list' 
                  ? 'bg-white text-pink-500 shadow-sm' 
                  : 'text-gray-500 hover:text-pink-500'
              }`}
              title="List view"
            >
              <List size={isMobile ? 16 : 18} />
            </button>
          </div>

          {/* Sort Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 md:p-2 rounded-lg transition ${
              showFilters 
                ? 'bg-pink-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Sort"
          >
            <Filter size={isMobile ? 16 : 18} />
          </button>

          {/* Matches Count Badge */}
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-md">
            {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
          </span>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 md:mb-6 p-3 md:p-4 bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <h3 className="font-semibold text-gray-700 mb-2 md:mb-3 text-sm md:text-base">Sort Matches</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSortBy('recent');
                  setShowFilters(false);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition ${
                  sortBy === 'recent'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock size={isMobile ? 12 : 14} className="inline mr-1" />
                Most Recent
              </button>
              <button
                onClick={() => {
                  setSortBy('name');
                  setShowFilters(false);
                }}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition ${
                  sortBy === 'name'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <User size={isMobile ? 12 : 14} className="inline mr-1" />
                By Name
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {matches.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 px-4">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Heart size={isMobile ? 32 : 48} className="text-pink-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 md:mb-3">No matches yet</h3>
          <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 max-w-sm mx-auto">
            Start swiping to find your perfect match and make meaningful connections!
          </p>
          <button
            onClick={() => navigate("/discovery")}
            className="px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm md:text-base font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-pink-500/30 inline-flex items-center gap-2"
          >
            <Sparkles size={isMobile ? 16 : 18} />
            Start Swiping
          </button>
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {sortedMatches.map((match) => {
                const otherUser = match.users.find(u => u._id !== user?._id);
                const gradient = getRandomGradient(otherUser?._id);
                const profileImageUrl = getProfileImageUrl(otherUser?.profileImage);
                const hasImageError = imageErrors[otherUser?._id];
                
                return (
                  <div 
                    key={match._id} 
                    className="group bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-pink-200"
                  >
                    {/* Card Header with Gradient */}
                    <div className={`h-20 md:h-28 bg-gradient-to-r ${gradient} relative`}>
                      {/* Match Date Badge */}
                      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-sm px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium text-gray-600 shadow-sm">
                        <Calendar size={isMobile ? 8 : 12} className="inline mr-0.5" />
                        {formatDate(match.createdAt)}
                      </div>
                      
                      {/* Avatar with Profile Photo */}
                      <div className="absolute -bottom-8 md:-bottom-10 left-3 md:left-4">
                        <div className="relative">
                          <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 md:border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                            {profileImageUrl && !hasImageError ? (
                              <img 
                                src={profileImageUrl} 
                                alt={otherUser?.fullName}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(otherUser?._id)}
                              />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white font-bold text-lg md:text-3xl`}>
                                {getInitials(otherUser?.fullName)}
                              </div>
                            )}
                          </div>
                          {/* Online Status */}
                          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-4 md:h-4 bg-green-500 rounded-full border-1.5 md:border-2 border-white"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="pt-10 md:pt-12 p-3 md:p-4">
                      <h3 className="font-bold text-sm md:text-lg text-gray-800 group-hover:text-pink-600 transition-colors truncate">
                        {otherUser?.fullName}
                      </h3>
                      
                      {/* User Details */}
                      <div className="mt-1 md:mt-2 space-y-0.5 md:space-y-1">
                        <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                          <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-500 rounded-full"></span>
                          Active now
                        </p>
                        {otherUser?.college?.name && (
                          <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 truncate">
                            <GraduationCap size={isMobile ? 10 : 12} className="text-pink-400 flex-shrink-0" />
                            <span className="truncate">{otherUser.college.name}</span>
                          </p>
                        )}
                      </div>

                      {/* Interests Tags - Limited for mobile */}
                      {otherUser?.interests?.length > 0 && (
                        <div className="mt-2 md:mt-3 flex flex-wrap gap-1">
                          {otherUser.interests.slice(0, isMobile ? 2 : 3).map((interest, i) => (
                            <span key={i} className="px-1.5 md:px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-[8px] md:text-[10px] font-medium">
                              {interest}
                            </span>
                          ))}
                          {otherUser.interests.length > (isMobile ? 2 : 3) && (
                            <span className="px-1.5 md:px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[8px] md:text-[10px] font-medium">
                              +{otherUser.interests.length - (isMobile ? 2 : 3)}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex gap-1.5 md:gap-2 mt-3 md:mt-4">
                        <button
                          onClick={() => navigate(`/chat/${match._id}`)}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-1.5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium hover:opacity-90 transition-all transform hover:scale-105 shadow-md shadow-pink-500/30 flex items-center justify-center gap-1"
                        >
                          <MessageCircle size={isMobile ? 12 : 16} />
                          <span className="hidden xs:inline">Message</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMatch({
                              matchId: match._id,
                              fullName: otherUser?.fullName
                            });
                            setShowUnmatchModal(true);
                          }}
                          className="px-2 md:px-3 py-1.5 md:py-2.5 bg-gray-100 text-gray-600 rounded-lg md:rounded-xl text-xs hover:bg-red-50 hover:text-red-500 transition-all group"
                          title="Unmatch"
                        >
                          <Trash2 size={isMobile ? 12 : 16} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2 md:space-y-3">
              {sortedMatches.map((match) => {
                const otherUser = match.users.find(u => u._id !== user?._id);
                const gradient = getRandomGradient(otherUser?._id);
                const profileImageUrl = getProfileImageUrl(otherUser?.profileImage);
                const hasImageError = imageErrors[otherUser?._id];
                
                return (
                  <div
                    key={match._id}
                    className="group bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-pink-200"
                    onClick={() => navigate(`/chat/${match._id}`)}
                  >
                    <div className="flex items-center gap-2 md:gap-4 p-2 md:p-4">
                      {/* Avatar with Profile Photo */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-2xl overflow-hidden shadow-md transform group-hover:scale-105 transition-transform duration-300">
                          {profileImageUrl && !hasImageError ? (
                            <img 
                              src={profileImageUrl} 
                              alt={otherUser?.fullName}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(otherUser?._id)}
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white font-bold text-base md:text-2xl`}>
                              {getInitials(otherUser?.fullName)}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-4 md:h-4 bg-green-500 rounded-full border-1.5 md:border-2 border-white"></div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <h3 className="font-bold text-sm md:text-base text-gray-800 group-hover:text-pink-600 transition-colors truncate">
                            {otherUser?.fullName}
                          </h3>
                          <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1 ml-1">
                            <Calendar size={isMobile ? 8 : 12} />
                            {formatDate(match.createdAt)}
                          </span>
                        </div>
                        
                        {otherUser?.college?.name && (
                          <p className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 mb-0.5 md:mb-1 truncate">
                            <GraduationCap size={isMobile ? 8 : 12} className="text-pink-400 flex-shrink-0" />
                            <span className="truncate">{otherUser.college.name}</span>
                          </p>
                        )}
                        
                        <p className="text-xs md:text-sm text-gray-500 line-clamp-1 mb-1 md:mb-2">
                          {otherUser?.bio || 'No bio yet'}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/chat/${match._id}`);
                            }}
                            className="px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-[10px] md:text-xs font-medium hover:opacity-90 transition flex items-center gap-1"
                          >
                            <MessageCircle size={isMobile ? 10 : 12} />
                            Message
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMatch({
                                matchId: match._id,
                                fullName: otherUser?.fullName
                              });
                              setShowUnmatchModal(true);
                            }}
                            className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] md:text-xs hover:bg-red-50 hover:text-red-500 transition flex items-center gap-1"
                          >
                            <Trash2 size={isMobile ? 10 : 12} />
                            Unmatch
                          </button>
                        </div>
                      </div>

                      {/* Arrow Icon - Hidden on mobile */}
                      <ChevronRight 
                        size={isMobile ? 16 : 20} 
                        className="hidden sm:block text-gray-300 group-hover:text-pink-500 transition-all transform group-hover:translate-x-1 flex-shrink-0" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Quick Actions - Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={() => navigate("/discovery")}
          className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-pink-500/50 hover:scale-110 transition-transform duration-300"
        >
          <Sparkles size={isMobile ? 18 : 20} />
        </button>
      </div>
    </div>
  );
};

export default Matches;