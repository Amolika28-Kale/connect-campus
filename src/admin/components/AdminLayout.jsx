// admin/components/AdminLayout.jsx - Enhanced UI Matching User Side
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AdminAuthContext } from "../context/AdminAuthContext";
import { 
  LayoutDashboard, 
  Users, 
  Flag, 
  MessageSquareWarning, 
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Shield,
  Bell,
  Settings
} from "lucide-react";

function AdminLayout() {
  const { logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navLinks = [
    { to: "/admin", end: true, icon: <LayoutDashboard size={20} />, label: "Dashboard", color: "from-blue-500 to-cyan-500" },
    { to: "/admin/users", icon: <Users size={20} />, label: "Users", color: "from-pink-500 to-rose-500" },
    { to: "/admin/reports", icon: <Flag size={20} />, label: "Reports", color: "from-yellow-500 to-orange-500" },
    { to: "/admin/chats", icon: <MessageSquareWarning size={20} />, label: "Suspicious Chats", color: "from-purple-500 to-violet-500" },
    { to: "/admin/colleges", icon: <GraduationCap size={20} />, label: "Colleges", color: "from-green-500 to-emerald-500" },
  ];

  // Logout Confirmation Modal
  const LogoutModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-3xl p-8 max-w-sm w-full animate-popIn border border-gray-700">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center animate-pulse">
          <LogOut size={36} className="text-white" />
        </div>
        <h3 className="text-2xl font-bold text-center mb-3 text-white">Logout?</h3>
        <p className="text-gray-400 text-center mb-8">
          Are you sure you want to logout from admin panel?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="flex-1 py-3 rounded-xl bg-gray-700 text-gray-300 font-semibold hover:bg-gray-600 transition-all"
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
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Logout Modal */}
      {showLogoutModal && <LogoutModal />}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300
        w-72 bg-gray-800/90 backdrop-blur-xl shadow-2xl p-6 flex flex-col border-r border-gray-700
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => navigate("/admin")}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl">
              <Shield size={28} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Campus Admin
            </h1>
            <p className="text-xs text-gray-400">Control Panel</p>
          </div>
        </div>


        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 p-3 rounded-xl transition-all group relative overflow-hidden ${
                  isActive 
                    ? `bg-gradient-to-r ${link.color} text-white shadow-lg` 
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-white" : "text-gray-400 group-hover:text-white transition-colors"}>
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.label}</span>
                  </div>
                  
                  {isActive && (
                    <div className="flex items-center gap-1">
                      <ChevronRight size={16} className="text-white animate-pulse" />
                    </div>
                  )}
                  
                  {!isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${link.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-4 pt-6 border-t border-gray-700">
          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center justify-center gap-3 p-3 rounded-xl border-2 border-red-500/30 text-red-500 hover:text-white transition-all duration-500 group-hover:border-transparent">
              <LogOut size={18} className="group-hover:rotate-180 transition-transform duration-700" />
              <span className="font-medium">Logout</span>
            </div>
          </button>

          {/* Version */}
          <p className="text-center text-xs text-gray-500">
            Admin Panel v1.0.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header with gradient */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Welcome back, Admin
              </h2>
              <p className="text-sm text-gray-400 mt-1">Manage your campus dating platform</p>
            </div>
            
        
          </div>

          {/* Outlet for nested routes */}
          <Outlet />
        </div>
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-popIn {
          animation: popIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;