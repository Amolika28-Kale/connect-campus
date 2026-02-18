// pages/admin/SuspiciousChats.jsx
import { useEffect, useState } from "react";
import { getSuspiciousChatsAPI } from "../services/adminService";
import { AlertTriangle } from "lucide-react";

function SuspiciousChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuspiciousChats();
  }, []);

  const fetchSuspiciousChats = async () => {
    try {
      const { data } = await getSuspiciousChatsAPI();
      setChats(data);
    } catch (error) {
      console.error("Failed to fetch suspicious chats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Suspicious Chats 💬</h1>

      <div className="space-y-4">
        {chats.map((chat) => (
          <div key={chat._id} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={20} className="text-red-500" />
              <div>
                <p className="font-semibold">{chat.sender?.fullName}</p>
                <p className="text-sm text-gray-400 mb-2">{chat.sender?.email}</p>
                <p className="bg-gray-700 p-3 rounded-lg">{chat.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(chat.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {chats.length === 0 && (
          <p className="text-center text-gray-400 py-8">No suspicious chats found</p>
        )}
      </div>
    </div>
  );
}

export default SuspiciousChats;