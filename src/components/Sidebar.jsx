// Sidebar.jsx - Enhanced with Better Image Handling
import { NavLink, useNavigate } from "react-router-dom";
import { 
  Search, 
  MessageCircle, 
  Heart, 
  Settings, 
  LogOut, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import API from "../api/axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  // Update profile image URL when user changes
  useEffect(() => {
    if (user?.profileImage) {
      console.log("👤 User profile image path:", user.profileImage);
      const url = getProfileImageUrl(user.profileImage);
      console.log("🖼️ Generated URL:", url);
      setProfileImageUrl(url);
      setImageError(false);
    } else {
      setProfileImageUrl(null);
    }
  }, [user]);

  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const matchesRes = await API.get("/match");
      const matches = matchesRes.data;
      
      let totalUnread = 0;
      
      for (const match of matches) {
        try {
          const messagesRes = await API.get(`/chat/${match._id}`);
          const messages = messagesRes.data;
          
          const unreadInMatch = messages.filter(
            msg => msg.sender !== user?._id && !msg.seen
          ).length;
          
          totalUnread += unreadInMatch;
        } catch (err) {
          console.error(`Failed to fetch messages for match ${match._id}:`, err);
        }
      }
      
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const navLinks = [
    { to: "/discovery", icon: <Search size={20} />, label: "Discovery" },
    { to: "/matches", icon: <Heart size={20} />, label: "Matches" },
    { 
      to: "/messages", 
      icon: <MessageCircle size={20} />, 
      label: "Messages",
      badge: unreadCount > 0 ? unreadCount : null
    },
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
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
  // Get initials from name
  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  // Logout Modal Component
  const LogoutModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <LogOut size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">Logout?</h3>
        <p className="text-gray-500 text-center mb-6">Are you sure you want to logout from PuneDate?</p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 bg-gradient-to-b from-white to-pink-50/30 shadow-2xl p-6 flex-col justify-between h-screen sticky top-0 border-r border-pink-100">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10 group cursor-pointer" onClick={() => navigate("/discovery")}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg shadow-pink-500/30">
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                PuneDate
              </h1>
              <p className="text-xs text-gray-400">Find your Pune connection 💕</p>
            </div>
          </div>

          {/* User Profile Card with Photo */}
          {user && (
            <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-300 group-hover:border-pink-500 transition-all shadow-md">
                    {profileImageUrl && !imageError ? (
                      <img 
                        src={profileImageUrl} 
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          setImageError(true);
                        }}
                        onLoad={() => console.log("✅ Image loaded successfully:", profileImageUrl)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                        {getInitials(user.fullName)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 p-3 rounded-xl transition-all group relative overflow-hidden ${
                    isActive 
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30" 
                      : "text-gray-500 hover:bg-white hover:shadow-md"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-pink-500 transition-colors"}>
                        {link.icon}
                      </span>
                      <span className="font-medium">{link.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {link.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[22px] text-center animate-pulse">
                          {link.badge > 99 ? '99+' : link.badge}
                        </span>
                      )}
                      
                      {isActive && <ChevronRight size={16} className="text-white animate-pulse" />}
                    </div>
                    
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="space-y-3">
          <div className="h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group relative overflow-hidden"
          >
            <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-medium">Logout</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-pink-100 px-4 py-2 flex justify-between items-center z-50 shadow-2xl">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-xl transition-all relative ${
                isActive ? "text-pink-600" : "text-gray-400 hover:text-pink-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <div className={`transform transition-transform duration-300 ${isActive ? "scale-110 -translate-y-1" : ""}`}>
                    {link.icon}
                  </div>
                  
                  {link.badge && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </div>
                
                <span className={`text-[10px] mt-1 font-medium ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {link.label}
                </span>
                
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 rounded-full bg-pink-600"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>


      {/* Logout Confirmation Modal */}
      {showLogoutModal && <LogoutModal />}
    </>
  );
};

export default Sidebar;