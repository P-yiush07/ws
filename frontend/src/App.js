import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [socketId, setSocketId] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (buttonClicked) {
      const newSocket = io('http://localhost:5000'); // Replace with your server URL
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected with ID:', newSocket.id);
        setSocketId(newSocket.id);
      });

      newSocket.on('users', (connectedUsers) => {
        setUsers(connectedUsers);
      });

      newSocket.on('user connected', (user) => {
        setUsers((prevUsers) => [...prevUsers, user]);
      });

      newSocket.on('user disconnected', (userId) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      });

      newSocket.on('text updated', (newText) => {
        setText(newText);
      })

      return () => {
        newSocket.disconnect();
      };
    }
  }, [buttonClicked]);

  const handleClick = () => {
    setButtonClicked(true);
  };

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    socket.emit('text update', newText);
  };

  return (
    <div>
      {!buttonClicked ? (
        <button onClick={handleClick}>Start Chat</button>
      ) : (
        <InputBox users={users} socketId={socketId} text={text} handleChange={handleChange} />
      )}
    </div>
  );
};

const InputBox = ({ users, socketId, text, handleChange }) => {
  
  return (
    <div>
      <input type="text" value={text} onChange={handleChange} placeholder="Type a message..." />
      <button>Send</button>
      <div>Your Id: {socketId}</div>
      <div>
        <p>Connected Users:</p>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name} / ID: {user.id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
