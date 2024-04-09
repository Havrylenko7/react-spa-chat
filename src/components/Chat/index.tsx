import React, { useState, useContext, useEffect, useRef } from 'react';
import './index.scss';

import { db, auth } from '../../firebase';
import { setDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import { UsersContext } from '../../context/UsersContext';
import { ChatsContext } from '../../context/ChatsContext';

import { IChat, IUser } from '../../types';

interface ChatProps {
  currentUser: string
};

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<IChat | null>(null);
  const [text, setText] = useState<string>('');
  const [curChat, setCurChat] = useState<string>();
  const [availableUsers , setAvailableUsers] = useState<IUser[]>([]);
  const { users } = useContext(UsersContext);
  const { chats } = useContext(ChatsContext);

  const ref = useRef<HTMLDivElement>();

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

      ref.current.scrollTop = ref.current.scrollHeight
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

  useEffect(() => {
    const chat = chats.find(item => item.id === curChat);
    
    setMessages(chat as IChat)
  }, [chats]);

  useEffect(() => {
    filterUsers()
  }, [users, chats]);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
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
              <div className="messageContainer" ref={ref}>
                {messages?.messages && messages.messages.map(message =>
                  <div
                    key={message.id}
                    className="message"
                    style={{
                      backgroundColor: currentUser !== message.sender && '#535c68',
                      alignSelf: currentUser === message.sender && 'flex-end'
                    }}
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
