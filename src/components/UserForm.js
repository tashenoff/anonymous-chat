import React, { useState } from 'react';
import { ReactComponent as Logo } from '../logo.svg';
import backgroundImage from '../../src/bg.jpeg'; // Импортируйте изображение

const UserForm = ({ onSearch }) => {
    const [gender, setGender] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [partnerGender, setPartnerGender] = useState('');
    const [partnerAgeRange, setPartnerAgeRange] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form fields
        if (!gender || !ageRange || !partnerGender || !partnerAgeRange) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }

        setError(''); // Clear any existing errors

        const newUser = { gender, ageRange, partnerGender, partnerAgeRange };
        onSearch(newUser);
    };

    const ageRanges = [
        { label: 'от 18 до 21', value: '18-21' },
        { label: 'от 22 до 25', value: '22-25' },
        { label: 'от 26 до 35', value: '26-35' },
        { label: 'старше 36', value: '36+' }
    ];

    return (
        <div
            className='mx-5  h-full items-center justify-center flex flex-col'
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh' // чтобы фон занимал всю высоту экрана
            }}
        >
            <div className='mx-5'>
            
                <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded-lg grid gap-4 grid-cols-2 p-8">
                    {error && <div className="mb-4 text-red-500 col-span-2">{error}</div>}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                            Ваш пол:
                        </label>
                        <select
                            id="gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Выберите пол</option>
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ageRange">
                            Ваш возраст:
                        </label>
                        <select
                            id="ageRange"
                            value={ageRange}
                            onChange={(e) => setAgeRange(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Выберите возраст</option>
                            {ageRanges.map((range) => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="partnerGender">
                            Пол партнера:
                        </label>
                        <select
                            id="partnerGender"
                            value={partnerGender}
                            onChange={(e) => setPartnerGender(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Выберите пол партнера</option>
                            <option value="male">Мужской</option>
                            <option value="female">Женский</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="partnerAgeRange">
                            Возраст партнера:
                        </label>
                        <select
                            id="partnerAgeRange"
                            value={partnerAgeRange}
                            onChange={(e) => setPartnerAgeRange(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Выберите возраст партнера</option>
                            {ageRanges.map((range) => (
                                <option key={range.value} value={range.value}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full col-span-2 bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Начать поиск
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
