// pages/Login.jsx - Ultra Attractive Version
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  LogIn, 
  Heart, 
  Sparkles,
  Eye,
  EyeOff,
  ChevronRight
} from "lucide-react";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(form.email, form.password);
      navigate("/discovery");
    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <Heart
            key={i}
            size={24}
            className="absolute text-white/20 fill-white/10 animate-float-heart"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${10 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        {/* Decorative Elements */}
        <div className="absolute -top-6 -left-6 animate-bounce-slow">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl rotate-12 flex items-center justify-center">
            <Heart size={24} className="text-white" />
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 animate-bounce-slow delay-1000">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl -rotate-12 flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 transform transition-all duration-500 hover:scale-[1.02]">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              {/* Animated Logo */}
              <div className="inline-block mb-4 relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-white/20 backdrop-blur rounded-2xl rotate-6 flex items-center justify-center border-2 border-white/30">
                  <Heart size={40} className="text-white fill-white animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back! 👋</h2>
              <p className="text-white/80 text-sm">Sign in to continue your journey</p>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="your.name@college.edu"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none bg-gray-50/50 focus:bg-white"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none bg-gray-50/50 focus:bg-white"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500 cursor-pointer"
                  />
                  <span className="text-gray-600 group-hover:text-pink-500 transition-colors">
                    Remember me
                  </span>
                </label>
               
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn size={18} />
                    <span>Sign In</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </form>

          

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="text-pink-500 font-semibold hover:text-pink-600 transition-colors inline-flex items-center gap-1 group"
              >
                Create Account
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-4 text-center">
          <p className="text-xs text-white/80 flex items-center justify-center gap-2">
            <span>🔒 100% Secure</span>
            <span>•</span>
            <span>🎓 Verified Colleges</span>
            <span>•</span>
            <span>❤️ 1000+ Happy Users</span>
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        
        @keyframes float-heart {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 15s infinite ease-in-out;
        }
        
        .animate-float-delayed {
          animation: float-delayed 18s infinite ease-in-out;
        }
        
        .animate-float-heart {
          animation: float-heart 15s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

export default Login;