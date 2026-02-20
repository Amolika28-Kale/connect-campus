// pages/Settings.jsx - Complete with All Signup Details
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
  Clock
} from "lucide-react";

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
  const fileInputRef = useRef(null);
  
  // Password change state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

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
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
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
      setTimeout(() => setUploadSuccess(false), 3000);
      
      setSelectedFile(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (err) {
      console.error("Failed to upload photo:", err);
      alert("Failed to upload photo");
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
      alert("New passwords don't match");
      return;
    }
    
    if (passwords.new.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      await API.put("/profile/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      alert("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("Failed to change password:", err);
      alert(err.response?.data?.message || "Failed to change password");
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
        navigate("/login");
      } catch (err) {
        console.error("Failed to delete account:", err);
        alert("Failed to delete account");
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

  // Get profile image URL
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.includes('uploads/')) {
      const filename = imagePath.split('uploads/').pop();
      return `https://campus-backend-3axn.onrender.com/uploads/${filename}`;
            // return `http://localhost:5000/uploads/${filename}`;

    }
    
    return `https://campus-backend-3axn.onrender.com/uploads/profiles/${imagePath}`;
    // return `http://localhost:5000/uploads/profiles/${imagePath}`;
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "details", label: "My Details", icon: Mail },
    { id: "privacy", label: "Privacy", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Moon },
  ];

  const interestOptions = [
    "Music", "Travel", "Sports", "Reading", "Cooking", 
    "Movies", "Gaming", "Photography", "Art", "Fitness",
    "Dancing", "Writing", "Yoga", "Coffee", "Pets"
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-0">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
        Settings
      </h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Photo Section */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Photo Preview */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-pink-100 to-purple-100 border-4 border-pink-200 shadow-xl">
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-pink-400 to-purple-500 text-white font-bold text-4xl">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    {uploadSuccess && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full animate-bounce">
                        <Check size={16} />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3">
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
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
                      >
                        <Camera size={18} />
                        Choose Photo
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleUploadPhoto}
                          disabled={uploadLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                        >
                          {uploadLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={18} />
                              Upload
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelPhoto}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Supported: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="w-full p-3 bg-gray-100 border rounded-lg text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows="4"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
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
                        className={`px-4 py-2 rounded-full text-sm font-medium transition transform hover:scale-105 ${
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
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-pink-500/30"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* My Details Tab - NEW TAB WITH ALL SIGNUP INFO */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={18} className="text-pink-500" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <User size={14} />
                    <span>Full Name</span>
                  </div>
                  <p className="font-medium text-gray-800">{userFullData?.fullName || user?.fullName}</p>
                </div>

                {/* Email */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Mail size={14} />
                    <span>Email</span>
                  </div>
                  <p className="font-medium text-gray-800">{userFullData?.email || user?.email}</p>
                </div>

                {/* Phone */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Phone size={14} />
                    <span>Phone Number</span>
                  </div>
                  <p className="font-medium text-gray-800">{userFullData?.phone || "Not provided"}</p>
                </div>

                {/* Gender */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <User size={14} />
                    <span>Gender</span>
                  </div>
                  <p className="font-medium text-gray-800 capitalize">{userFullData?.gender || user?.gender}</p>
                </div>

                {/* Date of Birth */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Calendar size={14} />
                    <span>Date of Birth</span>
                  </div>
                  <p className="font-medium text-gray-800">{formatDate(userFullData?.dob)}</p>
                </div>

                {/* Age */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Calendar size={14} />
                    <span>Age</span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {userFullData?.dob ? calculateAge(userFullData.dob) : 'N/A'} years
                  </p>
                </div>

                {/* College */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <GraduationCap size={14} />
                    <span>College</span>
                  </div>
                  <p className="font-medium text-gray-800">{userFullData?.college?.name || "Not specified"}</p>
                </div>

                {/* Account Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Shield size={14} />
                    <span>Account Status</span>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    userFullData?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {userFullData?.status || 'Active'}
                  </span>
                </div>

                {/* Member Since */}
                <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Calendar size={14} />
                    <span>Member Since</span>
                  </div>
                  <p className="font-medium text-gray-800">{formatDate(userFullData?.createdAt)}</p>
                </div>
              </div>

              {/* College ID Card Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-pink-500" />
                  College ID Card
                </h3>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">Your uploaded college ID card for verification</p>
                  
                  {userFullData?.collegeIdImage ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowCollegeId(!showCollegeId)}
                        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition"
                      >
                        <Eye size={18} />
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
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No college ID uploaded</p>
                  )}
                </div>
              </div>

              {/* Last Active */}
              <div className="border-t pt-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Clock size={14} />
                    <span>Last Active</span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {userFullData?.lastActive ? new Date(userFullData.lastActive).toLocaleString() : 'Just now'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock size={18} className="text-pink-500" />
                  Change Password
                </h3>
                <div className="space-y-3 max-w-md">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Privacy Options</h3>
                <div className="space-y-3 max-w-md">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Show my location</span>
                    <input
                      type="checkbox"
                      checked={profile.showLocation}
                      onChange={(e) => setProfile({ ...profile, showLocation: e.target.checked })}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Show my age</span>
                    <input
                      type="checkbox"
                      checked={profile.showAge}
                      onChange={(e) => setProfile({ ...profile, showAge: e.target.checked })}
                      className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-4 max-w-md">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div>
                  <span className="font-medium block">New Matches</span>
                  <p className="text-sm text-gray-500">Get notified when someone likes you back</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-pink-500 rounded" />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div>
                  <span className="font-medium block">New Messages</span>
                  <p className="text-sm text-gray-500">Get notified when you receive a message</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-pink-500 rounded" />
              </label>
              
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div>
                  <span className="font-medium block">Marketing Emails</span>
                  <p className="text-sm text-gray-500">Receive updates about new features</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-pink-500 rounded" />
              </label>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System Default</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
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
            }
          }}
          className="w-full max-w-md bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
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