import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { VACANCIES_API, appendQueryParams } from '../../../utils/apiConfig';
import { formatDate } from '../../../utils/dateUtils';
import CompactJobSearchFilter from '../../../components/vacancies/CompactJobSearchFilter';
import PopularSearches from '../../../components/vacancies/PopularSearches';

import {
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Users,
  DollarSign,
  RefreshCw,
  ArrowRight,
  TestTube,
  Info
} from 'lucide-react';

export default function VacanciesList({ initialFilters = {}, getTranslation, currentLang }) {
  const router = useRouter();
  const activeLang = router.query.lang || currentLang || 'ru';

  const safeGetTranslation = (key) => {
    if (typeof getTranslation === 'function') {
      return getTranslation(key);
    }
    const translations = {
      'vacancies.availablePositions': activeLang === 'kz' ? 'Қолжетімді позициялар' : 'Доступные позиции',
      'vacancies.fetchError': activeLang === 'kz' ? 'Вакансияларды жүктеу кезінде қате' : 'Ошибка при загрузке вакансий',
      'vacancies.loadMore': activeLang === 'kz' ? 'Көбірек жүктеу' : 'Загрузить еще',
      'vacancies.deadline': activeLang === 'kz' ? 'Соңғы мерзім' : 'Срок подачи',
      'vacancies.posted': activeLang === 'kz' ? 'Жарияланды' : 'Опубликовано',
      'vacancies.noVacancies': activeLang === 'kz' ? 'Бос жұмыс орындары табылмады' : 'Вакансии не найдены',
      'vacancies.loading': activeLang === 'kz' ? 'Жүктелуде...' : 'Загрузка...',
      'vacancies.moreDetails': activeLang === 'kz' ? 'Толығырақ' : 'Подробнее',
      'vacancies.noVacanciesDescription': activeLang === 'kz' ? 'Жақында жаңа вакансиялар пайда болады. Жаңартуларды күтіңіз!' : 'Скоро появятся новые вакансии. Следите за обновлениями!',
      'vacancies.foundResults': activeLang === 'kz' ? 'Табылған нәтижелер' : 'Найдено результатов',
      'vacancies.page': activeLang === 'kz' ? 'Бет' : 'Страница',
      'vacancies.of': activeLang === 'kz' ? 'дан' : 'из',
      'vacancies.searchResults': activeLang === 'kz' ? 'Іздеу нәтижелері' : 'Результаты поиска',
      'vacancies.testMode': activeLang === 'kz' ? 'Раздел находится в тестовом режиме' : 'Раздел находится в тестовом режиме',
      'vacancies.officialLaunch': activeLang === 'kz' ? 'Ресми іске қосу 15 қазанға жоспарланған' : 'Официальный запуск запланирован на 15 октября'
    };
    return translations[key] || key;
  };

  const [vacancies, setVacancies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageInfo, setPageInfo] = useState({
    current_page: 1,
    total_pages: 1,
    per_page: 10,
    has_next: false,
    has_prev: false
  });
  const [currentFilters, setCurrentFilters] = useState({ lang: activeLang });

  const getLocalizedField = (vacancy, fieldName) => {
    if (!vacancy) return '';
    return vacancy[`${fieldName}_${activeLang}`] || vacancy[`${fieldName}_ru`] || vacancy[`${fieldName}_kz`] || vacancy[fieldName] || '';
  };

  const getEmploymentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'полная занятость':
      case 'толық жұмыс':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white';
      case 'частичная занятость':
      case 'ішінара жұмыспен қамту':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
      case 'проектная работа':
      case 'жобалық жұмыс':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
      case 'стажировка':
      case 'тәжірибеден өту':
        return 'bg-gradient-to-r from-orange-500 to-amber-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getWorkTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'удаленная работа':
      case 'қашықтықтан жұмыс':
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white';
      case 'офис':
        return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white';
      case 'гибридный формат':
      case 'гибридті формат':
        return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  // Обработка фильтров (для кнопки "Применить фильтры")
  const handleFilter = (filterData) => {
    console.log('Filter applied:', filterData);
    const filtersWithLang = { ...filterData, lang: activeLang };
    setCurrentFilters(filtersWithLang);
    setPage(1);
  };

  // Обработка автопоиска (для живого поиска)
  const handleSearch = (filterData) => {
    console.log('Auto-search:', filterData);
    const filtersWithLang = { ...filterData, lang: activeLang };
    setCurrentFilters(filtersWithLang);
    setPage(1);
  };

  const handlePopularSearch = (searchQuery) => {
    console.log('Popular search clicked:', searchQuery);
    const filters = { keyword: searchQuery, lang: activeLang };
    setCurrentFilters(filters);
    setPage(1);
  };

  useEffect(() => {
    const fetchVacancies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const skip = (page - 1) * 10;
        const queryParams = {
          ...currentFilters,
          skip: skip,
          limit: 10
        };

        const url = appendQueryParams(VACANCIES_API.LIST, queryParams);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();
        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response:', responseText);
          throw new Error('Invalid JSON response from server');
        }

        if (data && data.vacancies && Array.isArray(data.vacancies)) {
          if (page === 1) {
            setVacancies(data.vacancies);
          } else {
            setVacancies(prev => [...prev, ...data.vacancies]);
          }

          setTotalCount(data.total_count || 0);
          setPageInfo(data.page_info || {
            current_page: page,
            total_pages: 1,
            per_page: 10,
            has_next: false,
            has_prev: false
          });

        } else if (Array.isArray(data)) {
          console.warn('Using legacy API response format');
          if (page === 1) {
            setVacancies(data);
          } else {
            setVacancies(prev => [...prev, ...data]);
          }
          setTotalCount(data.length);
          setPageInfo({
            current_page: page,
            total_pages: 1,
            per_page: 10,
            has_next: data.length >= 10,
            has_prev: page > 1
          });
        } else {
          setVacancies([]);
          setTotalCount(0);
          setPageInfo({
            current_page: 1,
            total_pages: 1,
            per_page: 10,
            has_next: false,
            has_prev: false
          });
        }

      } catch (err) {
        console.error('Error fetching vacancies:', err);
        setError(safeGetTranslation('vacancies.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVacancies();
  }, [currentFilters, page, activeLang]);

  useEffect(() => {
    setPage(1);
  }, [currentFilters]);

  const loadMore = () => {
    if (pageInfo.has_next && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const getResultsText = () => {
    if (totalCount === 0) return '';

    const start = ((pageInfo.current_page - 1) * pageInfo.per_page) + 1;
    const end = Math.min(pageInfo.current_page * pageInfo.per_page, totalCount);

    if (activeLang === 'kz') {
      return `${start}-${end} ${totalCount} ішінен көрсетілген`;
    } else {
      return `Показано ${start}-${end} из ${totalCount}`;
    }
  };

  const TestModeNotice = () => (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
            <TestTube size={18} className="text-orange-600" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Info size={16} className="text-orange-600" />
            <h3 className="text-sm font-semibold text-orange-800 tilda-font">
              {safeGetTranslation('vacancies.testMode')}
            </h3>
          </div>
          <p className="text-sm text-orange-700 tilda-font">
            {safeGetTranslation('vacancies.officialLaunch')}
          </p>
        </div>
      </div>
    </div>
  );

  if (isLoading && page === 1) {
    return (
      <>
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

          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <TestModeNotice />
            <CompactJobSearchFilter
              currentLang={activeLang}
              onFilter={handleFilter}
              onSearch={handleSearch}
              totalCount={totalCount}
            />
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
              <p className="text-lg text-gray-600 tilda-font">{safeGetTranslation('vacancies.loading')}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error && page === 1) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <TestModeNotice />
            <CompactJobSearchFilter
              currentLang={activeLang}
              onFilter={handleFilter}
              onSearch={handleSearch}
              totalCount={totalCount}
            />
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="bg-red-500 text-white rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Briefcase size={20} className="mr-3" />
                  <h3 className="text-lg font-semibold tilda-font">Ошибка загрузки</h3>
                </div>
                <p className="tilda-font">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!vacancies || vacancies.length === 0) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <TestModeNotice />
            <CompactJobSearchFilter
              currentLang={activeLang}
              onFilter={handleFilter}
              onSearch={handleSearch}
              totalCount={totalCount}
            />
            <PopularSearches
              currentLang={activeLang}
              onSearchClick={handlePopularSearch}
            />

            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <Briefcase size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 tilda-font">
                  {safeGetTranslation('vacancies.noVacancies')}
                </h3>
                <p className="text-gray-600 tilda-font">
                  {safeGetTranslation('vacancies.noVacanciesDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
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

        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .vacancy-card {
          transition: all 0.2s ease;
        }

        .vacancy-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <TestModeNotice />

          <CompactJobSearchFilter
            currentLang={activeLang}
            onFilter={handleFilter}
            onSearch={handleSearch}
            totalCount={totalCount}
          />

          {/* Заголовок с результатами */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 tilda-font flex items-center">
              <Briefcase size={28} className="mr-3 text-purple-600" />
              {Object.keys(currentFilters).length > 1 ?
                safeGetTranslation('vacancies.searchResults') :
                safeGetTranslation('vacancies.availablePositions')
              }
            </h2>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold tilda-font text-sm">
                {safeGetTranslation('vacancies.foundResults')}: {totalCount}
              </div>

              {totalCount > 0 && (
                <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-full text-sm tilda-font">
                  {getResultsText()}
                </div>
              )}
            </div>
          </div>

          {pageInfo.total_pages > 1 && (
            <div className="mb-4 text-sm text-gray-500 tilda-font">
              {safeGetTranslation('vacancies.page')} {pageInfo.current_page} {safeGetTranslation('vacancies.of')} {pageInfo.total_pages}
            </div>
          )}

          <div className="space-y-4">
            {vacancies.map((vacancy) => (
              <Link href={`/${activeLang}/vacancy_detail/${vacancy.id}`} key={vacancy.id} legacyBehavior>
                <a className="block vacancy-card">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:border-purple-200 border border-transparent">
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {vacancy.employment_type && (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getEmploymentTypeColor(vacancy.employment_type)}`}>
                            <Users size={12} className="mr-1" />
                            {vacancy.employment_type}
                          </span>
                        )}

                        {vacancy.work_type && (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getWorkTypeColor(vacancy.work_type)}`}>
                            <Briefcase size={12} className="mr-1" />
                            {vacancy.work_type}
                          </span>
                        )}

                        {vacancy.salary && (
                          <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                            <DollarSign size={12} className="mr-1" />
                            {vacancy.salary.toLocaleString()} ₸
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-3 tilda-font hover:text-purple-600 transition-colors">
                        {getLocalizedField(vacancy, 'title')}
                      </h3>

                      <p className="text-gray-600 mb-4 text-sm leading-relaxed tilda-font line-clamp-2">
                        {getLocalizedField(vacancy, 'description')}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          {getLocalizedField(vacancy, 'location') && (
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-1 text-purple-500" />
                              <span className="tilda-font">{getLocalizedField(vacancy, 'location')}</span>
                            </div>
                          )}
                          {vacancy.deadline && (
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1 text-blue-500" />
                              <span className="tilda-font">
                                {safeGetTranslation('vacancies.deadline')}: {formatDate(vacancy.deadline, activeLang)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1 text-green-500" />
                            <span className="tilda-font">
                              {safeGetTranslation('vacancies.posted')}: {formatDate(vacancy.created_at, activeLang)}
                            </span>
                          </div>
                        </div>

                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md tilda-font">
                          {safeGetTranslation('vacancies.moreDetails')}
                          <ArrowRight size={14} className="ml-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {isLoading && page > 1 && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}

          {pageInfo.has_next && !isLoading && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md tilda-font"
              >
                <RefreshCw size={18} className="mr-2" />
                {safeGetTranslation('vacancies.loadMore')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}