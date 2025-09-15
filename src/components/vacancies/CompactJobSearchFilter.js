import { useState, useEffect, useRef } from 'react';
import { VACANCIES_API, appendQueryParams } from '../../utils/apiConfig';
import {
  Search,
  Filter,
  Clock,
  DollarSign,
  MapPin,
  Settings,
  X
} from 'lucide-react';

// Выносим salaryMapping за пределы компонента
const SALARY_MAPPING = {
  '50000': 50000,
  '100000': 100000,
  '200000': 200000,
  '300000': 300000,
  '500000': 500000
};

export default function CompactJobSearchFilter({ currentLang = 'ru', onFilter, onSearch, totalCount = 0 }) {
  const [keyword, setKeyword] = useState('');
  const [employment_type, setEmployment_type] = useState('');
  const [work_type, setWork_type] = useState('');
  const [min_salary, setMin_salary] = useState('');
  const [location, setLocation] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Используем useRef для хранения timeout ID
  const debounceTimeoutRef = useRef(null);

  // Переводы
  const translations = {
    'ru': {
      searchPlaceholder: 'Поиск вакансий...',
      filters: 'Фильтры',
      location: 'Местоположение',
      locationPlaceholder: 'Город или регион',
      employmentType: 'Тип занятости',
      workType: 'Тип работы',
      salary: 'Минимальная зарплата',
      applyFilters: 'Применить фильтры',
      clearFilters: 'Очистить',
      foundResults: 'Найдено {count} вакансий',
      // Опции для селектов
      any: 'Любой',
      fullTime: 'Полная занятость',
      partTime: 'Частичная занятость',
      project: 'Проектная работа',
      internship: 'Стажировка',
      remote: 'Удаленная работа',
      office: 'Офис',
      hybrid: 'Гибридный формат'
    },
    'kz': {
      searchPlaceholder: 'Вакансия іздеу...',
      filters: 'Сүзгілер',
      location: 'Орналасқан жері',
      locationPlaceholder: 'Қала немесе аймақ',
      employmentType: 'Жұмыспен қамту түрі',
      workType: 'Жұмыс түрі',
      salary: 'Ең төменгі жалақы',
      applyFilters: 'Сүзгіні қолдану',
      clearFilters: 'Тазалау',
      foundResults: '{count} вакансия табылды',
      // Опции для селектов
      any: 'Кез келген',
      fullTime: 'Толық жұмыспен қамту',
      partTime: 'Ішінара жұмыспен қамту',
      project: 'Жобалық жұмыс',
      internship: 'Тәжірибеден өту',
      remote: 'Қашықтықтан жұмыс',
      office: 'Кеңсе',
      hybrid: 'Гибридті формат'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  // Функция для создания фильтров
  const createFilters = (searchTerm) => {
    const filters = {
      lang: currentLang
    };

    // Добавляем фильтры только если они не пустые
    if (searchTerm && searchTerm.trim()) {
      filters.keyword = searchTerm.trim();
    }
    if (employment_type) {
      filters.employment_type = employment_type;
    }
    if (work_type) {
      filters.work_type = work_type;
    }
    if (min_salary) {
      filters.min_salary = SALARY_MAPPING[min_salary];
    }
    if (location && location.trim()) {
      filters.location = location.trim();
    }

    return filters;
  };

  // Debounce функция отдельно
  const triggerSearch = () => {
    // Очищаем предыдущий таймаут
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Не запускаем автопоиск если все поля пустые
    if (!keyword.trim() && !employment_type && !work_type && !min_salary && !location.trim()) {
      return;
    }

    // Устанавливаем новый таймаут
    debounceTimeoutRef.current = setTimeout(() => {
      if (onSearch) {
        const filters = createFilters(keyword);
        console.log('Auto-search triggered:', filters);
        onSearch(filters);
      }
    }, 500);
  };

  // Отслеживаем изменения только ключевого слова для автопоиска
  useEffect(() => {
    triggerSearch();

    // Очистка таймаута при размонтировании
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [keyword]); // Только keyword в зависимостях для автопоиска

  // Обработка изменения ключевого слова
  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  // Применить фильтры (для кнопки в мобильном диалоге)
  const handleApplyFilters = () => {
    const filters = createFilters(keyword);
    if (onFilter) {
      onFilter(filters);
    }
    setShowMobileFilters(false);
  };

  // Очистить фильтры
  const handleClearFilters = () => {
    // Очищаем debounce таймаут
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setKeyword('');
    setEmployment_type('');
    setWork_type('');
    setMin_salary('');
    setLocation('');

    const defaultFilters = { lang: currentLang };
    if (onFilter) {
      onFilter(defaultFilters);
    }
    setShowMobileFilters(false);
  };

  // Проверить есть ли активные фильтры
  const hasActiveFilters = employment_type || work_type || min_salary || location;

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Regular.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
        }
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .search-input {
          transition: all 0.2s ease;
        }
        .search-input:focus {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }

        /* Bottom Sheet стили */
        .bottom-sheet-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 50;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .bottom-sheet-overlay.open {
          opacity: 1;
        }

        .bottom-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-radius: 20px 20px 0 0;
          z-index: 51;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          max-height: 80vh;
          overflow-y: auto;
        }
        .bottom-sheet.open {
          transform: translateY(0);
        }

        .bottom-sheet-handle {
          width: 40px;
          height: 4px;
          background: #d1d5db;
          border-radius: 2px;
          margin: 12px auto 20px;
        }
      `}</style>

      {/* Компактная строка поиска */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Поисковое поле */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={handleKeywordChange}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 transition-colors tilda-font text-sm sm:text-base search-input"
            />
          </div>

          {/* Кнопка фильтров */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 tilda-font text-sm ${
              hasActiveFilters
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">{t.filters}</span>
            {hasActiveFilters && (
              <span className="bg-white text-purple-600 text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-semibold">
                {[employment_type, work_type, min_salary, location].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Показать количество результатов если есть */}
        {totalCount > 0 && (
          <div className="mt-3 text-sm text-gray-600 tilda-font">
            {t.foundResults.replace('{count}', totalCount.toLocaleString())}
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      {showMobileFilters && (
        <>
          <div
            className={`bottom-sheet-overlay ${showMobileFilters ? 'open' : ''}`}
            onClick={() => setShowMobileFilters(false)}
          />
          <div className={`bottom-sheet ${showMobileFilters ? 'open' : ''}`}>
            <div className="bottom-sheet-handle" />

            <div className="px-4 pb-6">
              {/* Заголовок */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 tilda-font flex items-center">
                  <Filter size={20} className="mr-2 text-purple-600" />
                  {t.filters}
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Местоположение */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                    <MapPin size={14} className="inline mr-1 text-purple-600" />
                    {t.location}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.locationPlaceholder}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 transition-colors tilda-font"
                  />
                </div>

                {/* Тип занятости */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                    <Clock size={14} className="inline mr-1 text-purple-600" />
                    {t.employmentType}
                  </label>
                  <select
                    value={employment_type}
                    onChange={(e) => setEmployment_type(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 transition-colors tilda-font bg-white"
                  >
                    <option value="">{t.any}</option>
                    <option value="полная занятость">{t.fullTime}</option>
                    <option value="частичная занятость">{t.partTime}</option>
                    <option value="проектная работа">{t.project}</option>
                    <option value="стажировка">{t.internship}</option>
                  </select>
                </div>

                {/* Тип работы */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                    <Settings size={14} className="inline mr-1 text-blue-600" />
                    {t.workType}
                  </label>
                  <select
                    value={work_type}
                    onChange={(e) => setWork_type(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 transition-colors tilda-font bg-white"
                  >
                    <option value="">{t.any}</option>
                    <option value="удаленная работа">{t.remote}</option>
                    <option value="офис">{t.office}</option>
                    <option value="гибридный формат">{t.hybrid}</option>
                  </select>
                </div>

                {/* Зарплата */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                    <DollarSign size={14} className="inline mr-1 text-green-600" />
                    {t.salary}
                  </label>
                  <select
                    value={min_salary}
                    onChange={(e) => setMin_salary(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 transition-colors tilda-font bg-white"
                  >
                    <option value="">{t.any}</option>
                    <option value="50000">от 50 000 ₸</option>
                    <option value="100000">от 100 000 ₸</option>
                    <option value="200000">от 200 000 ₸</option>
                    <option value="300000">от 300 000 ₸</option>
                    <option value="500000">от 500 000 ₸</option>
                  </select>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors tilda-font"
                >
                  {t.clearFilters}
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-md transition-all duration-200 tilda-font"
                >
                  {t.applyFilters}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}