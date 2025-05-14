import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { translations } from '../../../locales/translations'; // Убедитесь, что путь корректный
import Footer from '../../../components/Footer'; // Убедитесь, что путь корректный
import ExpertsList from './ExpertsList'; // Компонент списка
import ExpertFilter from './ExpertFilter'; // Компонент фильтра
import { Users, Search } from 'react-feather';

export default function ExpertsPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'ru'); // По умолчанию русский, если сервер не передал
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || (translations[serverLang || 'ru'] || {}));

  // Состояние для фильтров
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    search: ''
  });

  useEffect(() => {
    // Обновляем язык и переводы при клиентской навигации (если меняются query-параметры)
    if (clientLang && typeof clientLang === 'string' && clientLang !== currentLang) {
      const validLang = ['kz', 'ru'].includes(clientLang) ? clientLang : 'ru'; // Фоллбэк на русский
      setCurrentLang(validLang);

      // Если указан неправильный язык в URL, заменяем на правильный
      if (clientLang !== validLang) {
        router.replace(`/${validLang}/experts`, undefined, { shallow: true });
      }

      // Обновляем переводы для нового языка
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      } else if (translations && translations['ru']) { // Фоллбэк на русский, если переводы для validLang отсутствуют
        setT(translations['ru']);
      }

      // Сохраняем выбранный язык в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    } else if (!clientLang && serverLang && currentLang !== serverLang) {
      // Если clientLang отсутствует (например, первый заход без параметра lang в URL),
      // но serverLang был установлен, убедимся, что currentLang и t соответствуют serverLang.
      setCurrentLang(serverLang);
      if (translations && translations[serverLang]) {
        setT(translations[serverLang]);
      }
    }
  }, [clientLang, currentLang, router, serverLang]);

  // Функция для получения переводов по вложенным ключам
  const getTranslation = (key, fallback) => {
    try {
      if (!t || Object.keys(t).length === 0) {
        return fallback || key;
      }
      const keys = key.split('.');
      let result = t;

      for (const k of keys) {
        if (result && typeof result === 'object' && result[k] !== undefined) {
          result = result[k];
        } else {
          return fallback || key;
        }
      }
      return typeof result === 'string' ? result : (fallback || key);
    } catch (e) {
      console.error(`Error getting translation for key: ${key}`, e);
      return fallback || key;
    }
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  // Обработчик изменения поля поиска
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setFilters(prev => ({ ...prev, search: value }));
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('experts.pageTitle', 'Наши Эксперты | Поиск специалистов')}</title>
        <meta name="description" content={getTranslation('experts.pageDescription', 'Найдите лучших экспертов в различных областях.')} />
      </Head>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Заголовок в стиле других компонентов */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl p-6 mb-8">
          <div className="md:flex md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <Users className="mr-3" size={28} />
                {getTranslation('experts.findExpertsTitle', 'Наши эксперты')}
              </h1>
              <p className="mt-2 opacity-90">
                {getTranslation('experts.compactSubtitle', 'Квалифицированные специалисты для ваших задач')}
              </p>
            </div>

            {/* Быстрый поиск */}
            <div className="max-w-xs w-full">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleSearchChange}
                  placeholder={getTranslation('experts.searchPlaceholder', 'Поиск экспертов...')}
                  className="w-full px-4 pl-10 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <ExpertFilter
            onFilterChange={handleFilterChange}
            getTranslation={getTranslation}
            currentLang={currentLang}
          />
        </div>

        <ExpertsList
          filters={filters}
          getTranslation={getTranslation}
          currentLang={currentLang}
        />
      </div>

      {/* Секция с призывом к действию */}
      <div className="bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {getTranslation('experts.callToAction.title', 'Не нашли нужного эксперта?')}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            {getTranslation('experts.callToAction.description', 'Оставьте заявку, и мы поможем вам найти специалиста, который соответствует вашим требованиям.')}
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300">
            {getTranslation('experts.callToAction.button', 'Оставить заявку')}
          </button>
        </div>
      </div>

    </div>
  );
}

export async function getServerSideProps(context) {
  const { lang } = context.params;
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'ru'; // Фоллбэк на русский

  if (lang !== validLang && context.res) { // context.res существует только на сервере
    context.res.writeHead(302, { Location: `/${validLang}/experts` });
    context.res.end();
    return { props: {} }; // Нужно вернуть что-то, хотя редирект уже произошел
  }

  const langTranslations = translations[validLang] || (translations['ru'] || {});

  return {
    props: {
      lang: validLang,
      translations: langTranslations,
    },
  };
}