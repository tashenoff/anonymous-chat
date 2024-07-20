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
        'Дружба', 
        'Ролка'
    ];

    return (
        <div className='lg:mx-5 flex h-full items-center justify-center '>
            <form onSubmit={handleSubmit} className="lg:max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-2 bg-gray-800 bg-opacity-50 backdrop-blur-lg shadow-md rounded-lg p-8 gap-4  lg:gap-6">
                {error && <div className="mb-4 text-red-500 col-span-2">{error}</div>}

                <div className="mb-4 w-full col-span-2 ">
                        <label className="block text-white text-sm font-bold mb-2">Ваши интересы:</label>
                        <div className=" grid grid-cols-3 gap-2 w-full">
                            
                            {interestsOptions.map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => setSelectedInterest(interest)}
                                    className={`lg:py-2 text-center px-6 w-full rounded-md ${selectedInterest === interest ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                
                {/* Пользователь */}
                <div className="flex flex-col">
                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2">Ваш пол:</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`w-full py-2 px-4 rounded-md ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                            >
                                Мужской
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`w-full py-2 px-4 rounded-md ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                            >
                                Женский
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2">Ваш возраст:</label>
                        <div className="flex flex-wrap gap-2">
                            {ageRanges.map((range) => (
                                <button
                                    key={range.value}
                                    type="button"
                                    onClick={() => setAgeRange(range.value)}
                                    className={`w-full py-2 px-4 rounded-md ${ageRange === range.value ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                

                {/* Собеседник */}
                <div className="flex flex-col">
                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2">Пол партнера:</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setPartnerGender('male')}
                                className={`w-full py-2 px-4 rounded-md ${partnerGender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                            >
                                Мужской
                            </button>
                            <button
                                type="button"
                                onClick={() => setPartnerGender('female')}
                                className={`w-full py-2 px-4 rounded-md ${partnerGender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                            >
                                Женский
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-white text-sm font-bold mb-2">Возраст партнера:</label>
                        <div className="flex flex-wrap gap-2">
                            {ageRanges.map((range) => (
                                <button
                                    key={range.value}
                                    type="button"
                                    onClick={() => setPartnerAgeRange(range.value)}
                                    className={`w-full py-2 px-4 rounded-md ${partnerAgeRange === range.value ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200'}`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>


                
          

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline col-span-2 hover:bg-blue-600"
                >
                    Начать поиск
                </button>
            </form>

       

        </div>
    );
};

export default UserForm;
