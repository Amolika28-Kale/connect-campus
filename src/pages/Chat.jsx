// pages/Chat.jsx - Fully Mobile Responsive with Toast Messages
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
  Loader,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from "framer-motion";

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState(null);
  
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Typing timeout ref
  const typingTimeoutRef = useRef(null);

  // Show toast message
  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), duration);
  };

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get profile image URL with HTTPS support
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http')) {
      if (window.location.protocol === 'https:' && imagePath.startsWith('http://')) {
        return imagePath.replace('http://', 'https://');
      }
      return imagePath;
    }
    
    const baseUrl = 'https://campus-backend-3axn.onrender.com';
    
    if (imagePath.includes('uploads/')) {
      const cleanPath = imagePath.replace(/\\/g, '/');
      const filename = cleanPath.split('uploads/').pop();
      return `${baseUrl}/uploads/${filename}`;
    }
    
    return `${baseUrl}/uploads/profiles/${imagePath}`;
  };

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

    socket.emit('join-match', matchId);
    console.log("📢 Joined match room:", matchId);

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

    const handleMessageDeleted = ({ messageId, deleteForEveryone }) => {
      console.log("🗑️ Message deleted:", messageId, "forEveryone:", deleteForEveryone);
      
      setMessages(prevMessages => {
        if (deleteForEveryone) {
          return prevMessages.filter(m => m._id !== messageId);
        }
        return prevMessages;
      });
    };

    const handleChatCleared = ({ matchId }) => {
      console.log("🗑️ Chat cleared for match:", matchId);
      setMessages([]);
    };

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

    const handleMessagesSeen = ({ userId, matchId }) => {
      console.log(`👁️ Messages seen by ${userId} in match ${matchId}`);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sender !== user?._id ? { ...msg, seen: true } : msg
        )
      );
    };

    const handleUserClearedChat = ({ matchId, userId }) => {
      console.log(`👤 User ${userId} cleared chat for match ${matchId}`);
      showToast(`${matchDetails?.fullName || 'User'} cleared their chat`, 'info');
      fetchMessages();
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('chat-cleared', handleChatCleared);
    socket.on('user-typing', handleUserTyping);
    socket.on('messages-seen', handleMessagesSeen);
    socket.on('user-cleared-chat', handleUserClearedChat);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('chat-cleared', handleChatCleared);
      socket.off('user-typing', handleUserTyping);
      socket.off('messages-seen', handleMessagesSeen);
      socket.off('user-cleared-chat', handleUserClearedChat);
      
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
      
      await API.put(`/chat/seen/${matchId}`);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      showToast("Failed to load messages", "error");
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
        
        const profileImageUrl = getProfileImageUrl(otherUser?.profileImage);
        
        setMatchDetails({
          ...otherUser,
          profileImage: profileImageUrl
        });
        
        try {
          console.log("Fetching profile for user:", otherUser._id);
          const profileRes = await API.get(`/profile/${otherUser._id}`);
          
          if (profileRes.data.profileImage) {
            profileRes.data.profileImage = getProfileImageUrl(profileRes.data.profileImage);
          }
          
          console.log("Profile data received:", profileRes.data);
          setOtherUserProfile(profileRes.data);
        } catch (err) {
          console.error("Failed to fetch other user profile:", err);
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
        showToast("Message sent", "success");
      }).catch(err => {
        console.error("HTTP backup failed:", err);
        showToast("Failed to send message", "error");
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    if (selectedMessage._id.toString().startsWith('temp-')) {
      showToast("Cannot delete message while sending", "warning");
      setShowDeleteModal(false);
      setSelectedMessage(null);
      return;
    }

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
        
        setMessages(prev => prev.filter(m => m._id !== selectedMessage._id));
        showToast("Message deleted for everyone", "success");
      } else {
        console.log("Deleting for me:", selectedMessage._id);
        const response = await API.delete(`/chat/message/${selectedMessage._id}?forEveryone=false`);
        console.log("Delete response:", response.data);
        
        setMessages(prev => prev.filter(m => m._id !== selectedMessage._id));
        showToast("Message deleted", "success");
      }
      
      setShowDeleteModal(false);
      setSelectedMessage(null);
      setDeleteForEveryone(false);
    } catch (error) {
      console.error("Failed to delete message:", error);
      
      if (error.response?.status === 500 && 
          error.response?.data?.message?.includes('Cast to ObjectId')) {
        showToast("Cannot delete message that hasn't been sent yet", "warning");
        setMessages(prev => prev.filter(m => m._id !== selectedMessage._id));
      } else {
        showToast(error.response?.data?.message || "Failed to delete message", "error");
      }
      
      setShowDeleteModal(false);
      setSelectedMessage(null);
    }
  };

  const handleClearChat = async () => {
    try {
      setClearing(true);
      const response = await API.delete(`/chat/clear/${matchId}`);
      console.log("✅ Clear chat response:", response.data);
      
      setMessages([]);
      showToast("Chat cleared successfully", "success");
      
      setShowClearChatModal(false);
    } catch (error) {
      console.error("❌ Failed to clear chat:", error);
      showToast(error.response?.data?.message || "Failed to clear chat", "error");
    } finally {
      setClearing(false);
    }
  };

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      showToast("Please provide a reason for reporting", "warning");
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
      showToast("User reported successfully. Our team will review this.", "success");
    } catch (error) {
      console.error("Failed to report user:", error);
      showToast("Failed to report user", "error");
    } finally {
      setReporting(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      setBlocking(true);
      await API.post(`/profile/block/${matchDetails?._id}`);
      
      setShowBlockModal(false);
      showToast("User blocked successfully", "success");
      navigate("/matches");
    } catch (error) {
      console.error("Failed to block user:", error);
      showToast("Failed to block user", "error");
    } finally {
      setBlocking(false);
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    showToast("Message copied to clipboard!", "success");
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
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

  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  };

  // Toast Component
  const ToastMessage = () => {
    if (!toast) return null;
    
    const icons = {
      success: <CheckCircle className="text-green-500" size={20} />,
      error: <AlertCircle className="text-red-500" size={20} />,
      warning: <AlertTriangle className="text-yellow-500" size={20} />,
      info: <Info className="text-blue-500" size={20} />
    };

    const colors = {
      success: "border-green-500 bg-green-50",
      error: "border-red-500 bg-red-50",
      warning: "border-yellow-500 bg-yellow-50",
      info: "border-blue-500 bg-blue-50"
    };

    return (
      <AnimatePresence>
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-3 rounded-lg border-l-4 shadow-lg ${colors[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="text-sm font-medium text-gray-800">{toast.message}</p>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Mobile action buttons (touch optimized)
  const MobileMessageActions = ({ msg, isMe }) => (
    <div className="absolute -top-8 right-0 flex gap-1 bg-white rounded-full shadow-lg p-1 z-10">
      <button
        onClick={() => handleReplyToMessage(msg)}
        className="p-2 hover:bg-gray-100 rounded-full transition"
        title="Reply"
      >
        <Reply size={14} className="text-gray-600" />
      </button>
      <button
        onClick={() => handleCopyMessage(msg.content)}
        className="p-2 hover:bg-gray-100 rounded-full transition"
        title="Copy"
      >
        <Copy size={14} className="text-gray-600" />
      </button>
      {isMe && !msg._id.toString().startsWith('temp-') && (
        <button
          onClick={() => {
            setSelectedMessage(msg);
            setShowDeleteModal(true);
          }}
          className="p-2 hover:bg-red-50 rounded-full transition"
          title="Delete"
        >
          <Trash2 size={14} className="text-red-500" />
        </button>
      )}
    </div>
  );

  // Delete Modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn mx-4">
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
      <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fadeIn mx-4">
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
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn mx-4">
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
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn mx-4">
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
  const ProfileModal = () => {
    const formatJoinDate = (dateString) => {
      if (!dateString) return 'Not available';
      
      try {
        const date = new Date(dateString);
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
        <div className="bg-white rounded-3xl p-6 max-w-md w-full animate-fadeIn mx-4">
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
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 shadow-xl">
              {matchDetails?.profileImage && !imageErrors[matchDetails?._id] ? (
                <img 
                  src={matchDetails.profileImage} 
                  alt={matchDetails.fullName}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(matchDetails?._id)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-4xl">
                  {matchDetails?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
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
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-gray-50 to-pink-50/30 overflow-hidden">
      {/* Toast Message */}
      <ToastMessage />

      {/* Modals */}
      {showDeleteModal && <DeleteModal />}
      {showReportModal && <ReportModal />}
      {showBlockModal && <BlockModal />}
      {showClearChatModal && <ClearChatModal />}
      {showProfileModal && <ProfileModal />}

      {/* Chat Header - Mobile Optimized */}
      <div className="bg-white/90 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3 border-b flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <button 
            onClick={() => navigate("/messages")}
            className="p-2 hover:bg-gray-100 rounded-full transition group flex-shrink-0"
          >
            <ArrowLeft size={isMobile ? 20 : 22} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div 
            className="relative cursor-pointer flex-shrink-0"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shadow-md">
              {matchDetails?.profileImage && !imageErrors[matchDetails?._id] ? (
                <img 
                  src={matchDetails.profileImage} 
                  alt={matchDetails.fullName}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(matchDetails?._id)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-base md:text-lg">
                  {matchDetails?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h2 
              className="font-semibold text-gray-800 cursor-pointer hover:text-pink-600 transition truncate text-sm md:text-base"
              onClick={() => setShowProfileModal(true)}
            >
              {matchDetails?.fullName}
            </h2>
            <p className="text-[10px] md:text-xs flex items-center gap-1">
              {otherUserTyping ? (
                <span className="text-pink-500 flex items-center gap-1">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
                  Typing...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-500 rounded-full"></span>
                  Online
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <MoreVertical size={isMobile ? 20 : 22} className="text-gray-600" />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-slideDown">
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowProfileModal(true);
                }}
                className="w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <User size={14} /> View Profile
              </button>
              
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowClearChatModal(true);
                }}
                className="w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MessageSquare size={14} /> Clear Chat
              </button>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowReportModal(true);
                }}
                className="w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
              >
                <Flag size={14} /> Report User
              </button>
              
              <button
                onClick={() => {
                  setShowOptions(false);
                  setShowBlockModal(true);
                }}
                className="w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Ban size={14} /> Block User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-3 space-y-3 md:space-y-4">
        {groupedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${index}`} className="flex justify-center">
                <span className="px-3 py-1 md:px-4 md:py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-[10px] md:text-xs font-medium text-gray-600 shadow-sm">
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
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden mr-1 md:mr-2 self-end mb-1 shadow-sm cursor-pointer flex-shrink-0"
                  onClick={() => setShowProfileModal(true)}
                >
                  {matchDetails?.profileImage && !imageErrors[matchDetails?._id] ? (
                    <img 
                      src={matchDetails.profileImage} 
                      alt={matchDetails.fullName}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(matchDetails?._id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                      {matchDetails?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative max-w-[75%] md:max-w-[70%]">
                {/* Reply Indicator */}
                {msg.replyTo && (
                  <div className="mb-0.5 md:mb-1 ml-1 md:ml-2 text-[10px] md:text-xs text-gray-500 flex items-center gap-0.5 md:gap-1">
                    <CornerDownRight size={10} />
                    <span className="truncate max-w-[150px] md:max-w-[200px]">
                      Replying to {msg.replyTo.sender === user?._id ? 'yourself' : matchDetails?.fullName}
                    </span>
                  </div>
                )}
                
                {/* Message Bubble */}
                <div 
                  className={`rounded-2xl p-2 md:p-3 ${
                    isMe
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none shadow-md'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="break-words text-[13px] md:text-[15px] leading-relaxed">{msg.content}</p>
                  
                  {/* Message Footer */}
                  <div className={`flex items-center justify-end gap-0.5 md:gap-1 text-[10px] md:text-xs mt-0.5 md:mt-1 ${
                    isMe ? 'text-pink-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      <span className="ml-0.5">
                        {msg.seen ? (
                          <CheckCheck size={12} className="text-blue-300" />
                        ) : (
                          <Check size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Actions - Different for mobile/desktop */}
                {isMobile ? (
                  /* Mobile: Tap to show actions */
                  <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
                    <MobileMessageActions msg={msg} isMe={isMe} />
                  </div>
                ) : (
                  /* Desktop: Hover actions */
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
                    {isMe && !msg._id.toString().startsWith('temp-') && (
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
                )}
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden mr-1 md:mr-2 shadow-sm flex-shrink-0">
              {matchDetails?.profileImage && !imageErrors[matchDetails?._id] ? (
                <img 
                  src={matchDetails.profileImage} 
                  alt={matchDetails.fullName}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(matchDetails?._id)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                  {matchDetails?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl p-3 md:p-4 rounded-bl-none shadow-sm">
              <div className="flex gap-1 md:gap-1.5">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Indicator */}
      {replyingTo && (
        <div className="bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 border-t flex items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
            <CornerDownRight size={14} className="text-pink-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-pink-500 font-medium">Replying to {replyingTo.sender === user?._id ? 'yourself' : matchDetails?.fullName}</p>
              <p className="text-xs md:text-sm text-gray-600 truncate">{replyingTo.content}</p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-gray-100 rounded-full transition flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Message Input - Mobile Optimized */}
      <div className="bg-white/90 backdrop-blur-sm p-2 md:p-3 border-t relative">
        <form onSubmit={sendMessage} className="flex gap-1 md:gap-2 items-center">
          <button 
            type="button" 
            className="p-2 text-gray-400 hover:text-pink-500 transition-colors rounded-full hover:bg-gray-100 flex-shrink-0"
          >
            <Paperclip size={isMobile ? 18 : 20} />
          </button>
          
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 transition-colors rounded-full hover:bg-gray-100 flex-shrink-0 ${
                showEmojiPicker ? 'text-pink-500 bg-gray-100' : 'text-gray-400 hover:text-pink-500'
              }`}
            >
              <Smile size={isMobile ? 18 : 20} />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50 shadow-xl">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  autoFocusSearch={false}
                  theme="light"
                  width={isMobile ? 280 : 320}
                  height={isMobile ? 350 : 400}
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
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base rounded-full border border-gray-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all bg-gray-50 focus:bg-white"
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-2 md:p-2.5 rounded-full transition-all flex-shrink-0 ${
              newMessage.trim() 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:opacity-90 active:scale-95' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={isMobile ? 16 : 18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;