import React, { createContext, useState, useEffect, ReactNode } from 'react';

import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextProps {
  currentUser: string | undefined
};

interface ChatsContextProviderProps {
  children: ReactNode
};

export const AuthContext = createContext<AuthContextProps>({ currentUser: undefined });

export const AuthContextProvider = ({ children } : ChatsContextProviderProps) => {
  const [currentUser, setCurrentUser] = useState<string | undefined>();

  const authState = onAuthStateChanged(auth, (user) => {
    if (user) {
      const id = user.uid;
      
      setCurrentUser(id)
    } 
  });

  useEffect(() => {
    return () => {
      authState()
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}
