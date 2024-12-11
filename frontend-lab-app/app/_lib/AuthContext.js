'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { app } from './firebase.js';
import { signOut } from 'firebase/auth'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log('zalogowany na poczatku');
      setUser(JSON.parse(storedUser));  // Ustawiamy użytkownika na podstawie localStorage
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Jeśli użytkownik jest zalogowany, zapisz dane w stanie i w localStorage
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // Jeśli nie ma użytkownika, wyczyść dane z localStorage
        setUser(null);
        localStorage.removeItem('user');
      }
    });


    return unsubscribe;
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

