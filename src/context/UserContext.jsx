import React, { createContext, useContext, useState } from 'react';
/* eslint-disable react-refresh/only-export-components */


const UserContext = createContext();

export const useUser = () => useContext(UserContext);

import { getSupabase } from '../lib/supabase';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('easeNotes_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('easeNotes_user');
  });

  const login = async (email, password) => {
    const supabase = getSupabase();

    if (supabase) {
      // Cloud Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error(error);
        alert(error.message); // Simple alert for specific error in this demo
        return false;
      }

      if (data.user) {
        const cloudUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${data.user.email}`
        };
        setUser(cloudUser);
        setIsAuthenticated(true);
        localStorage.setItem('easeNotes_user', JSON.stringify(cloudUser));
        return true;
      }
    } else {
      // Local "Simulation" Login
      const simulatedUser = {
        id: 'local-user', // Fixed ID for local mode
        name: email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
      };

      setUser(simulatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('easeNotes_user', JSON.stringify(simulatedUser));
      return true;
    }
    return false;
  };

  const signup = async (name, email, password) => {
    const supabase = getSupabase();

    if (supabase) {
      // Cloud Signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return false;
      }

      if (data.user) {
        const cloudUser = {
          id: data.user.id,
          email: data.user.email,
          name: name,
          avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`
        };
        setUser(cloudUser);
        setIsAuthenticated(true);
        localStorage.setItem('easeNotes_user', JSON.stringify(cloudUser));
        return true;
      }
    } else {
      // Local Simulation
      const newUser = {
        id: 'local-user',
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`,
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('easeNotes_user', JSON.stringify(newUser));
      return true;
    }
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('easeNotes_user');
  };

  const updateProfile = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('easeNotes_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};
