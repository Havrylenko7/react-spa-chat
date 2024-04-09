import React, { createContext, useState, useEffect, ReactNode } from 'react';

import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

import { IUser } from '../types';

interface UsersContextType {
  users: IUser[]
};

interface UsersContextProviderProps {
  children: ReactNode
};

export const UsersContext = createContext<UsersContextType>({ users: [] });

export const UsersContextProvider = ({ children } : UsersContextProviderProps) => {
  const [users, setUsers] = useState<IUser[]>([]);

  const getUsers = () => {
    return onSnapshot(collection(db, 'users'), (querySnapshot) => {
      const userData = querySnapshot.docs.map(doc => doc.data());
      setUsers(userData as IUser[])
    })
  };

  useEffect(() => {
    getUsers()
  }, []);

  return (
    <UsersContext.Provider value={{ users }}>
      {children}
    </UsersContext.Provider>
  )
}
