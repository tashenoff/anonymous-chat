import React, { useState, useEffect } from 'react';

const Chat = ({ user, partner, socket }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isPartnerDisconnected, setIsPartnerDisconnected] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  useEffect(() => {
    // Handler for new messages
    socket.on('message', (message) => {
      if (!isDisconnected) { // Check if user is not disconnected
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Handler for partner disconnect
    socket.on('partnerDisconnected', () => {
        console.log('Partner disconnected');
      setIsPartnerDisconnected(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: { gender: 'System' }, message: 'Partner has disconnected' }
      ]);
    });

    // Handler for user disconnecting from chat
    socket.on('disconnect', () => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: { gender: 'System' }, message: 'You have been disconnected' }
      ]);
      setIsDisconnected(true); // Устанавливаем флаг отключения пользователя
    });

    return () => {
      // Unsubscribe from events when component unmounts
      socket.off('message');
      socket.off('partnerDisconnected');
      socket.off('disconnect');
    };
  }, [socket, isDisconnected]);

  const sendMessage = () => {
    if (isDisconnected || isPartnerDisconnected) return; // Prevent sending messages if user or partner is disconnected
    if (message.trim() === '') return;
    const data = {
      message: message,
      sender: user,
      receiver: partner
    };
    socket.emit('message', data);
    setMessages((prevMessages) => [...prevMessages, data]);
    setMessage('');
  };

  // Функция для обработки нажатия кнопки Disconnect
  const handleDisconnect = () => {
    // Отправляем событие 'userDisconnect' на сервер
    socket.emit('userDisconnect');
    setIsDisconnected(true); // Устанавливаем флаг отключения пользователя
  };

  return (
    <div>
      <h3>Chat with {partner.name}</h3>
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender.gender === 'System' ? 'System' : msg.sender.name}: </strong>{msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isDisconnected || isPartnerDisconnected} // Disable input if user or partner is disconnected
      />
      <button onClick={sendMessage} disabled={isDisconnected || isPartnerDisconnected}>Send</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      {isDisconnected && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          You have been disconnected. <button onClick={() => setIsDisconnected(false)}>Find a new partner</button>
        </div>
      )}
      {isPartnerDisconnected && (
        <div style={{ color: 'red', marginTop: '10px' }}>Partner has disconnected. You cannot send messages.</div>
      )}
    </div>
  );
};

export default Chat;
