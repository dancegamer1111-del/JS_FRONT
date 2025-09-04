// Navigation.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  Home,
  BookOpen,
  Users,
  Briefcase,
  Award,
  Monitor,
  HelpCircle,
  Globe,
  LogIn,
} from 'react-feather';

// Импортируем модальное окно и переводы
import Modal from './Modal';
import { translations } from '../locales/translations';

// Список языков
const languages = [
  { code: 'kz', label: 'Қазақша', flag: '/icons/kz.png' },
  { code: 'ru', label: 'Русский', flag: '/icons/ru.png' },
  { code: 'en', label: 'English', flag: '/icons/usa.png' },
];

const Navigation = () => {
  const router = useRouter();
  const { lang } = router.query;
  const pathname = router.pathname;

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [currentLang, setCurrentLang] = useState(
    typeof lang === 'string' && ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz'
  );
  const [t, setT] = useState(translations[currentLang] || {});

  // Состояние для модального окна
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsAuthorized(!!token);
  }, []);

  useEffect(() => {
    if (typeof lang === 'string' && lang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';
      setCurrentLang(validLang);
      setT(translations[validLang] || {});
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [lang, currentLang]);

  const langPrefix = `/${currentLang}`;

  const navItems = [
    { path: `${langPrefix}/home`, label: t.navigation?.home || 'Главная', icon: <Home size={18} className="mr-2" />, isComingSoon: false },
    { path: `${langPrefix}/projects`, label: t.navigation?.projects || 'Проекты', icon: <Users size={18} className="mr-2" />, isComingSoon: false },
    { path: `${langPrefix}/vacancies`, label: t.navigation?.vacancies || 'Вакансии', icon: <Briefcase size={18} className="mr-2" />, isComingSoon: true },
    { path: `${langPrefix}/news`, label: t.navigation?.news || 'Новости', icon: <HelpCircle size={18} className="mr-2" />, isComingSoon: true },
    { path: `${langPrefix}/events`, label: t.navigation?.events || 'Календарь событий', icon: <Award size={18} className="mr-2" />, requiresAuth: true, isComingSoon: true },
    { path: `${langPrefix}/courses`, label: t.navigation?.courses || 'Курсы', icon: <Monitor size={18} className="mr-2" />, requiresAuth: true, isComingSoon: true },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);

  // Обработчик для заглушки
  const handlePlaceholderClick = (e) => {
    e.preventDefault();
    setModalMessage(t.navigation?.comingSoon || 'Раздел в разработке.');
    setShowModal(true);
  };

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  const handleLogin = () => {
    router.push(`${langPrefix}/login?returnUrl=${encodeURIComponent(router.asPath)}`);
  };

  // Обновленный обработчик навигации
  const handleNavigationClick = (item, e) => {
    if (item.isComingSoon) {
      handlePlaceholderClick(e);
    } else if (item.requiresAuth && !isAuthorized) {
      e.preventDefault();
      router.push(`${langPrefix}/login?returnUrl=${encodeURIComponent(item.path)}`);
    } else {
      router.push(item.path);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const hamburgerButton = document.getElementById('hamburger-button');
      if (mobileMenu && hamburgerButton && !mobileMenu.contains(event.target) && !hamburgerButton.contains(event.target)) {
        setIsOpen(false);
      }
      const langDropdown = document.getElementById('lang-dropdown');
      const langButton = document.getElementById('lang-button');
      if (langDropdown && langButton && !langDropdown.contains(event.target) && !langButton.contains(event.target)) {
        setIsLangOpen(false);
      }
      const mobileLangDropdown = document.getElementById('mobile-lang-dropdown');
      const mobileLangButton = document.getElementById('mobile-lang-button');
      if (mobileLangDropdown && mobileLangButton && !mobileLangDropdown.contains(event.target) && !mobileLangButton.contains(event.target)) {
        setIsMobileLangOpen(false);
      }
    };

    const handleRouteChange = () => {
      setIsOpen(false);
      setIsLangOpen(false);
      setIsMobileLangOpen(false);
      closeModal();
    };

    document.addEventListener('mousedown', handleClickOutside);
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, isOpen, isLangOpen, isMobileLangOpen]);

  const isActive = (path) => pathname === path;

  const toggleLangDropdown = () => setIsLangOpen(!isLangOpen);
  const handleLanguageChange = (langCode) => {
    setIsLangOpen(false);
    if (['kz', 'ru', 'en'].includes(langCode)) {
      setCurrentLang(langCode);
      setT(translations[langCode] || {});
      router.push(`/${langCode}${pathname.replace(/^\/[^\/]+/, '')}`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', langCode);
      }
    }
  };

  const toggleMobileLangDropdown = () => setIsMobileLangOpen(!isMobileLangOpen);
  const handleMobileLanguageChange = (langCode) => {
    setIsMobileLangOpen(false);
    if (['kz', 'ru', 'en'].includes(langCode)) {
      setCurrentLang(langCode);
      setT(translations[langCode] || {});
      router.push(`/${langCode}${pathname.replace(/^\/[^\/]+/, '')}`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', langCode);
      }
    }
  };

  return (
    <>
      {/* Стили для шрифтов */}
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
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Bold.ttf') format('truetype');
          font-weight: 700;
          font-style: normal;
        }
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-ExtraBold.ttf') format('truetype');
          font-weight: 800;
          font-style: normal;
        }
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Black.ttf') format('truetype');
          font-weight: 900;
          font-style: normal;
        }
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Light.ttf') format('truetype');
          font-weight: 300;
          font-style: normal;
        }

        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      {/* Десктопное меню */}
      <nav className="bg-white backdrop-blur-lg bg-opacity-95 shadow-xl border-b border-purple-100 sticky top-0 z-30 hidden sm:block">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href={`${langPrefix}/home`} legacyBehavior>
                <a className="flex items-center group">
                  <div className="text-xl font-bold tilda-font relative">
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text group-hover:from-purple-700 group-hover:via-pink-700 group-hover:to-blue-700 transition-all duration-300">
                      SARYARQA JASTARY
                    </span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl rounded-lg"></div>
                  </div>
                </a>
              </Link>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              {navItems.map((item) => (
                <div key={item.path}>
                  {item.isComingSoon ? (
                    <a
                      href="#"
                      onClick={handlePlaceholderClick}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center text-gray-400 cursor-not-allowed tilda-font relative overflow-hidden`}
                    >
                      <div className="relative z-10 flex items-center">
                        {item.icon}
                        {item.label}
                      </div>
                    </a>
                  ) : item.requiresAuth ? (
                    <a
                      href={item.path}
                      onClick={(e) => handleNavigationClick(item, e)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center tilda-font relative overflow-hidden group ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg'
                          : 'text-gray-700 hover:text-white hover:shadow-lg'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive(item.path) ? 'opacity-100' : ''}`}></div>
                      <div className="relative z-10 flex items-center">
                        {item.icon}
                        {item.label}
                      </div>
                    </a>
                  ) : (
                    <Link href={item.path} legacyBehavior>
                      <a
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center tilda-font relative overflow-hidden group ${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg'
                            : 'text-gray-700 hover:text-white hover:shadow-lg'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive(item.path) ? 'opacity-100' : ''}`}></div>
                        <div className="relative z-10 flex items-center">
                          {item.icon}
                          {item.label}
                        </div>
                      </a>
                    </Link>
                  )}
                </div>
              ))}
              {!isAuthorized && (
                <button
                  onClick={handleLogin}
                  className="ml-3 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center tilda-font group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center">
                    <LogIn size={18} className="mr-2" />
                    {t.navigation?.login || 'Войти'}
                  </div>
                </button>
              )}
              <div className="relative ml-3">
                <button
                  id="lang-button"
                  onClick={toggleLangDropdown}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-300 tilda-font group"
                >
                  <Globe size={18} className="group-hover:text-purple-600 transition-colors duration-300" />
                  <img
                    src={languages.find((l) => l.code === currentLang)?.flag || '/icons/kz.png'}
                    alt="Selected language"
                    className="w-5 h-5 rounded-full shadow-sm"
                  />
                </button>
                {isLangOpen && (
                  <div id="lang-dropdown" className="absolute right-0 mt-2 w-44 rounded-2xl shadow-2xl bg-white ring-1 ring-purple-200 z-50 overflow-hidden border border-purple-100">
                    <div className="py-2">
                      {languages.map((langItem) => (
                        <button
                          key={langItem.code}
                          onClick={() => handleLanguageChange(langItem.code)}
                          className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-300 tilda-font"
                        >
                          <img src={langItem.flag} alt={langItem.label} className="w-5 h-5 mr-3 rounded-full shadow-sm" />
                          {langItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <nav className="bg-white backdrop-blur-lg bg-opacity-95 shadow-xl border-b border-purple-100 sm:hidden sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`${langPrefix}/home`} legacyBehavior>
              <a className="flex items-center group">
                <div className="text-xl font-bold tilda-font relative">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text group-hover:from-purple-700 group-hover:via-pink-700 group-hover:to-blue-700 transition-all duration-300">
                    SARYARQA JASTARY
                  </span>
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl rounded-lg"></div>
                </div>
              </a>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  id="mobile-lang-button"
                  onClick={toggleMobileLangDropdown}
                  className="p-2.5 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 focus:outline-none transition-all duration-300"
                >
                  <img
                    src={languages.find((l) => l.code === currentLang)?.flag || '/icons/kz.png'}
                    alt="Selected language"
                    className="w-6 h-6 rounded-full shadow-sm"
                  />
                </button>
                {isMobileLangOpen && (
                  <div id="mobile-lang-dropdown" className="absolute right-0 mt-2 w-36 rounded-2xl shadow-2xl bg-white ring-1 ring-purple-200 z-50 overflow-hidden border border-purple-100">
                    <div className="py-2">
                      {languages.map((langItem) => (
                        <button
                          key={langItem.code}
                          onClick={() => handleMobileLanguageChange(langItem.code)}
                          className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-300 tilda-font"
                        >
                          <img src={langItem.flag} alt={langItem.label} className="w-4 h-4 mr-2 rounded-full shadow-sm" />
                          {langItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                id="hamburger-button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 focus:outline-none transition-all duration-300"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
        {isOpen && (
          <div id="mobile-menu" className="md:hidden bg-white backdrop-blur-lg bg-opacity-98 shadow-2xl absolute left-0 right-0 z-50 border-t border-purple-100">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navItems.map((item) => (
                <div key={item.path}>
                  {item.isComingSoon ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        setIsOpen(false);
                        handlePlaceholderClick(e);
                      }}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center text-gray-400 cursor-not-allowed tilda-font`}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  ) : item.requiresAuth ? (
                    <a
                      href={item.path}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center tilda-font relative overflow-hidden group ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg'
                          : 'text-gray-700 hover:text-white hover:shadow-lg'
                      }`}
                      onClick={(e) => {
                        setIsOpen(false);
                        handleNavigationClick(item, e);
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive(item.path) ? 'opacity-100' : ''}`}></div>
                      <div className="relative z-10 flex items-center">
                        {item.icon}
                        {item.label}
                      </div>
                    </a>
                  ) : (
                    <Link href={item.path} legacyBehavior>
                      <a
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center tilda-font relative overflow-hidden group ${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg'
                            : 'text-gray-700 hover:text-white hover:shadow-lg'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive(item.path) ? 'opacity-100' : ''}`}></div>
                        <div className="relative z-10 flex items-center">
                          {item.icon}
                          {item.label}
                        </div>
                      </a>
                    </Link>
                  )}
                </div>
              ))}
              {!isAuthorized && (
                <button
                  onClick={handleLogin}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center tilda-font group relative overflow-hidden mt-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex items-center">
                    <LogIn size={18} className="mr-2" />
                    {t.navigation?.login || 'Войти'}
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Компонент модального окна */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title={t.navigation?.comingSoonTitle || 'Раздел в разработке'}
        message={modalMessage}
      />
    </>
  );
};

export default Navigation;