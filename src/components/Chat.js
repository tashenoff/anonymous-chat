import React, { useState, useEffect, useRef } from 'react';
import ConfirmationDialog from './ConfirmationDialog'; // Импортируйте компонент

// Имя для всех собеседников
const defaultName = 'Собеседник';

// Функция для определения цвета имени
const getNameColor = (gender) => {
  return gender === 'male' ? 'text-blue-400' : 'text-pink-400';
};

// Пример массива смайлов
const emojis = ['😀', '😂', '😎', '😍', '🥳', '😡', '🤔', '😢'];

const Chat = ({ user, partner, socket, onDisconnect }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isPartnerDisconnected, setIsPartnerDisconnected] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Состояние для модального окна

  const messageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

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
    setShowConfirmDialog(true); // Открываем диалоговое окно
  };

  const handleConfirmDisconnect = () => {
    socket.emit('userDisconnect');
    setIsDisconnected(true);
    setShowConfirmDialog(false); // Закрываем диалоговое окно
  };

  const handleCancelDisconnect = () => {
    setShowConfirmDialog(false); // Закрываем диалоговое окно
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="w-full mx-auto bg-gray-800 text-white shadow-md rounded-lg p-8">
      <div className='flex items-center justify-between p-5'>
        <h3 className="text-xl font-bold mb-4 text-red-400 uppercase">Chat Started</h3>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>

      <div className="h-72 overflow-y-scroll border border-gray-700 p-4 mb-4 rounded bg-gray-900">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 break-words">
            <strong className={getNameColor(msg.sender.gender)}>
              {defaultName}:
            </strong> {msg.message}
          </div>
        ))}
        {isTyping && typingUser && (
          <div className="italic text-gray-400">... {typingUser.name} is typing</div>
        )}
      </div>

      <div className="relative flex items-center space-x-2 mb-4">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
        >
          😀
        </button>
        {showEmojiPicker && (
          <div className="absolute bg-gray-800 border border-gray-700 p-2 rounded-md shadow-lg">
            {emojis.map((emoji, index) => (
              <span
                key={index}
                className="cursor-pointer text-2xl m-1"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
        <input
          id="messageInput"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isDisconnected || isPartnerDisconnected}
          className="flex-grow p-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring focus:border-blue-500 disabled:bg-gray-600"
        />
        <button
          onClick={sendMessage}
          disabled={isDisconnected || isPartnerDisconnected}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500"
        >
          Send
        </button>
      </div>

      {isDisconnected && (
        <div className="mt-4 text-red-400">
          You have been disconnected. <button onClick={handleDisconnect} className="underline">Reconnect</button>
        </div>
      )}

      {/* Добавляем диалоговое окно */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={handleCancelDisconnect}
        onConfirm={handleConfirmDisconnect}
      />
    </div>
  );
};

export default Chat;
