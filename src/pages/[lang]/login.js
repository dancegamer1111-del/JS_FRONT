import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';

const translations = {
  kz: {
    title: '',
    phoneStepTitle: 'WhatsApp нөміріңізді енгізіңіз',
    phoneStepSubtitle: 'Біз сізге растау кодын жібереміз',
    phoneLabel: 'WhatsApp нөміріңіз:',
    sendCodeButton: 'Код жіберу',
    otpStepTitle: 'Растау кодын енгізіңіз',
    otpStepSubtitle: 'WhatsApp арқылы келген кодты енгізіңіз',
    otpLabel: 'Растау коды:',
    verifyButton: 'Растау',
    loadingText: 'Күте тұрыңыз...',
    registerOrgButton: 'Ұйымды тіркеу',
    changePhoneButton: 'Нөмірді өзгерту',
    smsPlaceholder: 'SMS кодын енгізіңіз'
  },
  ru: {
    title: '',
    phoneStepTitle: 'Введите ваш WhatsApp номер',
    phoneStepSubtitle: 'Мы отправим вам код верификации',
    phoneLabel: 'Ваш WhatsApp номер:',
    sendCodeButton: 'Отправить код',
    otpStepTitle: 'Введите код верификации',
    otpStepSubtitle: 'Введите код, полученный в WhatsApp',
    otpLabel: 'Код верификации:',
    verifyButton: 'Подтвердить',
    loadingText: 'Подождите...',
    registerOrgButton: 'Регистрация организации',
    changePhoneButton: 'Изменить номер',
    smsPlaceholder: 'Введите SMS код'
  }
};

const Login = () => {
  const router = useRouter();
  const { lang } = router.query;
  const currentLang = lang && ['kz', 'ru'].includes(lang) ? lang : 'kz';
  const t = translations[currentLang] || translations.kz;

  const [step, setStep] = useState('phone'); // 'phone', 'otp'
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Проверяем параметры URL для обратной связи после регистрации
    const { registered } = router.query;
    if (registered === 'true') {
      setStep('otp');
      // Можно показать сообщение об успешной регистрации
    }
  }, [router.query]);

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length === 0) return '';
    if (phoneNumber.length <= 1) return `+${phoneNumber}`;
    if (phoneNumber.length <= 4) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1)}`;
    if (phoneNumber.length <= 7) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    if (phoneNumber.length <= 9) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    setError(null);

    if (!phone) {
      setError('Введите номер телефона');
      setLoading(false);
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 11) {
      setError('Неверный формат номера телефона');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/auth/send-otp`, {
        phone_number: digitsOnly,
      });

      // В любом случае переходим к вводу OTP (код будет отправлен)
      setStep('otp');
      setError(null);

    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError(null);

    if (!otpCode) {
      setError('Введите код верификации');
      setLoading(false);
      return;
    }

    const digitsOnly = phone.replace(/\D/g, '');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/auth/verify-otp`, {
        phone_number: digitsOnly,
        code: otpCode
      });

      const token = response.data?.access_token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('phoneNumber', digitsOnly);

        // Пользователь найден - перенаправляем в home
        const { callbackUrl } = router.query;
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push(`/${currentLang}/home`);
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // Пользователь не найден - перенаправляем на регистрацию физлица
        router.push(`/${currentLang}/register-individual?phone=${phone}`);
      } else {
        setError(err.response?.data?.detail || 'Неверный код верификации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (step === 'phone') sendVerificationCode();
      if (step === 'otp') verifyCode();
    }
  };

  // Icons
  const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );

  const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );

  const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mr-2 text-red-500">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12h12"/>
      <path d="M6 8h12"/>
      <path d="M6 16h12"/>
    </svg>
  );

  return (
    <>
      <Head>
        <title>{t.title} - Авторизация</title>
        <meta name="description" content="Авторизация на платформе SARYARQA JASTARY" />
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

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6">
        <div className="max-w-sm w-full">

          {/* Компактный логотип */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 tilda-font">{t.title}</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

            {/* Компактный заголовок */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {step === 'phone' ? <PhoneIcon /> : <MessageIcon />}
              </div>
              <h2 className="text-base font-semibold text-white mb-1 tilda-font">
                {step === 'phone' ? t.phoneStepTitle : t.otpStepTitle}
              </h2>
              <p className="text-blue-100 text-sm tilda-font">
                {step === 'phone' ? t.phoneStepSubtitle : t.otpStepSubtitle}
              </p>
            </div>

            <div className="p-4">
              {/* Error message */}
              {error && (
                <div className="mb-3 flex items-center p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                  <AlertIcon />
                  <span className="tilda-font">{error}</span>
                </div>
              )}

              {/* Phone Step */}
              {step === 'phone' && (
                <>
                  <div className="mb-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={handlePhoneChange}
                      onKeyPress={handleKeyPress}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                    />
                  </div>

                  <button
                    onClick={sendVerificationCode}
                    disabled={loading}
                    className={`w-full flex justify-center items-center rounded-lg px-4 py-2.5 font-medium text-white transition-all tilda-font ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-sm'
                    }`}
                  >
                    {loading ? t.loadingText : t.sendCodeButton}
                  </button>

                  {/* Organization Registration Link */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => router.push(`/${currentLang}/register-organization`)}
                      className="w-full flex items-center justify-center p-2.5 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm tilda-font"
                    >
                      <BuildingIcon />
                      {t.registerOrgButton}
                    </button>
                  </div>
                </>
              )}

              {/* OTP Step */}
              {step === 'otp' && (
                <>
                  <div className="mb-3">
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.otpLabel}
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t.smsPlaceholder}
                      maxLength="6"
                      className="w-full px-3 py-2.5 text-lg text-center tracking-widest border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors tilda-font"
                    />
                    <p className="mt-2 text-xs text-gray-500 text-center tilda-font">
                      Отправлено на: {formatPhoneNumber(phone)}
                    </p>
                  </div>

                  <button
                    onClick={verifyCode}
                    disabled={loading}
                    className={`w-full flex justify-center items-center rounded-lg px-4 py-2.5 font-medium text-white transition-all tilda-font ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-sm'
                    }`}
                  >
                    {loading ? t.loadingText : t.verifyButton}
                  </button>

                  <button
                    onClick={() => setStep('phone')}
                    className="w-full mt-3 text-sm text-gray-600 hover:text-blue-600 tilda-font"
                    disabled={loading}
                  >
                    {t.changePhoneButton}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Компактный футер */}
          <div className="mt-4 text-center">
            <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto w-12"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;