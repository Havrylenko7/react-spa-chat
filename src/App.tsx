import React, { useContext } from 'react';
import './index.scss';

import Auth from './components/Auth';
import Chat from './components/Chat';

import { AuthContext } from './context/AuthContext';

const App: React.FC = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="appWrapper">
      {currentUser ? <Chat currentUser={currentUser} /> : <Auth /> }
    </div>
  );
}

export default App
