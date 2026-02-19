// pages/Chat.jsx - Fixed Typing Indicator
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { 
  Send, 
  ArrowLeft, 
  Check, 
  CheckCheck, 
  Smile, 
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';

const Chat = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Typing timeout ref
  const typingTimeoutRef = useRef(null);

  // Fetch messages and match details
  useEffect(() => {
    if (matchId) {
      fetchMessages();
      fetchMatchDetails();
    }
  }, [matchId]);

  // Socket listeners - FIXED TYPING INDICATOR
  useEffect(() => {
    if (!socket || !matchId || !user) {
      console.log("Waiting for socket, matchId, or user...");
      return;
    }

    console.log("🔄 Setting up socket listeners for match:", matchId);

    // Join match room
    socket.emit('join-match', matchId);
    console.log("📢 Joined match room:", matchId);

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log("📨 New message received:", message);
      
      // When we receive a message from other user, stop typing indicator
      if (message.sender !== user?._id) {
        setOtherUserTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
      
      setMessages(prevMessages => {
        // Check if message already exists
        const exists = prevMessages.some(m => 
          m._id === message._id || 
          (m.tempId && m.tempId === message.tempId)
        );
        
        if (exists) {
          console.log("Message already exists, skipping");
          return prevMessages;
        }
        
        console.log("Adding new message to state");
        return [...prevMessages, message];
      });
      
      setTimeout(scrollToBottom, 100);
    };

    // Listen for typing indicator - FIXED
    const handleUserTyping = ({ userId, isTyping }) => {
      console.log(`✏️ User ${userId} typing:`, isTyping);
      
      if (userId !== user?._id) {
        if (isTyping) {
          // User started typing
          setOtherUserTyping(true);
          
          // Clear any existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
          }
        } else {
          // User stopped typing immediately
          setOtherUserTyping(false);
        }
      }
    };

    // Listen for seen status
    const handleMessagesSeen = ({ userId, matchId }) => {
      console.log(`👁️ Messages seen by ${userId} in match ${matchId}`);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sender !== user?._id ? { ...msg, seen: true } : msg
        )
      );
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('messages-seen', handleMessagesSeen);

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('messages-seen', handleMessagesSeen);
      
      // Clear typing timeout on cleanup
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [socket, matchId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/chat/${matchId}`);
      console.log("📥 Fetched messages:", res.data);
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
        console.log("👤 Match details:", otherUser);
      }
    } catch (error) {
      console.error("Failed to fetch match details:", error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const messageContent = newMessage.trim();
    if (!messageContent) return;

    console.log("📤 Sending message:", messageContent);
    
    // Clear input
    setNewMessage("");

    // Stop typing indicator when sending message
    if (socket && socket.connected) {
      socket.emit('typing', {
        matchId,
        isTyping: false
      });
    }

    // Create temp message for optimistic update
    const tempId = 'temp-' + Date.now();
    const tempMessage = {
      _id: tempId,
      tempId: tempId,
      content: messageContent,
      sender: user?._id,
      createdAt: new Date().toISOString(),
      seen: false
    };
    
    setMessages(prev => [...prev, tempMessage]);

    // Send via socket
    if (socket && socket.connected) {
      socket.emit('send-message', {
        matchId,
        content: messageContent,
        tempId: tempId
      });
    } else {
      console.log("Socket not connected, using HTTP backup");
      // HTTP backup
      API.post('/chat/send', {
        matchId,
        content: messageContent
      }).then(() => {
        fetchMessages();
      }).catch(err => {
        console.error("HTTP backup failed:", err);
      });
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (socket && socket.connected) {
      socket.emit('typing', {
        matchId,
        isTyping: value.length > 0
      });
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = '';
    
    messages.forEach((msg) => {
      const msgDate = formatDate(msg.createdAt);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msgDate });
      }
      groups.push({ type: 'message', message: msg });
    });
    
    return groups;
  };

  // Handle click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/messages")}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {matchDetails?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="font-semibold">{matchDetails?.fullName}</h2>
            <p className="text-xs text-gray-500">
              {otherUserTyping ? (
                <span className="text-pink-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
                  Typing...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Online
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Phone size={18} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Video size={18} className="text-gray-600" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Info size={16} /> View Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
                  Block User
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${index}`} className="flex justify-center">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                  {item.date}
                </span>
              </div>
            );
          }
          
          const msg = item.message;
          const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
          
          return (
            <div
              key={msg._id || msg.tempId}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-2 self-end mb-1">
                  {matchDetails?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`max-w-[70%] rounded-2xl p-3 ${
                isMe
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                <p className="break-words text-[15px] leading-relaxed">{msg.content}</p>
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
        })}
        
        {/* Typing Indicator - Now stops properly */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-2">
              {matchDetails?.fullName?.charAt(0).toUpperCase()}
            </div>
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
      <div className="bg-white p-4 border-t relative">
        <form onSubmit={sendMessage} className="flex gap-2">
          <button type="button" className="p-2 text-gray-400 hover:text-pink-500 transition-colors">
            <Paperclip size={20} />
          </button>
          
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 transition-colors ${
                showEmojiPicker ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
              }`}
            >
              <Smile size={20} />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  theme="light"
                  width={320}
                  height={400}
                />
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={`Message ${matchDetails?.fullName}...`}
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full transition-all ${
              newMessage.trim() 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:opacity-90' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;