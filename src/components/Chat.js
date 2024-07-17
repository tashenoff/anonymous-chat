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
        <div className="w-full mx-auto bg-white shadow-md rounded-lg p-8">
            <div className='flex items-center justify-between p-5'>
                <h3 className="text-xl font-bold mb-4">Диалог начсался</h3>
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
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isDisconnected || isPartnerDisconnected} // Disable input if user or partner is disconnected
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
                    You have been disconnected. <button onClick={() => setIsDisconnected(false)} className="underline text-blue-500">Find a new partner</button>
                </div>
            )}
            {isPartnerDisconnected && (
                <div className="mt-4 text-red-500">
                    Partner has disconnected. You cannot send messages.
                </div>
            )}
        </div>
    );
};

export default Chat;
