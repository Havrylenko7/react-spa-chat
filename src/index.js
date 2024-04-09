import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';

import App from './App.tsx';
import { UsersContextProvider } from './context/UsersContext';
import { AuthContextProvider } from './context/AuthContext';
import { ChatsContextProvider } from './context/ChatsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthContextProvider>
    <ChatsContextProvider>
      <UsersContextProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </UsersContextProvider>
    </ChatsContextProvider>
  </AuthContextProvider>
)
