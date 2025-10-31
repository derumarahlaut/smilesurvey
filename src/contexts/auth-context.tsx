"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isOperator: () => boolean;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default accounts
const DEFAULT_ACCOUNTS = [
  {
    id: 'admin',
    email: 'admin@smilesurvey.com',
    password: 'admin123',
    role: 'admin' as const,
    name: 'Administrator'
  },
  {
    id: 'pencatat1',
    email: 'pencatat1@smilesurvey.com',
    password: 'pencatat123',
    role: 'operator' as const,
    name: 'Pencatat 1'
  },
  {
    id: 'pencatat2',
    email: 'pencatat2@smilesurvey.com',
    password: 'pencatat123',
    role: 'operator' as const,
    name: 'Pencatat 2'
  },
  {
    id: 'pencatat3',
    email: 'pencatat3@smilesurvey.com',
    password: 'pencatat123',
    role: 'operator' as const,
    name: 'Pencatat 3'
  },
  {
    id: 'pencatat4',
    email: 'pencatat4@smilesurvey.com',
    password: 'pencatat123',
    role: 'operator' as const,
    name: 'Pencatat 4'
  },
  {
    id: 'pencatat5',
    email: 'pencatat5@smilesurvey.com',
    password: 'pencatat123',
    role: 'operator' as const,
    name: 'Pencatat 5'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('smilesurvey_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('smilesurvey_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get custom accounts from localStorage
    const customAccounts = localStorage.getItem('smilesurvey_accounts');
    let allAccounts = [...DEFAULT_ACCOUNTS];
    
    if (customAccounts) {
      try {
        const custom = JSON.parse(customAccounts);
        allAccounts = [...allAccounts, ...custom];
      } catch (error) {
        console.error('Error parsing custom accounts:', error);
      }
    }

    const account = allAccounts.find(acc => 
      acc.email === email && acc.password === password
    );

    if (account) {
      const userInfo: User = {
        id: account.id,
        email: account.email,
        role: account.role,
        name: account.name
      };
      
      setUser(userInfo);
      localStorage.setItem('smilesurvey_user', JSON.stringify(userInfo));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smilesurvey_user');
  };

  const isAdmin = () => user?.role === 'admin';
  const isOperator = () => user?.role === 'operator';
  const isAuthenticated = () => user !== null;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin,
      isOperator,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}