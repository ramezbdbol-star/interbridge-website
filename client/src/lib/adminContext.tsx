import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiRequest } from './queryClient';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verifySession();
  }, []);

  const getToken = () => {
    return localStorage.getItem('admin_token');
  };

  const verifySession = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setIsAdmin(data.valid);
    } catch (error) {
      console.error('Session verification failed:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/admin/login', { username, password });
      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('admin_token', data.token);
        setIsAdmin(true);
        return { success: true };
      }
      
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, login, logout, getToken }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
