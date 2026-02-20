// pages/Settings.jsx - Fully Mobile Responsive with Toast Messages
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { 
  User, 
  Shield, 
  Bell, 
  LogOut, 
  Camera, 
  Lock,
  Moon,
  Upload,
  X,
  Check,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  CreditCard,
  Eye,
  EyeOff,
  Download,
  Clock,
  Settings as SettingsIcon,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Settings = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showCollegeId, setShowCollegeId] = useState(false);
  const [userFullData, setUserFullData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  
  // Password change state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

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

  // Fetch full user data on mount
  useEffect(() => {
    fetchFullUserData();
  }, []);

  const fetchFullUserData = async () => {
    try {
      const res = await API.get("/profile/me");
      setUserFullData(res.data);
      console.log("📥 Fetched full user data:", res.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      showToast("Failed to load user data", "error");
    }
  };
  
  // Profile form state
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    interests: user?.interests || [],
    profileImage: user?.profileImage || null,
    showLocation: true,
    showAge: true,
  });

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await API.put("/profile/update", {
        fullName: profile.fullName,
        bio: profile.bio,
        interests: profile.interests
      });
      
      if (updateUserProfile) {
        await updateUserProfile();
      }
      
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size should be less than 5MB", "warning");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "warning");
      return;
    }

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setUploadSuccess(false);
  };

  // Upload profile photo
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      setUploadLoading(true);
      const res = await API.put("/profile/update-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      console.log("✅ Photo upload response:", res.data);
      
      setProfile({ ...profile, profileImage: res.data.profileImage });
      
      if (updateUserProfile) {
        const updatedUser = await updateUserProfile();
        console.log("✅ AuthContext updated with new photo:", updatedUser);
      }
      
      setUploadSuccess(true);
      showToast("Profile photo uploaded successfully!", "success");
      setTimeout(() => setUploadSuccess(false), 3000);
      
      setSelectedFile(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (err) {
      console.error("Failed to upload photo:", err);
      showToast("Failed to upload photo", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle cancel photo
  const handleCancelPhoto = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showToast("New passwords don't match", "warning");
      return;
    }
    
    if (passwords.new.length < 6) {
      showToast("Password must be at least 6 characters", "warning");
      return;
    }
    
    try {
      setLoading(true);
      await API.put("/profile/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      showToast("Password changed successfully!", "success");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("Failed to change password:", err);
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone!")) {
      try {
        await API.delete("/profile/delete");
        logout();
        showToast("Account deleted successfully", "success");
        navigate("/login");
      } catch (err) {
        console.error("Failed to delete account:", err);
        showToast("Failed to delete account", "error");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get profile image URL with HTTPS support
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      if (window.location.protocol === 'https:' && imagePath.startsWith('http://')) {
        return imagePath.replace('http://', 'https://');
      }
      return imagePath;
    }
    
    const baseUrl = 'https://campus-backend-3axn.onrender.com';
    
    if (imagePath.includes('uploads/')) {
      const cleanPath = imagePath.replace(/\\/g, '/');
      const filename = cleanPath.split('uploads/').pop();
      return `${baseUrl}/uploads/${filename}`;
    }
    
    return `${baseUrl}/uploads/profiles/${imagePath}`;
  };

  // ✅ FIXED: Store icons as elements, not components
  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={18} /> },
    { id: "details", label: "My Details", icon: <Mail size={18} /> },
    { id: "privacy", label: "Privacy", icon: <Lock size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "appearance", label: "Appearance", icon: <Moon size={18} /> },
  ];

  const interestOptions = [
    "Music", "Travel", "Sports", "Reading", "Cooking", 
    "Movies", "Gaming", "Photography", "Art", "Fitness",
    "Dancing", "Writing", "Yoga", "Coffee", "Pets"
  ];

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

  // ✅ FIXED: Mobile Tab Selector - Proper icon rendering
  const MobileTabSelector = () => (
    <div className="md:hidden mb-4 relative">
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
      >
        <div className="flex items-center gap-2">
          {tabs.find(t => t.id === activeTab)?.icon}
          <span className="font-medium">{tabs.find(t => t.id === activeTab)?.label}</span>
        </div>
        <ChevronRight size={18} className={`transform transition-transform ${showMobileMenu ? 'rotate-90' : ''}`} />
      </button>
      
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 p-3 text-left ${
                  activeTab === tab.id ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-gray-50'
                } ${tab.id !== tabs[tabs.length-1].id ? 'border-b border-gray-100' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 lg:px-6 pb-24 md:pb-0">
      {/* Toast Message */}
      <ToastMessage />

      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="p-2 md:p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl md:rounded-2xl shadow-lg shadow-pink-500/30">
          <SettingsIcon size={isMobile ? 20 : 24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-xs md:text-sm text-gray-500">Manage your account</p>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      {isMobile && <MobileTabSelector />}

      {/* Desktop Tabs - FIXED */}
      {!isMobile && (
        <div className="border-b flex overflow-x-auto scrollbar-hide mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 md:px-6 py-3 md:py-4 font-medium text-xs md:text-sm flex items-center gap-1 md:gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-pink-500 text-pink-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4 md:space-y-6">
              {/* Profile Photo Section */}
              <div className="border-b pb-4 md:pb-6">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Profile Photo</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  {/* Photo Preview */}
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-r from-pink-100 to-purple-100 border-3 md:border-4 border-pink-200 shadow-xl">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : profile.profileImage ? (
                        <img 
                          src={getProfileImageUrl(profile.profileImage)} 
                          alt={user?.fullName} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold text-3xl md:text-4xl">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {uploadSuccess && (
                      <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-green-500 text-white p-1 rounded-full animate-bounce">
                        <Check size={isMobile ? 12 : 16} />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 md:space-y-3 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {!selectedFile ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm md:text-base hover:opacity-90 transition"
                      >
                        <Camera size={isMobile ? 16 : 18} />
                        Choose Photo
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleUploadPhoto}
                          disabled={uploadLoading}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50"
                        >
                          {uploadLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span className="hidden md:inline">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={isMobile ? 16 : 18} />
                              <span className="hidden md:inline">Upload</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelPhoto}
                          className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
                        >
                          <X size={isMobile ? 16 : 18} />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-[10px] md:text-xs text-gray-500">
                      Supported: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-base md:text-lg font-semibold">Basic Information</h3>
                
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full p-2 md:p-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-gray-100 border rounded-lg text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows="3"
                    className="w-full p-2 md:p-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-1 md:gap-2 max-h-32 md:max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          const newInterests = profile.interests.includes(interest)
                            ? profile.interests.filter(i => i !== interest)
                            : [...profile.interests, interest];
                          setProfile({ ...profile, interests: newInterests });
                        }}
                        className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium transition transform hover:scale-105 ${
                          profile.interests.includes(interest)
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm md:text-base hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-pink-500/30"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* My Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
                <User size={isMobile ? 16 : 18} className="text-pink-500" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Full Name */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <User size={isMobile ? 12 : 14} />
                    <span>Full Name</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800 truncate">
                    {userFullData?.fullName || user?.fullName}
                  </p>
                </div>

                {/* Email */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <Mail size={isMobile ? 12 : 14} />
                    <span>Email</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800 truncate">
                    {userFullData?.email || user?.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <Phone size={isMobile ? 12 : 14} />
                    <span>Phone</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800">
                    {userFullData?.phone || "Not provided"}
                  </p>
                </div>

                {/* Gender */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <User size={isMobile ? 12 : 14} />
                    <span>Gender</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800 capitalize">
                    {userFullData?.gender || user?.gender}
                  </p>
                </div>

                {/* Date of Birth */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <Calendar size={isMobile ? 12 : 14} />
                    <span>DOB</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800">
                    {formatDate(userFullData?.dob)}
                  </p>
                </div>

                {/* Age */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <Calendar size={isMobile ? 12 : 14} />
                    <span>Age</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800">
                    {userFullData?.dob ? calculateAge(userFullData.dob) : 'N/A'} years
                  </p>
                </div>

                {/* College */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <GraduationCap size={isMobile ? 12 : 14} />
                    <span>College</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800">
                    {userFullData?.college?.name || "Not specified"}
                  </p>
                </div>

                {/* Account Status */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <Shield size={isMobile ? 12 : 14} />
                    <span>Status</span>
                  </div>
                  <span className={`inline-block px-2 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                    userFullData?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {userFullData?.status || 'Active'}
                  </span>
                </div>

                {/* Member Since */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <Calendar size={isMobile ? 12 : 14} />
                    <span>Joined</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800">
                    {formatDate(userFullData?.createdAt)}
                  </p>
                </div>
              </div>

              {/* College ID Card Section */}
              {userFullData?.collegeIdImage && (
                <div className="border-t pt-4 md:pt-6">
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
                    <CreditCard size={isMobile ? 16 : 18} className="text-pink-500" />
                    College ID Card
                  </h3>
                  
                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Your uploaded college ID card</p>
                    
                    <div className="space-y-2 md:space-y-3">
                      <button
                        onClick={() => setShowCollegeId(!showCollegeId)}
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition text-sm md:text-base"
                      >
                        <Eye size={isMobile ? 16 : 18} />
                        {showCollegeId ? 'Hide' : 'View'} College ID
                      </button>
                      
                      {showCollegeId && (
                        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                          <img 
                            src={getProfileImageUrl(userFullData.collegeIdImage)} 
                            alt="College ID"
                            className="w-full max-w-md mx-auto"
                          />
                          <a
                            href={getProfileImageUrl(userFullData.collegeIdImage)}
                            download
                            className="absolute top-2 right-2 p-1.5 md:p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                          >
                            <Download size={isMobile ? 14 : 18} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Last Active */}
              <div className="border-t pt-4 md:pt-6">
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-[10px] md:text-xs mb-1">
                    <Clock size={isMobile ? 12 : 14} />
                    <span>Last Active</span>
                  </div>
                  <p className="font-medium text-sm md:text-base text-gray-800">
                    {userFullData?.lastActive ? new Date(userFullData.lastActive).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-4 md:space-y-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2">
                  <Lock size={isMobile ? 16 : 18} className="text-pink-500" />
                  Change Password
                </h3>
                <div className="space-y-3 max-w-md">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full p-2 md:p-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full p-2 md:p-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full p-2 md:p-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm md:text-base hover:opacity-90 transition disabled:opacity-50"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="border-t pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Privacy Options</h3>
                <div className="space-y-2 md:space-y-3 max-w-md">
                  <label className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs md:text-sm text-gray-700">Show my location</span>
                    <input
                      type="checkbox"
                      checked={profile.showLocation}
                      onChange={(e) => setProfile({ ...profile, showLocation: e.target.checked })}
                      className="w-4 h-4 md:w-5 md:h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs md:text-sm text-gray-700">Show my age</span>
                    <input
                      type="checkbox"
                      checked={profile.showAge}
                      onChange={(e) => setProfile({ ...profile, showAge: e.target.checked })}
                      className="w-4 h-4 md:w-5 md:h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-red-600">Danger Zone</h3>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full md:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-red-500 text-white rounded-lg text-sm md:text-base hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-3 md:space-y-4 max-w-md">
              <label className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex-1 pr-2">
                  <span className="font-medium block text-sm md:text-base">New Matches</span>
                  <p className="text-[10px] md:text-xs text-gray-500">Get notified when someone likes you back</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 md:w-5 md:h-5 text-pink-500 rounded" />
              </label>
              
              <label className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex-1 pr-2">
                  <span className="font-medium block text-sm md:text-base">New Messages</span>
                  <p className="text-[10px] md:text-xs text-gray-500">Get notified when you receive a message</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 md:w-5 md:h-5 text-pink-500 rounded" />
              </label>
              
              <label className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className="flex-1 pr-2">
                  <span className="font-medium block text-sm md:text-base">Marketing Emails</span>
                  <p className="text-[10px] md:text-xs text-gray-500">Receive updates about new features</p>
                </div>
                <input type="checkbox" className="w-4 h-4 md:w-5 md:h-5 text-pink-500 rounded" />
              </label>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-3 md:space-y-4 max-w-md">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Theme
                </label>
                <select className="w-full p-2 md:p-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-pink-500">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System Default</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Language
                </label>
                <select className="w-full p-2 md:p-3 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-pink-500">
                  <option>English</option>
                  <option>हिंदी (Hindi)</option>
                  <option>मराठी (Marathi)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Logout Button */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 flex justify-center px-4 z-40">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              logout();
              navigate("/login");
              showToast("Logged out successfully", "info");
            }
          }}
          className="w-full max-w-md bg-gradient-to-r from-red-500 to-pink-500 text-white py-2.5 md:py-3 rounded-xl text-sm md:text-base font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
        >
          <LogOut size={isMobile ? 18 : 20} />
          Logout
        </button>
      </div>

      {/* Extra padding for mobile */}
      <div className="md:hidden h-16"></div>
    </div>
  );
};

// Helper function to calculate age
const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  const diff = new Date() - new Date(dob);
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return age;
};

export default Settings;