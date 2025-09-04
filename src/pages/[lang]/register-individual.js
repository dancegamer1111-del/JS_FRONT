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

  const [currentStep, setCurrentStep] = useState(1); // 1 или 2
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [personStatusId, setPersonStatusId] = useState('');
  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

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

  const goToNextStep = () => {
    setError(null);

    if (!fullName || !address || !personStatusId) {
      setError('Заполните все обязательные поля');
      return;
    }

    setCurrentStep(2);
  };

  const registerIndividual = async () => {
    setLoading(true);
    setError(null);

    if (!idDocumentFile || !selfieFile) {
      setError('Загрузите все необходимые документы');
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
      formData.append('id_document_photo', idDocumentFile);
      formData.append('selfie_with_id_photo', selfieFile);

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

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер файла не должен превышать 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Файл должен быть изображением');
        return;
      }

      setter(file);
      setError(null);
    }
  };

  const takePhoto = (setter) => {
    // Создаем скрытый input для камеры
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Задняя камера для документов
    input.onchange = (e) => handleFileChange(e, setter);
    input.click();
  };

  const takeSelfie = (setter) => {
    // Создаем скрытый input для селфи
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user'; // Передняя камера для селфи
    input.onchange = (e) => handleFileChange(e, setter);
    input.click();
  };

  const chooseFromGallery = (setter) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFileChange(e, setter);
    input.click();
  };

  // Icons
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="3"></circle>
    </svg>
  );

  const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="9" cy="9" r="2"></circle>
      <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
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
                  {currentStep === 1 ? t.step1Title : t.step2Title}
                </h1>
              </div>
              <p className="text-center text-blue-100 text-sm tilda-font">
                Номер: {formatPhoneNumber(phone)}
              </p>

              {/* Step indicator */}
              <div className="flex justify-center mt-3">
                <div className="flex space-x-2">
                  <div className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-white' : 'bg-blue-300'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-white' : 'bg-blue-300'}`}></div>
                </div>
              </div>
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
                <>
                  {/* Step 1: Personal Data */}
                  {currentStep === 1 && (
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
                          placeholder="Иванов Иван Иванович"
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

                      {/* Next Button */}
                      <button
                        onClick={goToNextStep}
                        className="w-full flex justify-center items-center rounded-lg px-4 py-2.5 font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md transition-all tilda-font"
                      >
                        {t.nextButton}
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

                  {/* Step 2: Documents */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      {/* ID Document Photo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.idDocument} <span className="text-red-500">*</span>
                        </label>

                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => takePhoto(setIdDocumentFile)}
                              className="flex-1 flex items-center justify-center p-2.5 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm tilda-font"
                            >
                              <CameraIcon />
                              {t.takePhotoButton}
                            </button>
                            <button
                              onClick={() => chooseFromGallery(setIdDocumentFile)}
                              className="flex-1 flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm tilda-font"
                            >
                              <ImageIcon />
                              {t.chooseFromGallery}
                            </button>
                          </div>

                          {idDocumentFile && (
                            <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-700 flex items-center tilda-font">
                                <CheckIcon />
                                Файл выбран: {idDocumentFile.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selfie with ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.selfieWithId} <span className="text-red-500">*</span>
                        </label>

                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => takeSelfie(setSelfieFile)}
                              className="flex-1 flex items-center justify-center p-2.5 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm tilda-font"
                            >
                              <CameraIcon />
                              Селфи
                            </button>
                            <button
                              onClick={() => chooseFromGallery(setSelfieFile)}
                              className="flex-1 flex items-center justify-center p-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm tilda-font"
                            >
                              <ImageIcon />
                              {t.chooseFromGallery}
                            </button>
                          </div>

                          {selfieFile && (
                            <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-700 flex items-center tilda-font">
                                <CheckIcon />
                                Файл выбран: {selfieFile.name}
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-gray-500 text-center tilda-font">
                            Селфи с удостоверением личности в руках
                          </p>
                        </div>
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

                      {/* Back to Step 1 Button */}
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="w-full mt-2 text-sm text-gray-600 hover:text-blue-600 tilda-font"
                        disabled={loading}
                      >
                        {t.backButton}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterIndividual;