// utils/environment.js - Environment detection utility
export const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

export const getBaseUrl = () => {
  return isDevelopment() 
    ? 'http://localhost:5000'
    : 'https://campus-backend-3axn.onrender.com';
};

export const getSecureUrl = (path) => {
  if (!path) return null;
  
  if (path.startsWith('http')) {
    // In production, ensure HTTPS
    if (!isDevelopment() && path.startsWith('http://')) {
      // Don't upgrade localhost URLs, replace them
      if (path.includes('localhost')) {
        const filename = path.split('/').pop();
        return `${getBaseUrl()}/uploads/profiles/${filename}`;
      }
      return path.replace('http://', 'https://');
    }
    return path;
  }
  
  const baseUrl = getBaseUrl();
  const cleanPath = path.replace(/\\/g, '/');
  
  if (cleanPath.includes('uploads/')) {
    const filename = cleanPath.split('uploads/').pop();
    return `${baseUrl}/uploads/${filename}`;
  }
  
  return `${baseUrl}/uploads/profiles/${cleanPath}`;
};