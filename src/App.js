import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import UserForm from './components/UserForm';
import Chat from './components/Chat';
import PuffLoader from 'react-spinners/PuffLoader';
import './index.css';
import backgroundImage from '../src/bg.jpeg'; // Импортируйте изображение

const socket = io('http://localhost:4000'); // Замените на URL вашего сервера Socket.IO

function App() {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);


  const handleSearch = (userData) => {
    console.log('Starting search with user data:', userData);
  
    socket.emit('join', userData);
    setUser(userData);
  };

  const handleCancelSearch = () => {
    console.log('Cancelling search...');
    socket.emit('userDisconnect');
    setUser(null);
   
  };

  const handleDisconnect = () => {
    console.log('Disconnecting user...');
    socket.emit('userDisconnect');
    setUser(null);
    setPartner(null); // Очищаем данные о партнере
  };

  useEffect(() => {
    socket.on('match', (partnerData) => {
      console.log('Match found:', partnerData);
      setPartner(partnerData);
     
    });

    socket.on('noMatch', () => {
      console.log('No match found');
    
    });

    socket.on('error', (error) => {
      console.error('Error:', error);
    
      alert(error.message);
    });

    // Очищаем слушатели событий
    return () => {
      socket.off('match');
      socket.off('noMatch');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    // Обрабатываем событие partnerDisconnected
    socket.on('partnerDisconnected', (userId) => {
      console.log('Partner disconnected:', userId);
      // Дополнительные действия при отключении партнера, если необходимо
      // Например, уведомления пользователю или другие манипуляции с интерфейсом
    });

    // Очищаем слушатель partnerDisconnected
    return () => {
      socket.off('partnerDisconnected');
    };
  }, []);

  return (
    <div className="App px-5  bg-gray-900 h-screen flex items-center justify-center"
    
    style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh' // чтобы фон занимал всю высоту экрана
  }}

    >
      {!user ? (
        <UserForm onSearch={handleSearch} />
      ) : !partner ? (
        <div className="flex bg-white flex-col items-center justify-center  rounded-lg ">
          <PuffLoader size={20} color="#3B82F6" loading={true} />
          <p className="mt-4 text-blue-500">Searching for a partner...</p>
          <button
            onClick={handleCancelSearch}
            className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >отменить поиск</button>
        </div>
      ) : (
        <div className='w-full container mx-auto mx-10'>
          <Chat user={user} partner={partner} socket={socket} onDisconnect={handleDisconnect} />
        </div>
      )}
    </div>
  );
}

export default App;
