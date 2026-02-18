// pages/Chat.jsx - FINAL FIXED VERSION
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  
  // Track sent messages to prevent duplicates
  const sentMessagesRef = useRef(new Set());

  // Fetch messages and match details
  useEffect(() => {
    if (matchId) {
      fetchMessages();
      fetchMatchDetails();
    }
  }, [matchId]);

// Add this to your Chat.jsx to update count when message arrives
// In your socket listener for new messages
useEffect(() => {
  if (!socket) return;
  
  const handleNewMessage = (message) => {
    // Update messages
    setMessages(prev => [...prev, message]);
    
    // If this is not current chat, increment unread count
    if (message.matchId !== matchId) {
      // You can emit an event to update sidebar count
      // Or use a global state management
    }
  };
  
  socket.on('new-message', handleNewMessage);
  
  return () => {
    socket.off('new-message', handleNewMessage);
  };
}, [socket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/chat/${matchId}`);
      console.log("📥 Fetched messages:", res.data.length);
      setMessages(res.data);
      
      // Mark as seen
      await API.put(`/chat/seen/${matchId}`);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchDetails = async () => {
    try {
      const res = await API.get("/match");
      const match = res.data.find(m => m._id === matchId);
      if (match) {
        const otherUser = match.users.find(u => u._id !== user?._id);
        setMatchDetails(otherUser);
      }
    } catch (error) {
      console.error("Failed to fetch match details:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const messageContent = newMessage.trim();
    if (!messageContent) return;

    console.log("📤 Sending message:", messageContent);
    
    // Clear input immediately
    setNewMessage("");

    // Create a unique temp ID
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    // Add optimistic update
    const tempMessage = {
      _id: tempId,
      tempId: tempId,
      content: messageContent,
      sender: user?._id,
      createdAt: new Date().toISOString(),
      seen: false,
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);

    // Send via socket
    if (socket && socket.connected) {
      socket.emit('send-message', {
        matchId,
        content: messageContent,
        tempId: tempId // Send tempId to backend
      });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing', {
        matchId,
        isTyping: e.target.value.length > 0
      });
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!matchDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Match not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white p-4 border-b flex items-center gap-4">
        <button 
          onClick={() => navigate("/messages")}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {matchDetails?.fullName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-semibold">{matchDetails?.fullName}</h2>
          <p className="text-xs text-gray-500">
            {otherUserTyping ? "✏️ Typing..." : "Online"}
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet</p>
            <p className="text-sm">Say hi to {matchDetails?.fullName}! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
            
            return (
              <div
                key={msg._id || msg.tempId}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-2xl p-3 ${
                  isMe
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  <p className="break-words">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 text-xs mt-1 ${
                    isMe ? 'text-pink-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      <span>
                        {msg.seen ? <CheckCheck size={14} /> : <Check size={14} />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl p-3 rounded-bl-none shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="bg-white p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          />
          <button
            type="submit"
            className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/30"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;