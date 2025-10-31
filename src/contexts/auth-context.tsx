"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'operator';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
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
    username: 'admin',
    password: 'Admin@123',
    role: 'admin' as const,
    name: 'Administrator'
  },
  {
    id: 'pencatat1',
    username: 'pencatat1',
    password: 'Pencatat@1',
    role: 'operator' as const,
    name: 'Pencatat 1'
  },
  {
    id: 'pencatat2',
    username: 'pencatat2',
    password: 'Pencatat@2',
    role: 'operator' as const,
    name: 'Pencatat 2'
  },
  {
    id: 'pencatat3',
    username: 'pencatat3',
    password: 'Pencatat@3',
    role: 'operator' as const,
    name: 'Pencatat 3'
  },
  {
    id: 'pencatat4',
    username: 'pencatat4',
    password: 'Pencatat@4',
    role: 'operator' as const,
    name: 'Pencatat 4'
  },
  {
    id: 'pencatat5',
    username: 'pencatat5',
    password: 'Pencatat@5',
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

  const login = async (username: string, password: string): Promise<boolean> => {
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
      acc.username === username && acc.password === password
    );

    if (account) {
      const userInfo: User = {
        id: account.id,
        username: account.username,
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