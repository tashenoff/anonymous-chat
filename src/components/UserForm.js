import React, { useState } from 'react';

const UserForm = ({ onSearch }) => {
    const [gender, setGender] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [partnerGender, setPartnerGender] = useState('');
    const [partnerAgeRange, setPartnerAgeRange] = useState('');
    const [selectedInterest, setSelectedInterest] = useState(''); // Инициализация состояния для интересов
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!gender || !ageRange || !partnerGender || !partnerAgeRange || !selectedInterest) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }

        setError('');
        const newUser = {
            gender,
            ageRange,
            partnerGender,
            partnerAgeRange,
            interest: selectedInterest,
        };

        onSearch(newUser);
    };

    const ageRanges = [
        { label: 'от 18 до 21', value: '18-21' },
        { label: 'от 22 до 25', value: '22-25' },
        { label: 'от 26 до 35', value: '26-35' },
        { label: 'старше 36', value: '36+' }
    ];

    const interestsOptions = [
        'Флирт', 
        'Поиск друга', 
        'Ролка'
    ];

    return (
        <div className='mx-5 h-full flex flex-col items-center justify-center'>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded-lg grid gap-4 p-8">
                {error && <div className="mb-4 text-red-500 col-span-2">{error}</div>}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">Ваш пол:</label>
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
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ageRange">Ваш возраст:</label>
                    <select
                        id="ageRange"
                        value={ageRange}
                        onChange={(e) => setAgeRange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Выберите возраст</option>
                        {ageRanges.map((range) => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="partnerGender">Пол партнера:</label>
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
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="partnerAgeRange">Возраст партнера:</label>
                    <select
                        id="partnerAgeRange"
                        value={partnerAgeRange}
                        onChange={(e) => setPartnerAgeRange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Выберите возраст партнера</option>
                        {ageRanges.map((range) => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="interestsRange">Ваши интересы:</label>
                    <select
                        id="interestsRange"
                        value={selectedInterest}
                        onChange={(e) => setSelectedInterest(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Выберите интерес</option>
                        {interestsOptions.map((interest) => (
                            <option key={interest} value={interest}>{interest}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Начать поиск
                </button>
            </form>
        </div>
    );
};

export default UserForm;
