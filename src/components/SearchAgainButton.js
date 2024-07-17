import React, { useState } from 'react';

const SearchAgainButton = ({ socket, user, partner, currentFilter, setCurrentFilter }) => {
  const [loading, setLoading] = useState(false);

  const handleSearchAgain = () => {
    setLoading(true);
    socket.emit('searchAgain', currentFilter); // Отправляем событие на сервер о поиске нового партнера с текущим фильтром
    setLoading(false);
  };

  return (
    <button onClick={handleSearchAgain} disabled={loading}>
      {loading ? 'Ищем...' : 'Искать еще'}
    </button>
  );
};

export default SearchAgainButton;
