const {
    saveUserToDatabase,
    fetchUsersFromDatabase,
    updateUserInSearchStatus
  } = require('../utils/database');
  
  let users = [];
  
  const handleJoin = async (socket, user) => {
    console.log('User joined:', user);
  
    try {
      const savedUser = await saveUserToDatabase(user);
      const userId = savedUser.id;
      console.log('Saved user to database with ID:', userId);
  
      const newUser = { ...user, id: socket.id, userId, is_active: true, in_search: true };
      users.push(newUser);
      console.log('Current users:', users);
  
      findPartner(socket, newUser);
    } catch (error) {
      console.error('Error saving user to database:', error.message);
      socket.emit('error', { message: 'Error saving user to database' });
    }
  };


  const handlePartnerDisconnect = (io, partnerSocketId) => {
    const partner = users.find(u => u.id === partnerSocketId);
    if (partner) {
      // Отправляем событие о завершении сессии с ID отключившегося пользователя
      io.to(partnerSocketId).emit('partnerDisconnected');
      console.log(`Sent partnerDisconnected event to ${partnerSocketId}`);
    } else {
      console.log('Partner not found in local memory');
    }
  };


  
  const findPartner = async (socket, user) => {
    console.log('Searching for partner for user:', user);
    const criteria = { gender: user.partnerGender, ageRange: user.partnerAgeRange, is_active: true, in_search: true };
    console.log('Search criteria:', criteria);
  
    try {
      const allUsers = await fetchUsersFromDatabase();
      console.log('Fetched users from database:', allUsers);
  
      const filteredUsers = allUsers.filter(u =>
        u.id !== user.userId && u.attributes.is_active && u.attributes.in_search
      );
  
      const receiver = filteredUsers.find(u =>
        u.attributes.gender === criteria.gender &&
        u.attributes.ageRange === criteria.ageRange
      );
  
      if (receiver) {
        console.log('Partner found:', receiver);
        const receiverSocket = users.find(u => u.userId === receiver.id);
  
        if (receiverSocket) {
          const receiverSocketId = receiverSocket.id;
          console.log('Partner socket ID:', receiverSocketId);
  
          users = users.map(u => {
            if (u.id === user.id) {
              u.partnerSocketId = receiverSocketId;
              u.in_search = false;
            } else if (u.id === receiverSocketId) {
              u.partnerSocketId = user.id;
              u.in_search = false;
            }
            return u;
          });
  
          socket.to(receiverSocketId).emit('match', { ...user, id: user.id, userId: user.userId });
          socket.emit('match', { ...receiver.attributes, id: receiverSocketId, userId: receiver.id });
  
          const updatePromises = [user.userId, receiver.id].map(async userId => {
            try {
              await updateUserInSearchStatus(userId, false);
              console.log(`Updated in_search for user ${userId} to false in database`);
            } catch (error) {
              console.error('Error updating in_search in database:', error.message);
            }
          });
  
          await Promise.all(updatePromises);
          console.log('Successfully updated in_search in database for both users');
        } else {
          console.error('Receiver socket not found in local memory for ID:', receiver.id);
        }
      } else {
        console.log('No partner found for user:', user);
        socket.emit('noMatch');
      }
    } catch (error) {
      console.error('Error fetching users from database:', error.message);
    }
  };
  
  module.exports = {
    handleJoin,
    findPartner,
    handlePartnerDisconnect 
  };
  