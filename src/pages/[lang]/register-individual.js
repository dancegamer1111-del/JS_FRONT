import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

const translations = {
  kz: {
    title: 'Жеке тұлға ретінде тіркелу',
    step1Title: '1-қадам: Жеке мәліметтер',
    step2Title: '2-қадам: Құжаттар',
    fullName: 'Толық аты-жөні:',
    address: 'Тіркелу мекенжайы:',
    personStatus: 'Мәртебе:',
    nextButton: 'Келесі',
    idDocument: 'Жеке куәлік суреті:',
    selfieWithId: 'Жеке куәлікпен селфи:',
    takePhotoButton: 'Фото түсіру',
    chooseFromGallery: 'Галереядан таңдау',
    registerButton: 'Тіркелу',
    loadingText: 'Күте тұрыңыз...',
    backButton: 'Артқа'
  },
  ru: {
    title: 'Регистрация физического лица',
    step1Title: 'Шаг 1: Персональные данные',
    step2Title: 'Шаг 2: Документы',
    fullName: 'ФИО:',
    address: 'Адрес прописки:',
    personStatus: 'Статус:',
    nextButton: 'Далее',
    idDocument: 'Фото удостоверения личности:',
    selfieWithId: 'Селфи с удостоверением:',
    takePhotoButton: 'Сделать фото',
    chooseFromGallery: 'Выбрать из галереи',
    registerButton: 'Зарегистрироваться',
    loadingText: 'Подождите...',
    backButton: 'Назад'
  }
};

const RegisterIndividual = () => {
  const router = useRouter();
  const { lang, phone } = router.query;
  const currentLang = lang && ['kz', 'ru'].includes(lang) ? lang : 'kz';
  const t = translations[currentLang] || translations.kz;

  const [currentStep, setCurrentStep] = useState(1); // Только 1 шаг теперь
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [personStatusId, setPersonStatusId] = useState('');

  // Reference data
  const [personStatuses, setPersonStatuses] = useState([]);

  useEffect(() => {
    loadPersonStatuses();

    // Если нет номера телефона в query, перенаправляем на логин
    if (!phone) {
      router.push(`/${currentLang}/login`);
    }
  }, [phone, currentLang, router]);

  const loadPersonStatuses = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/auth/person-statuses`);
      setPersonStatuses(response.data);
    } catch (error) {
      console.error('Error loading person statuses:', error);
    }
  };

  const formatPhoneNumber = (phoneStr) => {
    if (!phoneStr) return '';
    const phoneNumber = phoneStr.replace(/\D/g, '');
    if (phoneNumber.length <= 1) return `+${phoneNumber}`;
    if (phoneNumber.length <= 4) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1)}`;
    if (phoneNumber.length <= 7) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    if (phoneNumber.length <= 9) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };

  const registerIndividual = async () => {
    setLoading(true);
    setError(null);

    if (!fullName || !address || !personStatusId) {
      setError('Заполните все обязательные поля');
      setLoading(false);
      return;
    }

    try {
      const digitsOnly = phone.replace(/\D/g, '');

      const formData = new FormData();
      formData.append('phone_number', digitsOnly);
      formData.append('full_name', fullName);
      formData.append('address', address);
      formData.append('person_status_id', personStatusId);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/auth/register-individual`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);

      // Сохраняем токен для автоматической авторизации
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('phoneNumber', digitsOnly);
      }

      // Перенаправляем сразу на home
      setTimeout(() => {
        router.push(`/${currentLang}/home`);
      }, 2000);

    } catch (err) {
      console.error('Individual registration error:', err);
      setError(err.response?.data?.detail || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  // Icons
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mr-2 text-red-500">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mr-2 text-green-500">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  );

  return (
    <>
      <Head>
        <title>SARYARQA JASTARY - {t.title}</title>
        <meta name="description" content="Регистрация физического лица на платформе SARYARQA JASTARY" />
      </Head>

      <style jsx global>{`
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Regular.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Medium.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Semibold.ttf') format('truetype');
          font-weight: 600;
          font-style: normal;
        }
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="max-w-md w-full">

          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex items-center justify-center text-white mb-2">
                <UserIcon />
                <h1 className="ml-2 text-lg font-semibold tilda-font">
                  {t.step1Title}
                </h1>
              </div>
              <p className="text-center text-blue-100 text-sm tilda-font">
                Номер: {formatPhoneNumber(phone)}
              </p>
            </div>

            <div className="p-5">
              {/* Success message */}
              {success && (
                <div className="mb-4 flex items-center p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
                  <CheckIcon />
                  <span className="tilda-font">Регистрация прошла успешно! Перенаправляем на авторизацию...</span>
                </div>
              )}

              {/* Error message */}
              {error && !success && (
                <div className="mb-4 flex items-center p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                  <AlertIcon />
                  <span className="tilda-font">{error}</span>
                </div>
              )}

              {!success && (
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.fullName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                      placeholder="Алихан Нурланұлы Сейітов"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.address} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                      rows="2"
                      placeholder="г. Алматы, ул. Абая 123, кв. 45"
                    />
                  </div>

                  {/* Person Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.personStatus} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={personStatusId}
                      onChange={(e) => setPersonStatusId(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                    >
                      <option value="">Выберите статус</option>
                      {personStatuses.map(status => (
                        <option key={status.id} value={status.id}>
                          {currentLang === 'kz' ? status.name_kz : status.name_ru}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Register Button */}
                  <button
                    onClick={registerIndividual}
                    disabled={loading}
                    className={`w-full flex justify-center items-center rounded-lg px-4 py-2.5 font-medium text-white transition-all tilda-font ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                    }`}
                  >
                    {loading ? t.loadingText : t.registerButton}
                  </button>

                  {/* Back Button */}
                  <button
                    onClick={() => router.push(`/${currentLang}/login`)}
                    className="w-full mt-2 text-sm text-gray-600 hover:text-blue-600 tilda-font"
                  >
                    {t.backButton}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterIndividual;