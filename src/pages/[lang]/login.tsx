import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetServerSideProps } from 'next';

// Define the translations interface
interface Translations {
  title: string;
  subtitle: string;
  phoneLabel: string;
  phoneHelper: string;
  loginButton: string;
  loadingText: string;
  errorEmptyPhone: string;
  errorInvalidPhone: string;
  errorWrongNumber: string;
  errorGeneric: string;
}

interface LoginProps {
  translations: Translations;
}

// This function will run on the server for each request
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Get the language from the URL
  const lang = params?.lang || 'kz'; // Default to Kazakh if not specified

  // In a real app, you would load translations from a file or API
  // Here we're just hardcoding Kazakh and Russian translations
  const translations = {
    kz: {
      title: 'TABYS',
      subtitle: 'Сайтқа кіру үшін нөміріңізді енгізіңіз',
      phoneLabel: 'WhatsApp нөміріңіз:',
      phoneHelper: 'Маңызды: Өзіңіздің WhatsApp нөміріңізді көрсетіңіз, өйткені барлық материалдар сол нөмірге жіберіледі.',
      loginButton: 'Кіру',
      loadingText: 'Кіру...',
      errorEmptyPhone: 'Номер телефоныңызды енгізіңіз.',
      errorInvalidPhone: 'Нөмір дұрыс емес.',
      errorWrongNumber: 'Нөмір қате.',
      errorGeneric: 'Кіру кезінде қате.'
    },
    ru: {
      title: 'TABYS',
      subtitle: 'Введите ваш номер для входа на сайт',
      phoneLabel: 'Ваш WhatsApp номер:',
      phoneHelper: 'Важно: Укажите ваш WhatsApp номер, так как все материалы будут отправлены на этот номер.',
      loginButton: 'Войти',
      loadingText: 'Вход...',
      errorEmptyPhone: 'Введите номер телефона.',
      errorInvalidPhone: 'Неверный номер.',
      errorWrongNumber: 'Неверный номер.',
      errorGeneric: 'Ошибка при входе.'
    },
    en: {
      title: 'TABYS',
      subtitle: 'Enter your phone number to access the site',
      phoneLabel: 'Your WhatsApp number:',
      phoneHelper: 'Important: Provide your WhatsApp number as all materials will be sent to this number.',
      loginButton: 'Log in',
      loadingText: 'Logging in...',
      errorEmptyPhone: 'Please enter your phone number.',
      errorInvalidPhone: 'Invalid number.',
      errorWrongNumber: 'Wrong number.',
      errorGeneric: 'Login error.'
    }
  };

  // Validate lang parameter
  const validLang = (lang as string) in translations ? (lang as string) : 'kz';

  // Return the props for the component
  return {
    props: {
      translations: translations[validLang as keyof typeof translations]
    }
  };
};

const Login: React.FC<LoginProps> = ({ translations }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { lang } = router.query;

  // Function to format the phone number
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');

    // Format the phone number
    if (phoneNumber.length === 0) return '';
    if (phoneNumber.length <= 1) return `+${phoneNumber}`;
    if (phoneNumber.length <= 4) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1)}`;
    if (phoneNumber.length <= 7) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    if (phoneNumber.length <= 9) return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    if (!phone) {
      setError(translations.errorEmptyPhone);
      setLoading(false);
      return;
    }

    // Проверка номера телефона
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 11) {
      setError(translations.errorInvalidPhone);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + '/api/v2/auth/login', {
        phone_number: digitsOnly,
      });

      const token = response.data?.data?.token;
      if (token) {
        // Сохраняем токен и номер телефона в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          localStorage.setItem('phoneNumber', digitsOnly);
        }
      }

      // Получаем параметр callbackUrl из URL, если он есть
      const { callbackUrl } = router.query;

      // Если есть callbackUrl, перенаправляем туда
      if (callbackUrl && typeof callbackUrl === 'string') {
        router.push(callbackUrl);
      } else {
        // Иначе перенаправляем на домашнюю страницу
        router.push(`/${lang}/home`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError(translations.errorWrongNumber);
      } else {
        const detail = err.response?.data?.detail;
        setError(detail || translations.errorGeneric);
      }
    } finally {
      setLoading(false);
    }
  };

  // Функция для навигации по клавише Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Simple dynamic icon components
  const PhoneIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );

  const AlertIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0 mr-2 text-red-500"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );

  // Add keyframe animation for spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Языковой переключатель
  const languageSwitcher = () => {
    const currentLang = typeof lang === 'string' ? lang : 'kz';
    const languages = [
      { code: 'kz', name: 'Қазақша' },
      { code: 'ru', name: 'Русский' },
      { code: 'en', name: 'English' }
    ];

    return (
      <div className="absolute top-6 right-6 flex space-x-4">
        {languages.map((l) => (
          <a
            key={l.code}
            href={`/${l.code}/login`}
            className={`text-sm font-medium ${
              currentLang === l.code
                ? 'text-teal-600 underline'
                : 'text-gray-600 hover:text-teal-600'
            }`}
          >
            {l.name}
          </a>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{translations.title} - {translations.loginButton}</title>
        <meta name="description" content={translations.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Языковой переключатель         {languageSwitcher()}
*/}

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Верхняя часть с градиентом */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-6 sm:p-10">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white">{translations.title}</h1>
                <p className="mt-2 text-teal-100">{translations.subtitle}</p>
              </div>
            </div>

            {/* Форма логина */}
            <div className="p-6 sm:p-10">
              {error && (
                <div className="mb-6 flex items-center p-4 rounded-lg bg-red-50 border border-red-100 text-red-700">
                  <AlertIcon />
                  <span>{error}</span>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.phoneLabel}
                </label>
                <div className="relative">
                  <PhoneIcon />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    onKeyPress={handleKeyPress}
                    placeholder="+7 (___) ___-__-__"
                    className={`w-full pl-12 pr-4 py-3 border ${
                      error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                    } rounded-lg shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-colors`}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {translations.phoneHelper}
                </p>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className={`w-full flex justify-center items-center rounded-lg px-5 py-3 font-medium text-white transition-all ${
                  loading
                    ? 'bg-teal-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {translations.loadingText}
                  </>
                ) : (
                  translations.loginButton
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Волнообразный декоративный элемент внизу */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 h-16">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="text-gray-100 w-full h-16">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor" transform="rotate(180 600 60)"></path>
          </svg>
        </div>
      </div>
    </>
  );
};

export default Login;