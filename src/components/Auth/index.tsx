import React, { useState } from 'react';
import './index.scss';

import { db, auth } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  UserCredential,
  User
} from 'firebase/auth';

const Auth: React.FC = () => {
  const [isSignedIn, setSignIn] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const signUp = async (email: string, password: string, userName: string) => {
    try {
      if (email && password && userName) {
        const register: UserCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user: User = register.user;
          
        await updateProfile(user, {
          displayName: userName
        });

        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, {
          id: user.uid,
          userName,
          email
        })
      }
    } catch (error) {
      console.error(error)
    }
  };
    
  const signIn = (email: string, password: string) => {
    signInWithEmailAndPassword(auth, email, password).catch((error) => {
      console.error(error)
    })
  };

  return (
    <div className="authWrapper">
      Chat
      <div className="inputContainer">
        <input
          placeholder="Email"
          type="text"
          onChange={e => setEmail(e.target.value)}
        />
        <input
          placeholder={isSignedIn ? 'Password' : 'Password (6 chars at least)'}
          type="text"
          onChange={e => setPassword(e.target.value)}
        />
        {!isSignedIn &&  
          <input
            placeholder="Your Name"
            type="text"
            onChange={e => setUserName(e.target.value)}
          />
        }
        <button
          onClick={() => 
            isSignedIn ? signIn(email, password) : signUp(email, password, userName)
          }
        >
          Sign {isSignedIn ? 'In' : 'Up'}
        </button>
        <button
          className="greyBtn"
          onClick={() => isSignedIn ? setSignIn(false) : setSignIn(true)}
        >
          {isSignedIn ? 'Sign Up' : 'Back'}
        </button>
      </div>
    </div>
  )
};

export default Auth
