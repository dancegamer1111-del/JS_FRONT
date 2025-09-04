import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

const translations = {
  kz: {
    title: 'Ұйым ретінде тіркелу',
    orgName: 'Ұйым атауы:',
    binNumber: 'БСН нөмірі:',
    orgType: 'Қызмет түрі:',
    email: 'Email (міндетті емес):',
    address: 'Мекенжай:',
    registerButton: 'Тіркелу',
    loadingText: 'Күте тұрыңыз...',
    backButton: 'Артқа'
  },
  ru: {
    title: 'Регистрация организации',
    orgName: 'Название организации:',
    binNumber: 'БИН:',
    orgType: 'Сфера деятельности:',
    email: 'Email (необязательно):',
    address: 'Адрес:',
    registerButton: 'Зарегистрироваться',
    loadingText: 'Подождите...',
    backButton: 'Назад'
  }
};

const RegisterOrganization = () => {
  const router = useRouter();
  const { lang, phone } = router.query;
  const currentLang = lang && ['kz', 'ru'].includes(lang) ? lang : 'kz';
  const t = translations[currentLang] || translations.kz;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState('');
  const [binNumber, setBinNumber] = useState('');
  const [orgTypeId, setOrgTypeId] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Reference data
  const [organizationTypes, setOrganizationTypes] = useState([]);

  useEffect(() => {
    loadOrganizationTypes();

    // Если нет номера телефона в query, перенаправляем на логин
    if (!phone) {
      router.push(`/${currentLang}/login`);
    }
  }, [phone, currentLang, router]);

  const loadOrganizationTypes = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/auth/organization-types`);
      setOrganizationTypes(response.data);
    } catch (error) {
      console.error('Error loading organization types:', error);
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

  const formatBIN = (value) => {
    // Убираем все нецифровые символы
    const digitsOnly = value.replace(/\D/g, '');
    // Ограничиваем до 12 цифр
    return digitsOnly.slice(0, 12);
  };

  const handleBINChange = (e) => {
    const formattedBIN = formatBIN(e.target.value);
    setBinNumber(formattedBIN);
  };

  const validateEmail = (email) => {
    if (!email) return true; // Email необязательный
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const registerOrganization = async () => {
    setLoading(true);
    setError(null);

    // Валидация полей
    if (!orgName || !binNumber || !orgTypeId || !address) {
      setError('Заполните все обязательные поля');
      setLoading(false);
      return;
    }

    if (binNumber.length !== 12) {
      setError('БИН должен содержать 12 цифр');
      setLoading(false);
      return;
    }

    if (email && !validateEmail(email)) {
      setError('Неверный формат email');
      setLoading(false);
      return;
    }

    try {
      const digitsOnly = phone.replace(/\D/g, '');

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/auth/register-organization`, {
        phone_number: digitsOnly,
        name: orgName,
        bin_number: binNumber,
        organization_type_id: parseInt(orgTypeId),
        address: address,
        email: email || null
      });

      setSuccess(true);

      // Перенаправляем на страницу логина с информацией об успешной регистрации
      setTimeout(() => {
        router.push(`/${currentLang}/login?registered=true&phone=${phone}`);
      }, 2000);

    } catch (err) {
      console.error('Organization registration error:', err);
      setError(err.response?.data?.detail || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  // Icons
  const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12h12"/>
      <path d="M6 8h12"/>
      <path d="M6 16h12"/>
    </svg>
  );

  const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mr-2 text-red-500">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mr-2 text-green-500">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  );

  return (
    <>
      <Head>
        <title>TABYS - {t.title}</title>
        <meta name="description" content="Регистрация организации на платформе TABYS" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6">
              <div className="flex items-center justify-center text-white">
                <BuildingIcon />
                <h1 className="ml-3 text-2xl font-bold">{t.title}</h1>
              </div>
              <p className="text-center text-teal-100 mt-2">
                Номер: {formatPhoneNumber(phone)}
              </p>
            </div>

            <div className="p-6">
              {/* Success message */}
              {success && (
                <div className="mb-6 flex items-center p-4 rounded-lg bg-green-50 border border-green-100 text-green-700">
                  <CheckIcon />
                  <span>Регистрация прошла успешно! Перенаправляем на авторизацию...</span>
                </div>
              )}

              {/* Error message */}
              {error && !success && (
                <div className="mb-6 flex items-center p-4 rounded-lg bg-red-50 border border-red-100 text-red-700">
                  <AlertIcon />
                  <span>{error}</span>
                </div>
              )}

              {!success && (
                <div className="space-y-5">
                  {/* Organization Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.orgName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20"
                      placeholder='ТОО "Название организации"'
                    />
                  </div>

                  {/* BIN Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.binNumber} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={binNumber}
                      onChange={handleBINChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20"
                      placeholder="123456789012"
                      maxLength="12"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      12 цифр. Пример: 123456789012
                    </p>
                  </div>

                  {/* Organization Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.orgType} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={orgTypeId}
                      onChange={(e) => setOrgTypeId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20"
                    >
                      <option value="">Выберите сферу деятельности</option>
                      {organizationTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {currentLang === 'kz' ? type.name_kz : type.name_ru}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20"
                      placeholder="info@company.kz"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Необязательное поле
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.address} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20"
                      rows="3"
                      placeholder="г. Алматы, ул. Назарбаева 123, офис 45"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Юридический адрес организации
                    </p>
                  </div>

                  {/* Register Button */}
                  <button
                    onClick={registerOrganization}
                    disabled={loading}
                    className={`w-full flex justify-center items-center rounded-lg px-5 py-3 font-medium text-white transition-all ${
                      loading
                        ? 'bg-teal-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg'
                    }`}
                  >
                    {loading ? t.loadingText : t.registerButton}
                  </button>

                  {/* Back Button */}
                  <button
                    onClick={() => router.push(`/${currentLang}/login`)}
                    className="w-full mt-3 text-sm text-gray-600 hover:text-teal-600"
                    disabled={loading}
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

export default RegisterOrganization;