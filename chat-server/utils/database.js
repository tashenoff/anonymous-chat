const fetch = require('node-fetch');

const saveUserToDatabase = async (user) => {
  const response = await fetch('http://localhost:1337/api/chat-users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: user }),
  });

  const savedUser = await response.json();
  if (!savedUser.data) {
    throw new Error(`Error saving user to database: ${JSON.stringify(savedUser)}`);
  }

  return savedUser.data;
};

const fetchUsersFromDatabase = async () => {
  const response = await fetch('http://localhost:1337/api/chat-users');
  const allUsers = await response.json();

  if (!allUsers.data) {
    throw new Error(`Error fetching users from database: ${JSON.stringify(allUsers)}`);
  }

  return allUsers.data;
};

const updateUserInSearchStatus = async (userId, inSearch) => {
  const response = await fetch(`http://localhost:1337/api/chat-users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        in_search: inSearch
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update in_search for user ${userId} in database. Status: ${response.status} ${response.statusText}. Error: ${errorText}`);
  }

  const updatedUser = await response.json();
  return updatedUser;
};

const deleteUserFromDatabase = async (userId) => {
  const response = await fetch(`http://localhost:1337/api/chat-users/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user ${userId} from database. Status: ${response.status} ${response.statusText}`);
  }

  return response;
};

const saveMessageToDatabase = async (message) => {
  await fetch('http://localhost:1337/api/chats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: message,
    }),
  });
};

module.exports = {
  saveUserToDatabase,
  fetchUsersFromDatabase,
  updateUserInSearchStatus,
  deleteUserFromDatabase,
  saveMessageToDatabase,
};
