import React, { useState } from 'react';

const UserForm = ({ onSearch }) => {
    const [gender, setGender] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [partnerGender, setPartnerGender] = useState('');
    const [partnerAgeRange, setPartnerAgeRange] = useState('');
    const [selectedInterest, setSelectedInterest] = useState('');
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
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {error && <div className="mb-4 text-red-500 col-span-2">{error}</div>}
                
                {/* Пользователь */}
                <div className="flex flex-col gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Ваш пол:</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`w-full py-2 px-4 rounded-md ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Мужской
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`w-full py-2 px-4 rounded-md ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Женский
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Ваш возраст:</label>
                        <div className="flex flex-wrap gap-2">
                            {ageRanges.map((range) => (
                                <button
                                    key={range.value}
                                    type="button"
                                    onClick={() => setAgeRange(range.value)}
                                    className={`w-full py-2 px-4 rounded-md ${ageRange === range.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Ваши интересы:</label>
                        <div className="flex flex-wrap gap-2">
                            {interestsOptions.map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => setSelectedInterest(interest)}
                                    className={`w-full py-2 px-4 rounded-md ${selectedInterest === interest ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Собеседник */}
                <div className="flex flex-col gap-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Пол партнера:</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setPartnerGender('male')}
                                className={`w-full py-2 px-4 rounded-md ${partnerGender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Мужской
                            </button>
                            <button
                                type="button"
                                onClick={() => setPartnerGender('female')}
                                className={`w-full py-2 px-4 rounded-md ${partnerGender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                            >
                                Женский
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Возраст партнера:</label>
                        <div className="flex flex-wrap gap-2">
                            {ageRanges.map((range) => (
                                <button
                                    key={range.value}
                                    type="button"
                                    onClick={() => setPartnerAgeRange(range.value)}
                                    className={`w-full py-2 px-4 rounded-md ${partnerAgeRange === range.value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline col-span-2"
                >
                    Начать поиск
                </button>
            </form>
        </div>
    );
};

export default UserForm;
