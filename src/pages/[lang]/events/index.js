import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import EventsList from '../../../components/events/EventsList';
import { translations } from '../../../locales/translations';
import Layout from '../../../components/Layout';
import { Calendar, Search, Filter, X, ChevronDown } from 'lucide-react';


export default function EventsPage() {
  const router = useRouter();
  const { lang = 'ru' } = router.query;

  const [filters, setFilters] = useState({
    format: '',
    search: '',
    from_date: '',
    to_date: ''
  });

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const getTranslation = (key) => {
    if (!translations[lang]) {
      return key;
    }

    const parts = key.split('.');
    let result = translations[lang];

    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        return key;
      }
    }

    return result;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      format: '',
      search: '',
      from_date: '',
      to_date: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.format || filters.search || filters.from_date || filters.to_date;
  };

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Regular.ttf') format('truetype');
          font-weight: 400;
        }
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Bold.ttf') format('truetype');
          font-weight: 700;
        }
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      <Layout currentLang={lang}>
        <Head>
          <title>{getTranslation('events.pageTitle') || 'Мероприятия'}</title>
          <meta
            name="description"
            content={getTranslation('events.pageDescription') || 'Список предстоящих мероприятий'}
          />
        </Head>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 mb-8">
            <div className="md:flex md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-3 tilda-font">
                  ✨ События для молодежи
                </div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center tilda-font">
                  <Calendar className="mr-3" size={28} />
                  {getTranslation('events.pageTitle') || 'Мероприятия'}
                </h1>
                <p className="mt-2 opacity-90 tilda-font">
                  {getTranslation('events.pageDescription') || 'Список предстоящих мероприятий и событий'}
                </p>
              </div>

              {/* Быстрый поиск */}
              <div className="max-w-xs w-full">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder={getTranslation('events.searchPlaceholder') || 'Поиск мероприятий...'}
                    className="w-full px-4 pl-10 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 tilda-font"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Мобильная кнопка фильтров */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 font-medium tilda-font"
            >
              <span className="flex items-center">
                <Filter size={18} className="mr-2 text-purple-600" />
                {getTranslation('events.filters') || 'Фильтры'}
                {hasActiveFilters() && (
                  <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {Object.values(filters).filter(Boolean).length}
                  </span>
                )}
              </span>
              <ChevronDown size={18} className={`transform transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Фильтры */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 ${isFilterExpanded ? 'block' : 'hidden md:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Формат */}
              <div>
                <label htmlFor="format" className="block text-xs font-medium text-gray-600 mb-2 tilda-font">
                  {getTranslation('events.format') || 'Формат'}
                </label>
                <select
                  id="format"
                  name="format"
                  value={filters.format}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-sm tilda-font"
                >
                  <option value="">
                    {getTranslation('events.allFormats') || 'Все форматы'}
                  </option>
                  <option value="Online">
                    {getTranslation('events.online') || 'Онлайн'}
                  </option>
                  <option value="Offline">
                    {getTranslation('events.offline') || 'Офлайн'}
                  </option>
                </select>
              </div>

              {/* Дата с */}
              <div>
                <label htmlFor="from_date" className="block text-xs font-medium text-gray-600 mb-2 tilda-font">
                  {getTranslation('events.fromDate') || 'Дата с'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="from_date"
                    name="from_date"
                    value={filters.from_date}
                    onChange={handleFilterChange}
                    className="w-full pl-9 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-sm tilda-font"
                  />
                </div>
              </div>

              {/* Дата по */}
              <div>
                <label htmlFor="to_date" className="block text-xs font-medium text-gray-600 mb-2 tilda-font">
                  {getTranslation('events.toDate') || 'Дата по'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="to_date"
                    name="to_date"
                    value={filters.to_date}
                    onChange={handleFilterChange}
                    className="w-full pl-9 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-sm tilda-font"
                  />
                </div>
              </div>

              {/* Кнопка сброса */}
              <div className="flex items-end">
                {hasActiveFilters() ? (
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center tilda-font"
                  >
                    <X size={16} className="mr-2" />
                    {getTranslation('events.resetFilters') || 'Сбросить'}
                  </button>
                ) : (
                  <div className="w-full text-xs text-gray-500 px-3 tilda-font">
                    {getTranslation('events.filtersHelp') || 'Используйте фильтры'}
                  </div>
                )}
              </div>
            </div>

            {/* Активные фильтры */}
            {hasActiveFilters() && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <div className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium tilda-font">
                      <Search size={12} className="mr-1" />
                      {filters.search}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {filters.format && (
                    <div className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium tilda-font">
                      {filters.format === 'Online' ? 'Онлайн' : 'Офлайн'}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, format: '' }))}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {filters.from_date && (
                    <div className="inline-flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium tilda-font">
                      <Calendar size={12} className="mr-1" />
                      С: {filters.from_date}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, from_date: '' }))}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {filters.to_date && (
                    <div className="inline-flex items-center bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium tilda-font">
                      <Calendar size={12} className="mr-1" />
                      По: {filters.to_date}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, to_date: '' }))}
                        className="ml-2 text-pink-600 hover:text-pink-800"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Список мероприятий */}
          <EventsList
            filters={filters}
            getTranslation={getTranslation}
            currentLang={lang}
          />
        </div>
      </Layout>
    </>
  );
}