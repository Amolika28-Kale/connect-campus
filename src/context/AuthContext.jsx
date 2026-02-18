// context/AuthContext.jsx - Updated with profile photo persistence
import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          
          // Verify token is still valid and get latest profile
          const res = await API.get("/profile/me");
          
          // Merge saved data with latest profile data
          const updatedUser = {
            ...parsedUser,
            ...res.data,
            // Ensure profile image is included
            profileImage: res.data.profileImage || parsedUser.profileImage
          };
          
          setUser(updatedUser);
          
          // Update localStorage with latest data
          localStorage.setItem("userData", JSON.stringify(updatedUser));
          
          console.log("✅ User restored and updated:", updatedUser);
        } catch (err) {
          console.log("❌ Token invalid, clearing storage");
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
      
      // Fetch complete profile to get profile image
      let completeUserData = userData;
      try {
        const profileRes = await API.get("/profile/me");
        completeUserData = {
          ...userData,
          ...profileRes.data
        };
      } catch (profileErr) {
        console.log("Could not fetch profile details:", profileErr);
      }
      
      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(completeUserData));
      
      setUser(completeUserData);
      return res.data;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  };

  // Update user profile (call this after photo upload)
  const updateUserProfile = async () => {
    try {
      const res = await API.get("/profile/me");
      const updatedUser = { ...user, ...res.data };
      
      setUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user profile:", error);
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
      updateUserProfile // Add this to context
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