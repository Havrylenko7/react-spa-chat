import React, { useState, useContext, useEffect, useRef } from 'react';
import './index.scss';

import { db, auth, storage } from '../../firebase';
import { setDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { UsersContext } from '../../context/UsersContext';
import { ChatsContext } from '../../context/ChatsContext';

import { IChat, IUser } from '../../types';

interface ChatProps {
  currentUser: string
};

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<IChat | null>(null);
  const [text, setText] = useState<string>('');
  const [curChat, setCurChat] = useState<string>('');
  const [availableUsers , setAvailableUsers] = useState<IUser[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentFileURL, setCurrentFileURL] = useState<string | null>('');
  const { users } = useContext(UsersContext);
  const { chats } = useContext(ChatsContext);

  const screenRef = useRef<HTMLDivElement>();
  const inputRef = useRef<HTMLInputElement>(); 

  const signOutFunc = () => {
    signOut(auth).then(() => {
      window.location.reload()
    }).catch((error) => {
      console.error(error)
    });
  };

  const findUserById = (id: string) => {
    return users.find(user => user.id === id)
  };

  const removeCurrentUser = (chatUsers: string[]) => {
    const id = chatUsers.filter(user => currentUser !== user && user).toString();

    return findUserById(id)
  };

  const openChat = async (data: IChat) => {
    const docRef = doc(db, 'chats', data.id);
    try {
      await updateDoc(docRef, { unread: false })
    } catch (error) {
      console.error(error)
    }

    setMessages(data);
    setCurChat(data.id)
  }
  
  const send = async (chat: IChat) => {
    const unread = chat.users.filter(
      user => currentUser !== user && user
    ).toString();

    const docRef = doc(db, 'chats', chat.id);
    try {
      if (!!text) {
        await updateDoc(docRef, {
          unread,
          messages: arrayUnion({
            text: text,
            sender: currentUser,
            id: chat.messages.length
          })
        });

        setText('')
      }

      if (currentFile) {
        const fileToken = Math.random().toString(36).substr(2);
        const storageRef = ref(storage, fileToken);
        
        uploadBytes(storageRef, currentFile);
        
        await updateDoc(docRef, {
          unread,
          messages: arrayUnion({
            text: currentFile.name,
            sender: currentUser,
            id: !!text ? chat.messages.length + 1 : chat.messages.length,
            fileId: fileToken
          })
        });

        setCurrentFile(null)
      }

      screenRef.current.scrollTop = screenRef.current.scrollHeight
    } catch (error) {
      console.error(error)
    }
  }

  const openFile = async (id: string) => {
    const storageRef = ref(storage, id);

    try {
      const url = await getDownloadURL(storageRef);
      window.open(url, "_blank")
    } catch (error) {
      console.error(error)
    }
  }

  const createChat = async (sender: string, receiver: string) => {
    const docRef = doc(db, 'chats', sender + receiver);
    try {
      await setDoc(docRef, {
        id: sender + receiver,
        users: [sender, receiver],
        messages: [],
        unread: false
      })
    } catch (error) {
      console.error(error)
    }
  };

  const filterUsers = () => {
    const ar = [];
    chats.map(item => ar.push(...item.users));
    const filtered = users.filter(user => !ar.includes(user.id));

    setAvailableUsers(filtered as IUser[])
  };

  const toggleClip = () => {
    if (currentFile) {
      window.open(currentFileURL, "_blank")
    } else {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fileUrl = URL.createObjectURL(file);

    inputRef.current.value = null;
    setCurrentFile(file);
    setCurrentFileURL(fileUrl);
  };

  useEffect(() => {
    const chat = chats.find(item => item.id === curChat);
    
    setMessages(chat as IChat)
  }, [chats]);

  useEffect(() => {
    filterUsers()
  }, [users, chats]);

  useEffect(() => {
    if (screenRef.current) screenRef.current.scrollTop = screenRef.current.scrollHeight
  }, [messages]);

  return (
    <div className="chatWrapper">
      <div className="chatsContainer">
        <div className="currentUserContainer">
          {findUserById(currentUser)?.userName}
          <button className="signOutBtn" onClick={() => signOutFunc()}>Sign Out</button>
        </div>

        {availableUsers[0] &&
          <select
            value=""
            onChange={e => createChat(currentUser, e.target.value)}
          >
            <option value="" selected disabled hidden>New chat with...</option>
            {availableUsers && availableUsers.map(user => user.id !== currentUser &&
              <option
                key={user.id}
                value={user.id}
              >
                {user.userName}
              </option>
            )}
          </select>
        }

        <div className="chatsListContainer">
          {chats && chats.map(chat => 
            <div
              key={chat.id}
              className="chat"
              onClick={() => openChat(chat)}
              style={{ outline: chat.unread === currentUser && '1px solid #dff9fb' }}
            >
              {removeCurrentUser(chat.users)?.userName}
              {chat.unread === currentUser && <p>New massage</p>}
            </div>
          )}
        </div>
      </div>

      <div
        className="currentChatContainer"
        style={{ justifyContent: !messages && 'center' }}
      >
        {messages ?
          <>
            <div className="userWrapper">
              {removeCurrentUser(messages.users)?.userName}
            </div>

            <div className="messagesContainer">
              <div className="messageContainer" ref={screenRef}>
                {messages?.messages && messages.messages.map(message =>
                  <div
                    key={message.id}
                    className="message"
                    style={{
                      backgroundColor: currentUser !== message.sender && '#535c68',
                      alignSelf: currentUser === message.sender && 'flex-end',
                      textDecoration: message.fileId && 'underline',
                      cursor: message.fileId && 'pointer'
                    }}
                    onClick={() => message.fileId && openFile(message.fileId)}
                  >
                    {message.text}
                  </div>
                )}
              </div>

              <div className="inputContainer">
                <input 
                  type="text"
                  placeholder="Message"
                  onChange={e => setText(e.target.value)}
                  value={text}
                />
                <div>
                  <div 
                    className="clipBtn"
                    onClick={() => toggleClip()}
                  >
                    <input 
                      type="file"
                      onChange={e => handleFileChange(e)}
                      ref={inputRef}
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div
                    className="tooltip"
                    style={{ display: !currentFile && 'none' }}
                  >
                    Added!
                  </div>
                </div>
                <button onClick={() => send(messages)}>Send</button>
              </div>
            </div>
          </>
        : 
          <p>Select Chat</p>
        }
      </div>
    </div>
  )
};

export default Chat
