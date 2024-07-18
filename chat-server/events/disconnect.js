const fetch = require('node-fetch');
const { handlePartnerDisconnect } = require('./connection'); // Подключаем функцию для оповещения партнера

let users = []; // Массив пользователей

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

module.exports = { handleUserDisconnect };
