import React, { useState } from 'react';

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

    const handleGenderSelect = (selectedGender) => {
        setGender(selectedGender);
    };

    const handlePartnerGenderSelect = (selectedGender) => {
        setPartnerGender(selectedGender);
    };

    const handleAgeRangeSelect = (selectedAgeRange) => {
        setAgeRange(selectedAgeRange);
    };

    const handlePartnerAgeRangeSelect = (selectedAgeRange) => {
        setPartnerAgeRange(selectedAgeRange);
    };

    return (
        <div className='mx-5 h-full items-center justify-center flex flex-col'>
            <div className='mx-5'>
                <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded-lg p-8">
                    {error && <div className="mb-4 text-red-500">{error}</div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Ваш пол:
                            </label>
                            <div className="flex space-x-2 mb-4">
                                <button
                                    type="button"
                                    className={`w-full p-2 border border-gray-300 rounded-md ${gender === 'male' ? 'bg-blue-500 text-white' : ''}`}
                                    onClick={() => handleGenderSelect('male')}
                                >
                                    Мужской
                                </button>
                                <button
                                    type="button"
                                    className={`w-full p-2 border border-gray-300 rounded-md ${gender === 'female' ? 'bg-pink-500 text-white' : ''}`}
                                    onClick={() => handleGenderSelect('female')}
                                >
                                    Женский
                                </button>
                            </div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Ваш возраст:
                            </label>
                            <div className="flex flex-col space-y-2 mb-4">
                                {ageRanges.map((range) => (
                                    <button
                                        key={range.value}
                                        type="button"
                                        className={`w-full p-2 border border-gray-300 rounded-md ${ageRange === range.value ? 'bg-blue-500 text-white' : ''}`}
                                        onClick={() => handleAgeRangeSelect(range.value)}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Пол партнера:
                            </label>
                            <div className="flex space-x-2 mb-4">
                                <button
                                    type="button"
                                    className={`w-full p-2 border border-gray-300 rounded-md ${partnerGender === 'male' ? 'bg-blue-500 text-white' : ''}`}
                                    onClick={() => handlePartnerGenderSelect('male')}
                                >
                                    Мужской
                                </button>
                                <button
                                    type="button"
                                    className={`w-full p-2 border border-gray-300 rounded-md ${partnerGender === 'female' ? 'bg-pink-500 text-white' : ''}`}
                                    onClick={() => handlePartnerGenderSelect('female')}
                                >
                                    Женский
                                </button>
                            </div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Возраст партнера:
                            </label>
                            <div className="flex flex-col space-y-2 mb-4">
                                {ageRanges.map((range) => (
                                    <button
                                        key={range.value}
                                        type="button"
                                        className={`w-full p-2 border border-gray-300 rounded-md ${partnerAgeRange === range.value ? 'bg-blue-500 text-white' : ''}`}
                                        onClick={() => handlePartnerAgeRangeSelect(range.value)}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Начать поиск
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
