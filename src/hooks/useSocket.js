// hooks/useSocket.js - Fixed Version
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log("No user, skipping socket connection");
      return;
    }

    const token = localStorage.getItem('token');
    console.log("🔌 Attempting socket connection...");
    
    // const newSocket = io('http://localhost:5000', {
        const newSocket = io('https://campus-backend-3axn.onrender.com', {

      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully! ID:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected. Reason:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect manually if server disconnected
        newSocket.connect();
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('connected', (data) => {
      console.log('✅ Server confirmed connection for user:', data.userId);
    });

    newSocket.on('message-sent', (data) => {
      console.log('✅ Message sent confirmation:', data);
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket...');
      newSocket.removeAllListeners();
      newSocket.disconnect();
      newSocket.close();
    };
  }, [user]);

  return socket;
};