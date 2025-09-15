import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

const translations = {
  kz: {
    title: 'Тіркелу',
    chooseType: 'Тіркелу түрін таңдаңыз:',
    individual: 'Жеке тұлға',
    organization: 'Ұйым',
    individualTitle: 'Жеке тұлға ретінде тіркелу',
    organizationTitle: 'Ұйым ретінде тіркелу',

    // Individual fields
    fullName: 'Толық аты-жөні:',
    address: 'Тіркелу мекенжайы:',
    personStatus: 'Мәртебе:',

    // Organization fields
    orgName: 'Ұйым атауы:',
    binNumber: 'БСН нөмірі:',
    orgType: 'Қызмет түрі:',
    email: 'Email (міндетті емес):',
    orgAddress: 'Мекенжай:',

    registerButton: 'Тіркелу',
    loadingText: 'Күте тұрыңыз...',
    backButton: 'Артқа',
    changeType: 'Түрін өзгерту'
  },
  ru: {
    title: 'Регистрация',
    chooseType: 'Выберите тип регистрации:',
    individual: 'Физическое лицо',
    organization: 'Организация',
    individualTitle: 'Регистрация физического лица',
    organizationTitle: 'Регистрация организации',

    // Individual fields
    fullName: 'ФИО:',
    address: 'Адрес прописки:',
    personStatus: 'Статус:',

    // Organization fields
    orgName: 'Название организации:',
    binNumber: 'БИН:',
    orgType: 'Сфера деятельности:',
    email: 'Email (необязательно):',
    orgAddress: 'Адрес:',

    registerButton: 'Зарегистрироваться',
    loadingText: 'Подождите...',
    backButton: 'Назад',
    changeType: 'Изменить тип'
  }
};

const Register = () => {
  const router = useRouter();
  const { lang, phone } = router.query;
  const currentLang = lang && ['kz', 'ru'].includes(lang) ? lang : 'kz';
  const t = translations[currentLang] || translations.kz;

  const [registrationType, setRegistrationType] = useState(null); // null, 'individual', 'organization'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Individual form states
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [personStatusId, setPersonStatusId] = useState('');

  // Organization form states
  const [orgName, setOrgName] = useState('');
  const [binNumber, setBinNumber] = useState('');
  const [orgTypeId, setOrgTypeId] = useState('');
  const [email, setEmail] = useState('');
  const [orgAddress, setOrgAddress] = useState('');

  // Reference data
  const [personStatuses, setPersonStatuses] = useState([]);
  const [organizationTypes, setOrganizationTypes] = useState([]);

  useEffect(() => {
    loadReferenceData();

    // Если нет номера телефона в query, перенаправляем на логин
    if (!phone) {
      router.push(`/${currentLang}/login`);
    }
  }, [phone, currentLang, router]);

  const loadReferenceData = async () => {
    try {
      const [statusResponse, orgTypeResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/auth/person-statuses`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/auth/organization-types`)
      ]);

      setPersonStatuses(statusResponse.data);
      setOrganizationTypes(orgTypeResponse.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
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
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.slice(0, 12);
  };

  const handleBINChange = (e) => {
    const formattedBIN = formatBIN(e.target.value);
    setBinNumber(formattedBIN);
  };

  const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('phoneNumber', digitsOnly);
      }

      setTimeout(() => {
        router.push(`/${currentLang}/projects`);
      }, 2000);

    } catch (err) {
      console.error('Individual registration error:', err);
      setError(err.response?.data?.detail || 'Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const registerOrganization = async () => {
    setLoading(true);
    setError(null);

    if (!orgName || !binNumber || !orgTypeId || !orgAddress) {
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
        address: orgAddress,
        email: email || null
      });

      setSuccess(true);

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
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12h12"/>
      <path d="M6 8h12"/>
      <path d="M6 16h12"/>
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
        <meta name="description" content="Регистрация на платформе SARYARQA JASTARY" />
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
                {registrationType === 'individual' ? <UserIcon /> : registrationType === 'organization' ? <BuildingIcon /> : <UserIcon />}
                <h1 className="ml-2 text-lg font-semibold tilda-font">
                  {registrationType === 'individual' ? t.individualTitle :
                   registrationType === 'organization' ? t.organizationTitle :
                   t.title}
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
                  <span className="tilda-font">Регистрация прошла успешно! Перенаправляем...</span>
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
                  {/* Type Selection */}
                  {!registrationType && (
                    <div className="space-y-4">
                      <h2 className="text-center text-lg font-medium text-gray-800 mb-6 tilda-font">
                        {t.chooseType}
                      </h2>

                      <div className="space-y-3">
                        <button
                          onClick={() => setRegistrationType('individual')}
                          className="w-full flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                          <UserIcon />
                          <span className="ml-3 text-lg font-medium text-gray-700 group-hover:text-blue-600 tilda-font">
                            {t.individual}
                          </span>
                        </button>

                        <button
                          onClick={() => setRegistrationType('organization')}
                          className="w-full flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                          <BuildingIcon />
                          <span className="ml-3 text-lg font-medium text-gray-700 group-hover:text-blue-600 tilda-font">
                            {t.organization}
                          </span>
                        </button>
                      </div>

                      <button
                        onClick={() => router.push(`/${currentLang}/login`)}
                        className="w-full mt-4 text-sm text-gray-600 hover:text-blue-600 tilda-font"
                      >
                        {t.backButton}
                      </button>
                    </div>
                  )}

                  {/* Individual Registration Form */}
                  {registrationType === 'individual' && (
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

                      {/* Change Type Button */}
                      <button
                        onClick={() => setRegistrationType(null)}
                        className="w-full mt-2 text-sm text-gray-600 hover:text-blue-600 tilda-font"
                        disabled={loading}
                      >
                        {t.changeType}
                      </button>
                    </div>
                  )}

                  {/* Organization Registration Form */}
                  {registrationType === 'organization' && (
                    <div className="space-y-4">
                      {/* Organization Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.orgName} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                          placeholder='ТОО "Название организации"'
                        />
                      </div>

                      {/* BIN Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.binNumber} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={binNumber}
                          onChange={handleBINChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                          placeholder="123456789012"
                          maxLength="12"
                        />
                        <p className="mt-1 text-xs text-gray-500 tilda-font">
                          12 цифр. Пример: 123456789012
                        </p>
                      </div>

                      {/* Organization Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.orgType} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={orgTypeId}
                          onChange={(e) => setOrgTypeId(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.email}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                          placeholder="info@company.kz"
                        />
                        <p className="mt-1 text-xs text-gray-500 tilda-font">
                          Необязательное поле
                        </p>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.orgAddress} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={orgAddress}
                          onChange={(e) => setOrgAddress(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                          rows="2"
                          placeholder="г. Алматы, ул. Назарбаева 123, офис 45"
                        />
                        <p className="mt-1 text-xs text-gray-500 tilda-font">
                          Юридический адрес организации
                        </p>
                      </div>

                      {/* Register Button */}
                      <button
                        onClick={registerOrganization}
                        disabled={loading}
                        className={`w-full flex justify-center items-center rounded-lg px-4 py-2.5 font-medium text-white transition-all tilda-font ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                        }`}
                      >
                        {loading ? t.loadingText : t.registerButton}
                      </button>

                      {/* Change Type Button */}
                      <button
                        onClick={() => setRegistrationType(null)}
                        className="w-full mt-2 text-sm text-gray-600 hover:text-blue-600 tilda-font"
                        disabled={loading}
                      >
                        {t.changeType}
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

export default Register;