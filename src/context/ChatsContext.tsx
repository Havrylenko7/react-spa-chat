import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { AuthContext } from './AuthContext';

import { IChat } from '../types';

interface ChatsContextProps {
  chats: IChat[]
};

interface ChatsContextProviderProps {
  children: ReactNode
};

export const ChatsContext = createContext<ChatsContextProps>({ chats: [] });

export const ChatsContextProvider = ({ children } : ChatsContextProviderProps) => {
  const { currentUser } = useContext(AuthContext);
  const [chats, setChats] = useState<IChat[]>([]);

  const getChats = () => {
    const q = query(
      collection(db, 'chats'),
      where('users', 'array-contains', currentUser)
    );
    return onSnapshot(q, (querySnapshot) => {
      const dataArray = querySnapshot.docs.map(doc => doc.data());

      setChats(dataArray as IChat[])
    })
  };


  useEffect(() => {
    currentUser && getChats()
  }, [currentUser]);

  return (
    <ChatsContext.Provider value={{ chats }}>
      {children}
    </ChatsContext.Provider>
  )
}
