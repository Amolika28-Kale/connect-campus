import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AdminAuthContext } from "../context/AdminAuthContext";

function AdminLayout() {
  const { logout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const linkClass =
    "block px-4 py-2 rounded-lg hover:bg-gray-700 transition";

  const activeClass = "bg-pink-600";

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Campus Admin
        </h2>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          👥 Users
        </NavLink>

        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          🚨 Reports
        </NavLink>

        <NavLink
          to="/admin/chats"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          💬 Suspicious Chats
        </NavLink>

        <NavLink
          to="/admin/colleges"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          🏫 Colleges
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
