// pages/Chat.jsx - Complete with Block, Report, View Profile, Delete & Clear Chat
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
  Info,
  Trash2,
  X,
  Copy,
  CornerDownRight,
  Reply,
  User,
  AlertTriangle,
  Ban,
  Flag,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Loader
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
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteForEveryone, setDeleteForEveryone] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMessageOptions, setShowMessageOptions] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const messageOptionsRef = useRef(null);
  
  // Typing timeout ref
  const typingTimeoutRef = useRef(null);

  // Fetch messages and match details
  useEffect(() => {
    if (matchId) {
      fetchMessages();
      fetchMatchDetails();
    }
  }, [matchId]);

  // Socket listeners
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
      
      if (message.sender !== user?._id) {
        setOtherUserTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
      
      setMessages(prevMessages => {
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

    // Listen for deleted message
    const handleMessageDeleted = ({ messageId, deleteForEveryone }) => {
      console.log("🗑️ Message deleted:", messageId, "forEveryone:", deleteForEveryone);
      
      setMessages(prevMessages => {
        if (deleteForEveryone) {
          return prevMessages.filter(m => m._id !== messageId);
        } else {
          return prevMessages.map(m => 
            m._id === messageId ? { ...m, deleted: true } : m
          );
        }
      });
    };

    // Listen for chat cleared
    const handleChatCleared = ({ matchId }) => {
      console.log("🗑️ Chat cleared for match:", matchId);
      setMessages([]);
    };

    // Listen for typing indicator
    const handleUserTyping = ({ userId, isTyping }) => {
      console.log(`✏️ User ${userId} typing:`, isTyping);
      
      if (userId !== user?._id) {
        if (isTyping) {
          setOtherUserTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
          }
        } else {
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
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('chat-cleared', handleChatCleared);
    socket.on('user-typing', handleUserTyping);
    socket.on('messages-seen', handleMessagesSeen);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('chat-cleared', handleChatCleared);
      socket.off('user-typing', handleUserTyping);
      socket.off('messages-seen', handleMessagesSeen);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [socket, matchId, user]);

  // Handle click outside message options
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (messageOptionsRef.current && !messageOptionsRef.current.contains(event.target)) {
        setShowMessageOptions(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
// Update fetchMatchDetails function
const fetchMatchDetails = async () => {
  try {
    const res = await API.get("/match");
    const match = res.data.find(m => m._id === matchId);
    if (match) {
      const otherUser = match.users.find(u => u._id !== user?._id);
      setMatchDetails(otherUser);
      
      // Fetch full profile of other user
      try {
        console.log("Fetching profile for user:", otherUser._id);
        const profileRes = await API.get(`/profile/${otherUser._id}`);
        console.log("Profile data received:", profileRes.data);
        setOtherUserProfile(profileRes.data);
      } catch (err) {
        console.error("Failed to fetch other user profile:", err);
        // Set fallback data
        setOtherUserProfile({
          bio: otherUser.bio || 'No bio available',
          interests: otherUser.interests || [],
          college: otherUser.college,
          createdAt: otherUser.createdAt || new Date().toISOString(),
          gender: otherUser.gender
        });
      }
      
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
    
    setNewMessage("");

    if (socket && socket.connected) {
      socket.emit('typing', {
        matchId,
        isTyping: false
      });
    }

    const tempId = 'temp-' + Date.now();
    const tempMessage = {
      _id: tempId,
      tempId: tempId,
      content: messageContent,
      sender: user?._id,
      createdAt: new Date().toISOString(),
      seen: false,
      replyTo: replyingTo
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setReplyingTo(null);

    if (socket && socket.connected) {
      socket.emit('send-message', {
        matchId,
        content: messageContent,
        tempId: tempId,
        replyTo: replyingTo
      });
    } else {
      console.log("Socket not connected, using HTTP backup");
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

 // In Chat.jsx, update handleDeleteMessage function
const handleDeleteMessage = async () => {
  if (!selectedMessage) return;

  try {
    if (deleteForEveryone) {
      console.log("Deleting for everyone:", selectedMessage._id);
      const response = await API.delete(`/chat/message/${selectedMessage._id}?forEveryone=true`);
      console.log("Delete response:", response.data);
      
      if (socket && socket.connected) {
        socket.emit('delete-message', {
          messageId: selectedMessage._id,
          matchId,
          forEveryone: true
        });
      }
      
      // Remove from UI
      setMessages(prev => prev.filter(m => m._id !== selectedMessage._id));
    } else {
      console.log("Deleting for me:", selectedMessage._id);
      const response = await API.delete(`/chat/message/${selectedMessage._id}?forEveryone=false`);
      console.log("Delete response:", response.data);
      
      // Remove from UI
      setMessages(prev => prev.filter(m => m._id !== selectedMessage._id));
    }
    
    setShowDeleteModal(false);
    setSelectedMessage(null);
    setDeleteForEveryone(false);
  } catch (error) {
    console.error("Failed to delete message:", error);
    console.error("Error details:", error.response?.data);
    alert(error.response?.data?.message || "Failed to delete message");
  }
};

  const handleClearChat = async () => {
    try {
      setClearing(true);
      await API.delete(`/chat/clear/${matchId}`);
      
      setMessages([]);
      
      if (socket && socket.connected) {
        socket.emit('clear-chat', { matchId });
      }
      
      setShowClearChatModal(false);
    } catch (error) {
      console.error("Failed to clear chat:", error);
      alert("Failed to clear chat");
    } finally {
      setClearing(false);
    }
  };

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting");
      return;
    }

    try {
      setReporting(true);
      await API.post('/report/user', {
        reportedId: matchDetails?._id,
        reason: reportReason
      });
      
      setShowReportModal(false);
      setReportReason("");
      alert("User reported successfully. Our team will review this.");
    } catch (error) {
      console.error("Failed to report user:", error);
      alert("Failed to report user");
    } finally {
      setReporting(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      setBlocking(true);
      await API.post(`/profile/block/${matchDetails?._id}`);
      
      setShowBlockModal(false);
      alert("User blocked successfully. You will be redirected to matches.");
      navigate("/matches");
    } catch (error) {
      console.error("Failed to block user:", error);
      alert("Failed to block user");
    } finally {
      setBlocking(false);
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    alert("Message copied to clipboard!");
    setShowMessageOptions(null);
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
    setShowMessageOptions(null);
    inputRef.current?.focus();
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

  // Delete Modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <Trash2 size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">Delete Message?</h3>
        <p className="text-gray-500 text-center mb-6">This action cannot be undone.</p>
        
        <div className="space-y-3 mb-6">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium block">Delete for me</span>
              <p className="text-xs text-gray-500">Remove from your chat only</p>
            </div>
            <input
              type="radio"
              name="deleteOption"
              checked={!deleteForEveryone}
              onChange={() => setDeleteForEveryone(false)}
              className="w-5 h-5 text-pink-500"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <span className="font-medium block">Delete for everyone</span>
              <p className="text-xs text-gray-500">Remove for both users</p>
            </div>
            <input
              type="radio"
              name="deleteOption"
              checked={deleteForEveryone}
              onChange={() => setDeleteForEveryone(true)}
              className="w-5 h-5 text-pink-500"
            />
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteMessage}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Report Modal
  const ReportModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
          <Flag size={32} className="text-yellow-500" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">Report User</h3>
        <p className="text-gray-500 text-center mb-4">
          Why are you reporting {matchDetails?.fullName}?
        </p>
        
        <textarea
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          placeholder="Please describe the issue..."
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          rows="4"
        />
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowReportModal(false)}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleReportUser}
            disabled={reporting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/30 disabled:opacity-50"
          >
            {reporting ? <Loader size={18} className="animate-spin mx-auto" /> : 'Report'}
          </button>
        </div>
      </div>
    </div>
  );

  // Block Modal
  const BlockModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <Ban size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">Block User?</h3>
        <p className="text-gray-500 text-center mb-6">
          Are you sure you want to block {matchDetails?.fullName}? They won't be able to message you anymore.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowBlockModal(false)}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleBlockUser}
            disabled={blocking}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50"
          >
            {blocking ? <Loader size={18} className="animate-spin mx-auto" /> : 'Block'}
          </button>
        </div>
      </div>
    </div>
  );

  // Clear Chat Modal
  const ClearChatModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
          <MessageSquare size={32} className="text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">Clear Chat?</h3>
        <p className="text-gray-500 text-center mb-6">
          This will delete all messages in this conversation. This action cannot be undone.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowClearChatModal(false)}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleClearChat}
            disabled={clearing}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
          >
            {clearing ? <Loader size={18} className="animate-spin mx-auto" /> : 'Clear'}
          </button>
        </div>
      </div>
    </div>
  );

  // Profile Modal
// Profile Modal - Fixed Date Display
const ProfileModal = () => {
  // Format date safely
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Not available';
      }
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return 'Not available';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Profile</h3>
          <button
            onClick={() => setShowProfileModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl mx-auto mb-3 shadow-xl">
            {matchDetails?.fullName?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{matchDetails?.fullName}</h2>
          <p className="text-gray-500 text-sm">{matchDetails?.email}</p>
        </div>
        
        <div className="space-y-3">
          {otherUserProfile?.bio && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{otherUserProfile.bio}</p>
            </div>
          )}
          
          {otherUserProfile?.interests?.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {otherUserProfile.interests.map((interest, i) => (
                  <span key={i} className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">College</span>
              <span className="font-medium text-gray-800">
                {otherUserProfile?.college?.name || 'Not specified'}
              </span>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Member since</span>
              <span className="font-medium text-gray-800">
                {formatJoinDate(otherUserProfile?.createdAt)}
              </span>
            </div>
          </div>

          {/* Optional: Add more user info */}
          {otherUserProfile?.gender && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Gender</span>
                <span className="font-medium text-gray-800 capitalize">{otherUserProfile.gender}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowProfileModal(false)}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
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

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-gradient-to-b from-gray-50 to-pink-50/30 rounded-xl overflow-hidden relative">
      {/* Modals */}
      {showDeleteModal && <DeleteModal />}
      {showReportModal && <ReportModal />}
      {showBlockModal && <BlockModal />}
      {showClearChatModal && <ClearChatModal />}
      {showProfileModal && <ProfileModal />}

      {/* Chat Header with Enhanced UI */}
      <div className="bg-white/90 backdrop-blur-sm p-4 border-b flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/messages")}
            className="p-2 hover:bg-gray-100 rounded-full transition group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div 
            className="relative cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {matchDetails?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 
              className="font-semibold text-gray-800 cursor-pointer hover:text-pink-600 transition"
              onClick={() => setShowProfileModal(true)}
            >
              {matchDetails?.fullName}
            </h2>
            <p className="text-xs flex items-center gap-1">
              {otherUserTyping ? (
                <span className="text-pink-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
                  Typing...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Online
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <MoreVertical size={18} className="text-gray-600" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-slideDown">
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowProfileModal(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <User size={16} /> View Profile
              </button>
              
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowClearChatModal(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MessageSquare size={16} /> Clear Chat
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowReportModal(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
              >
                <Flag size={16} /> Report User
              </button>
              
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowBlockModal(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Ban size={16} /> Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/white-paper.png')]">
        {groupedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${index}`} className="flex justify-center">
                <span className="px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 shadow-sm">
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
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}
            >
{!isMe && (
  <div 
    className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-2 self-end mb-1 shadow-sm cursor-pointer"
    onClick={() => setShowProfileModal(true)}
  >
    {matchDetails?.profileImage ? (
      <img 
        src={matchDetails.profileImage} 
        alt={matchDetails.fullName}
        className="w-full h-full object-cover"
      />
    ) : (
      matchDetails?.fullName?.charAt(0).toUpperCase()
    )}
  </div>
)}
              
              <div className="relative max-w-[70%]">
                {/* Reply Indicator */}
                {msg.replyTo && (
                  <div className="mb-1 ml-2 text-xs text-gray-500 flex items-center gap-1">
                    <CornerDownRight size={12} />
                    <span>Replying to {msg.replyTo.sender === user?._id ? 'yourself' : matchDetails?.fullName}</span>
                  </div>
                )}
                
                {/* Message Bubble */}
                <div 
                  className={`rounded-2xl p-3 ${
                    isMe
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none shadow-lg shadow-pink-500/20'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="break-words text-[15px] leading-relaxed">{msg.content}</p>
                  
                  {/* Message Footer */}
                  <div className={`flex items-center justify-end gap-1 text-xs mt-1 ${
                    isMe ? 'text-pink-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      <span className="ml-1">
                        {msg.seen ? (
                          <div className="flex -space-x-1">
                            <CheckCheck size={14} className="text-blue-300" />
                          </div>
                        ) : (
                          <Check size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Actions - Show on hover */}
                <div className={`absolute ${isMe ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 px-2`}>
                  <button
                    onClick={() => handleReplyToMessage(msg)}
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
                    title="Reply"
                  >
                    <Reply size={14} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleCopyMessage(msg.content)}
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
                    title="Copy"
                  >
                    <Copy size={14} className="text-gray-600" />
                  </button>
                  {isMe && (
                    <button
                      onClick={() => {
                        setSelectedMessage(msg);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-2 shadow-sm">
              {matchDetails?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="bg-white rounded-2xl p-4 rounded-bl-none shadow-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Indicator */}
      {replyingTo && (
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <CornerDownRight size={16} className="text-pink-500" />
            <div className="flex-1">
              <p className="text-xs text-pink-500 font-medium">Replying to {replyingTo.sender === user?._id ? 'yourself' : matchDetails?.fullName}</p>
              <p className="text-sm text-gray-600 truncate">{replyingTo.content}</p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white/90 backdrop-blur-sm p-4 border-t relative">
        <form onSubmit={sendMessage} className="flex gap-2">
          <button 
            type="button" 
            className="p-2 text-gray-400 hover:text-pink-500 transition-colors rounded-full hover:bg-gray-100"
          >
            <Paperclip size={20} />
          </button>
          
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 transition-colors rounded-full hover:bg-gray-100 ${
                showEmojiPicker ? 'text-pink-500 bg-gray-100' : 'text-gray-400 hover:text-pink-500'
              }`}
            >
              <Smile size={20} />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50 shadow-xl">
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

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder={`Message ${matchDetails?.fullName}...`}
              className="w-full px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-2.5 rounded-full transition-all ${
              newMessage.trim() 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:opacity-90 hover:scale-105' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;