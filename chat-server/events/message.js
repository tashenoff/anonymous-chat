const { saveMessageToDatabase } = require('../utils/database');

const handleMessage = async (io, data) => {
  console.log('Message received:', data);

  try {
    await saveMessageToDatabase({
      message: data.message,
      sender: data.sender.userId,
      receiver: data.receiver.userId,
    });
    io.to(data.receiver.id).emit('message', data);
  } catch (error) {
    console.error('Error saving message to database:', error.message);
  }
};

module.exports = {
  handleMessage,
};
