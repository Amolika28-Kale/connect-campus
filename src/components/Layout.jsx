// components/Layout.jsx
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat/');
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat page वर Sidebar hide करा */}
      {!isChatPage && <Sidebar />}
      
      <div className={`flex-1 overflow-y-auto ${isChatPage ? 'p-0' : 'p-8'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;