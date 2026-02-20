// context/AuthContext.jsx - Complete Fixed Version
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get base URL based on environment
  const getBaseUrl = () => {
    return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  };

  // Format profile image URL
  const formatProfileImage = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    
    const baseUrl = getBaseUrl();
    if (imagePath.includes('uploads/')) {
      const filename = imagePath.split('uploads/').pop();
      return `${baseUrl}/uploads/${filename}`;
    }
    return `${baseUrl}/uploads/profiles/${imagePath}`;
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("userData");
      
      console.log("🔍 Initializing Auth - Token:", !!token, "Saved User:", !!savedUser);
      
      if (token && savedUser) {
        try {
          // Parse saved user
          const parsedUser = JSON.parse(savedUser);
          
          // Format profile image URL
          if (parsedUser.profileImage) {
            parsedUser.profileImage = formatProfileImage(parsedUser.profileImage);
          }
          
          setUser(parsedUser);
          
          // Fetch latest profile from server
          try {
            const res = await API.get("/profile/me");
            console.log("✅ Fetched latest profile:", res.data);
            
            // Format image URL from server response
            if (res.data.profileImage) {
              res.data.profileImage = formatProfileImage(res.data.profileImage);
            }
            
            // Merge saved data with latest profile data
            const updatedUser = {
              ...parsedUser,
              ...res.data,
            };
            
            setUser(updatedUser);
            localStorage.setItem("userData", JSON.stringify(updatedUser));
            
            console.log("✅ User restored and updated:", updatedUser);
          } catch (profileErr) {
            console.log("Could not fetch latest profile, using saved data");
          }
        } catch (err) {
          console.log("❌ Error restoring user:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Login Logic
  const login = async (email, password, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? "/admin/login" : "/auth/login";
      const res = await API.post(endpoint, { email, password });
      
      const { token, user: userData } = res.data;
      
      console.log("✅ Login successful:", userData);
      
      // Fetch complete profile
      let completeUserData = userData;
      try {
        const profileRes = await API.get("/profile/me");
        console.log("✅ Fetched profile after login:", profileRes.data);
        
        // Format profile image URL
        if (profileRes.data.profileImage) {
          profileRes.data.profileImage = formatProfileImage(profileRes.data.profileImage);
        }
        
        completeUserData = {
          ...userData,
          ...profileRes.data,
        };
      } catch (profileErr) {
        console.log("Could not fetch profile details:", profileErr);
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(completeUserData));
      
      setUser(completeUserData);
      return res.data;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  // Update user profile (call after photo upload)
  const updateUserProfile = async () => {
    try {
      console.log("🔄 Updating user profile...");
      const res = await API.get("/profile/me");
      console.log("✅ Profile updated:", res.data);
      
      // Format profile image URL
      if (res.data.profileImage) {
        res.data.profileImage = formatProfileImage(res.data.profileImage);
      }
      
      const updatedUser = { ...user, ...res.data };
      
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      throw error;
    }
  };

  // Signup Logic
  const signup = async (formData) => {
    try {
      const res = await API.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout Logic
  const logout = () => {
    console.log("🔓 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      loading,
      updateUserProfile
    }}>
      {!loading ? children : (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};