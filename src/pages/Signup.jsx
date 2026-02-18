// pages/Signup.jsx - Ultra Attractive Version
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getCollegesAPI } from "../admin/services/adminService";
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  MapPin, 
  Upload,
  Heart,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
    college: "",
    collegeIdImage: null,
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (form.password.length >= 6) strength += 1;
    if (form.password.match(/[A-Z]/)) strength += 1;
    if (form.password.match(/[0-9]/)) strength += 1;
    if (form.password.match(/[^A-Za-z0-9]/)) strength += 1;
    setPasswordStrength(strength);
  }, [form.password]);

  const fetchColleges = async () => {
    try {
      const { data } = await getCollegesAPI();
      setColleges(data);
    } catch (err) {
      console.log("College fetch error", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      await signup(formData);
      // Show success modal or toast
      alert("✨ Signup successful! Awaiting admin approval.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setForm({ ...form, collegeIdImage: file });
    }
  };

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return "bg-gray-200";
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };

  const getPasswordStrengthText = () => {
    switch(passwordStrength) {
      case 0: return "Enter password";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 px-4 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        {/* Decorative Hearts */}
        <div className="absolute -top-4 -left-4 animate-bounce-slow">
          <Heart size={32} className="text-white/80 fill-white/30" />
        </div>
        <div className="absolute -bottom-4 -right-4 animate-bounce-slow delay-1000">
          <Heart size={32} className="text-white/80 fill-white/30" />
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="inline-block p-3 bg-white/20 rounded-2xl mb-3 backdrop-blur">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-1">Create Account</h2>
              <p className="text-white/80 text-sm">Join Pune's finest dating community</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Step {step} of 2</span>
              <span className="text-xs font-medium text-pink-500">{step === 1 ? 'Personal Info' : 'Verification'}</span>
            </div>
            <div className="flex gap-1 h-1.5">
              <div className={`flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'}`}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Full Name */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    College Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="your.name@college.edu"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Password with strength meter */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
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
                  
                  {/* Password Strength Meter */}
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 1 ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                        <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 2 ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                        <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 3 ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                        <div className={`flex-1 rounded-full transition-all ${passwordStrength >= 4 ? getPasswordStrengthColor() : 'bg-gray-200'}`}></div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${getPasswordStrengthColor()}`}></span>
                        Password strength: {getPasswordStrengthText()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Gender & DOB Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                      Gender
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none bg-white"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      required
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                        value={form.dob}
                        onChange={(e) => setForm({ ...form, dob: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Step 2: College Verification */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                {/* College Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    Select College
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none bg-white appearance-none"
                      value={form.college}
                      onChange={(e) => setForm({ ...form, college: e.target.value })}
                      required
                    >
                      <option value="">Choose your college</option>
                      {colleges.map((college) => (
                        <option key={college._id} value={college._id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* College ID Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    College ID Card
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      required
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        fileName ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-pink-500 hover:bg-pink-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${fileName ? 'bg-green-500' : 'bg-gray-100 group-hover:bg-pink-100'}`}>
                        {fileName ? <CheckCircle size={24} className="text-white" /> : <Upload size={24} className="text-gray-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {fileName ? 'File selected:' : 'Upload College ID'}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {fileName || 'JPG, PNG up to 5MB'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                  <input type="checkbox" id="terms" className="mt-1" required />
                  <label htmlFor="terms" className="text-xs text-gray-600">
                    I confirm that the information provided is accurate and I am 18+ years old. 
                    I agree to the <span className="text-pink-500 font-semibold">Terms of Service</span> and <span className="text-pink-500 font-semibold">Privacy Policy</span>.
                  </label>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <p className="text-center mt-4 text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-4 text-center">
          <p className="text-xs text-white/80">
            🔒 100% secure • Verified colleges only • 18+ only
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
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 15s infinite ease-in-out;
        }
        
        .animate-float-delayed {
          animation: float-delayed 18s infinite ease-in-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

export default Signup;