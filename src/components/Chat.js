import React, { useState, useEffect } from 'react';

const Chat = ({ user, partner, socket, onDisconnect }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isPartnerDisconnected, setIsPartnerDisconnected] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  useEffect(() => {
    socket.on('message', (message) => {
      if (!isDisconnected) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    socket.on('typing', (sender) => {
      if (!isDisconnected && !isPartnerDisconnected) {
        setIsTyping(true);
        setTypingUser(sender);
      }
    });

    socket.on('stopTyping', () => {
      if (!isDisconnected && !isPartnerDisconnected) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    socket.on('partnerDisconnected', () => {
      setIsPartnerDisconnected(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: { gender: 'System' }, message: 'Partner has disconnected' }
      ]);
    });

    socket.on('disconnect', () => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: { gender: 'System' }, message: 'You have been disconnected' }
      ]);
      setIsDisconnected(true);
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('partnerDisconnected');
      socket.off('disconnect');
    };
  }, [socket, isDisconnected, isPartnerDisconnected]);

  useEffect(() => {
    const handleTyping = (e) => {
      if (!isDisconnected && !isPartnerDisconnected) {
        if (e.target.value) {
          socket.emit('typing', user);
        } else {
          socket.emit('stopTyping');
        }
      }
    };

    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
      messageInput.addEventListener('input', handleTyping);
      messageInput.addEventListener('blur', () => socket.emit('stopTyping')); // Handle when input loses focus
    }

    return () => {
      if (messageInput) {
        messageInput.removeEventListener('input', handleTyping);
        messageInput.removeEventListener('blur', () => socket.emit('stopTyping'));
      }
    };
  }, [user, socket, isDisconnected, isPartnerDisconnected]);

  const sendMessage = () => {
    if (isDisconnected || isPartnerDisconnected) return;
    if (message.trim() === '') return;
    const data = {
      message: message,
      sender: user,
      receiver: partner
    };
    socket.emit('message', data);
    setMessages((prevMessages) => [...prevMessages, data]);
    setMessage('');
    socket.emit('stopTyping');
  };

  const handleDisconnect = () => {
    socket.emit('userDisconnect');
    setIsDisconnected(true);
  };

  return (
    <div className="w-full mx-auto bg-white shadow-md rounded-lg p-8">
      <div className='flex items-center justify-between p-5'>
        <h3 className="text-xl font-bold mb-4 text-red-500 uppercase">Chat Started</h3>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>

      <div className="h-72 overflow-y-scroll border border-gray-300 p-4 mb-4 rounded">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.sender.gender === 'System' ? 'System' : msg.sender.name}:</strong> {msg.message}
          </div>
        ))}
        {isTyping && typingUser && (
          <div className="italic text-gray-500">... {typingUser.name} is typing</div>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <input
          id="messageInput"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isDisconnected || isPartnerDisconnected}
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 disabled:bg-gray-100"
        />
        <button
          onClick={sendMessage}
          disabled={isDisconnected || isPartnerDisconnected}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        >
          Send
        </button>
      </div>

      {isDisconnected && (
        <div className="mt-4 text-red-500">
          You have been disconnected. <button onClick={handleDisconnect} className="underline">Reconnect</button>
        </div>
      )}
    </div>
  );
};

export default Chat;
