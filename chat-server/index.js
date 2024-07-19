const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let users = []; // Массив пользователей

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', async (user) => {
    console.log('User joined:', user);

    // Убедимся, что interests всегда строка
    if (user.interest) {
      user.interests = user.interest;
    }

    // Сохранение пользователя в Strapi
    const response = await fetch('http://localhost:1337/api/chat-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: user }),
    });

    const savedUser = await response.json();
    if (!savedUser.data) {
      console.error('Error saving user to database:', savedUser);
      socket.emit('error', { message: 'Error saving user to database' });
      return;
    }

    const userId = savedUser.data.id;
    console.log('Saved user to database with ID:', userId);

    // Добавление пользователя в локальную память
    const newUser = { ...user, id: socket.id, userId, is_active: true, in_search: true };
    users.push(newUser);
    console.log('Current users:', users);

    // Автоматический запуск поиска партнера
    findPartner(newUser);
  });

  const findPartner = async (user) => {
    console.log('Searching for partner for user:', user);
    const criteria = {
        gender: user.partnerGender,
        ageRange: user.partnerAgeRange,
        interests: user.interests || '', // Убедимся, что interests всегда строка
        is_active: true,
        in_search: true
    };
    console.log('Search criteria:', criteria);

    // Получение всех пользователей из базы данных, кроме текущего пользователя
    const response = await fetch('http://localhost:1337/api/chat-users');
    const allUsers = await response.json();

    if (!allUsers.data) {
        console.error('Error fetching users from database:', allUsers);
        return;
    }

    console.log('Fetched users from database:', allUsers.data);

    // Исключение текущего пользователя и пользователей, которые не активны или не ищут партнера
    const filteredUsers = allUsers.data.filter(u =>
        u.id !== user.userId && u.attributes.is_active && u.attributes.in_search
    );

    const receiver = filteredUsers.find(u => {
        // Обработка null значений для interests
        const userInterests = u.attributes.interests || '';
        const hasMatchingInterest = criteria.interests.length > 0 &&
            criteria.interests === userInterests;

        return u.attributes.gender === criteria.gender &&
               u.attributes.ageRange === criteria.ageRange &&
               hasMatchingInterest;
    });

    if (receiver) {
        console.log('Partner found:', receiver);
        const receiverSocket = users.find(u => u.userId === receiver.id);

        if (receiverSocket) {
            const receiverSocketId = receiverSocket.id;
            console.log('Partner socket ID:', receiverSocketId);

            // Установка partnerSocketId для обоих пользователей
            users = users.map(u => {
                if (u.id === user.id) {
                    u.partnerSocketId = receiverSocketId;
                } else if (u.id === receiverSocketId) {
                    u.partnerSocketId = user.id;
                }
                return u;
            });

            // Отправка события match обоим пользователям
            io.to(user.id).emit('match', { ...receiver.attributes, id: receiverSocketId });
            io.to(receiverSocketId).emit('match', { ...user, id: user.id, userId: user.userId });

            // Обновление in_search на false для обоих пользователей в локальной памяти
            users = users.map(u => {
                if (u.id === user.id || u.id === receiverSocketId) {
                    u.in_search = false;
                }
                return u;
            });

            const updatePromises = [user.userId, receiver.id].map(async userId => {
                try {
                    const updateUserResponse = await fetch(`http://localhost:1337/api/chat-users/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            data: {
                                in_search: false
                            }
                        }),
                    });

                    if (!updateUserResponse.ok) {
                        const errorText = await updateUserResponse.text();
                        throw new Error(`Failed to update in_search for user ${userId} in database. Status: ${updateUserResponse.status} ${updateUserResponse.statusText}. Error: ${errorText}`);
                    }

                    const updatedUser = await updateUserResponse.json();
                    console.log(`Updated in_search for user ${userId} to false in database`);
                    return updatedUser;
                } catch (error) {
                    console.error('Error updating in_search in database:', error);
                    throw error; // Re-throw the error to handle it elsewhere if needed
                }
            });

            Promise.all(updatePromises)
                .then(() => {
                    console.log('Successfully updated in_search in database for both users');
                })
                .catch(error => {
                    console.error('Error updating in_search in database:', error);
                });
        } else {
            console.error('Receiver socket not found in local memory for ID:', receiver.id);
        }
    } else {
        console.log('No partner found for user:', user);
        io.to(user.id).emit('noMatch');
    }
};

  socket.on('message', async (data) => {
    console.log('Message received:', data);
    // Сохранение сообщения в Strapi
    await fetch('http://localhost:1337/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          message: data.message,
          sender: data.sender.userId,
          receiver: data.receiver.userId,
        },
      }),
    });

    io.to(data.receiver.id).emit('message', data);
  });

  // Обработчик отключения партнера
  const handlePartnerDisconnect = (partnerSocketId) => {
    const partner = users.find(u => u.id === partnerSocketId);
    if (partner) {
      // Отправляем событие о завершении сессии с ID отключившегося пользователя
      io.to(partnerSocketId).emit('partnerDisconnected');
      console.log(`Sent partnerDisconnected event to ${partnerSocketId}`);
    } else {
      console.log('Partner not found in local memory');
    }
  };

  // Обработчик отключения пользователя
  const handleUserDisconnect = async (socketId) => {
    console.log('Client disconnected:', socketId);

    // Находим пользователя в локальном массиве и удаляем его
    const index = users.findIndex(u => u.id === socketId);
    if (index !== -1) {
      const disconnectedUser = users[index];
      const partnerSocketId = disconnectedUser.partnerSocketId;

      users.splice(index, 1); // Удаляем пользователя из массива

      // Удаляем пользователя из базы данных Strapi
      try {
        const response = await fetch(`http://localhost:1337/api/chat-users/${disconnectedUser.userId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete user ${disconnectedUser.userId} from database. Status: ${response.status} ${response.statusText}`);
        }
        console.log(`Deleted user ${disconnectedUser.userId} from database`);
      } catch (error) {
        console.error('Error deleting user from database:', error);
      }

      console.log('Remaining users:', users);

      // Оповещение собеседника о завершении сессии, если есть партнер
      if (partnerSocketId) {
        handlePartnerDisconnect(partnerSocketId);
      }
    } else {
      console.log('User not found in local memory');
    }
  };

  // Обработчик отключения пользователя через интерфейс (userDisconnect)
  socket.on('userDisconnect', () => handleUserDisconnect(socket.id));

  // Обработчик отключения пользователя при закрытии браузера или вкладки (disconnect)
  socket.on('disconnect', () => handleUserDisconnect(socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
