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

    const messagesEndRef = useRef(null);

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

    useEffect(() => {
        // Прокрутка к последнему сообщению
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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

    const handleFindAnother = () => {
        // Логика для поиска другого собеседника
        onDisconnect(); // Передайте логику поиска другого собеседника здесь
    };

    return (
        <div className="relative w-full mx-auto p-1 bg-gray-800 text-white shadow-md rounded-lg backdrop-blur-xl bg-opacity-30">
            <div className='flex items-center justify-between p-5'>
                <h3 className="text-xl font-bold mb-4 text-red-400 uppercase">Собеседник найден</h3>
                {(isPartnerDisconnected || isDisconnected) ? (
                    <button
                        onClick={handleFindAnother}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Найти другого
                    </button>
                ) : (
                    <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                        Отключиться
                    </button>
                )}
            </div>

            <div className="h-72 overflow-y-scroll border border-gray-700 p-4 mb-4 rounded bg-gray-900 flex flex-col">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 ${msg.sender === user ? 'bg-blue-500' : 'bg-gray-700'} p-2 rounded-md inline-block`}
                        style={{
                            display: 'inline-block',
                            maxWidth: 'fit-content', // Сообщение выделяется только по своему содержимому
                            wordBreak: 'break-word', // Перенос длинных слов
                        }}
                    >
                        <strong className={getNameColor(msg.sender.gender)}>
                            {msg.sender === user ? 'Вы' : defaultName}:
                        </strong> {msg.message}
                    </div>
                ))}
                {isTyping && typingUser && (
                    <div className="italic text-gray-400">... {typingUser.name} печатает</div>
                )}
                <div ref={messagesEndRef} /> {/* Элемент для прокрутки */}
            </div>

            <div className="grid grid-cols-5 items-center gap-3 mb-4">
                <div className='flex relative col-span-4 bg-gray-800 rounded-r-full'>
                    <input
                        id="messageInput"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isDisconnected || isPartnerDisconnected}
                        className="flex-grow p-2 border text-white border-none bg-gray-800 focus:outline-none focus:ring focus:border-blue-500 disabled:bg-gray-600"
                    />

                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="px-4 py-2 text-white rounded-full"
                    >
                        😀
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bg-gray-800 -top-20 lg:-top-12 right-10 border border-gray-700 p-2 rounded-md shadow-lg">
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

                </div>
                <button
                    onClick={sendMessage}
                    disabled={isDisconnected || isPartnerDisconnected}
                    className="px-4 py-2 col-span-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500"
                >
                    Отправить
                </button>
            </div>

            {isDisconnected && (
                <div className="mt-4 text-red-400">
                    Вы были отключены. <button onClick={handleFindAnother} className="underline">Переподключиться</button>
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
