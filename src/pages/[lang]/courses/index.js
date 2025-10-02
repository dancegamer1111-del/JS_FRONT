import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CourseCard from '../../../components/CourseCard';
import { CoursesAPI } from '../../../api/coursesAPI';
import {
  Search,
  Filter,
  X,
  RefreshCw,
  BookOpen,
  Award,
  Bookmark,
  TrendingUp,
  Grid,
  ChevronRight,
  DollarSign,
  Layers,
  Globe
} from 'lucide-react';

const CoursesPage = () => {
  const router = useRouter();

  // Состояния для разных типов курсов
  const [allCourses, setAllCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);

  // Состояния для UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showOnlyFree, setShowOnlyFree] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Состояния для авторизации и прогресса
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enrollments, setEnrollments] = useState({});

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Первичная загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dataToFetch = [
          CoursesAPI.getCourses(),
          CoursesAPI.getRecommendedCourses(),
          CoursesAPI.getPopularCourses(),
          CoursesAPI.getFreeCourses(),
          CoursesAPI.getCategories()
        ];

        if (isAuthenticated) {
          dataToFetch.push(CoursesAPI.getUserCourses());
        }

        const responses = await Promise.all(dataToFetch);

        setAllCourses(responses[0].data);

        const recommendedData = responses[1].data;
        setRecommendedCourses(recommendedData.length > 0 ? recommendedData : responses[0].data.slice(0, 4));

        const popularData = responses[2].data;
        setPopularCourses(popularData.length > 0 ? popularData : responses[0].data.slice(0, 4));

        setFreeCourses(responses[3].data);
        setCategories(responses[4].data);

        if (isAuthenticated && responses[5]?.data) {
          const userCourses = [];

          responses[5].data.forEach(enrollment => {
            if (enrollment.course && enrollment.course.id) {
              userCourses.push({
                id: enrollment.course.id,
                title: enrollment.course.title,
                description: enrollment.course.description,
                price: enrollment.course.price,
                currency: enrollment.course.currency,
                duration: enrollment.course.duration,
                level: enrollment.course.level,
                is_free: enrollment.course.is_free,
                cover_image: enrollment.course.cover_image,
                video_preview: enrollment.course.video_preview,
                language: enrollment.course.language,
                skills: enrollment.course.skills,
                enrollment_progress: enrollment.progress || 0,
                enrollment_date: enrollment.enrollment_date,
                enrollment_id: enrollment.id
              });
            }
          });

          setMyCourses(userCourses);
        }

        if (isAuthenticated) {
          const enrollmentData = {};
          const enrollmentPromises = [];

          responses[0].data.forEach(course => {
            enrollmentPromises.push(
              CoursesAPI.getCourseProgress(course.id)
                .then(response => {
                  enrollmentData[course.id] = response.data;
                })
                .catch(err => {
                  if (err.response?.status !== 404) {
                    console.error(`Ошибка при загрузке прогресса для курса ${course.id}:`, err);
                  }
                })
            );
          });

          await Promise.allSettled(enrollmentPromises);
          setEnrollments(enrollmentData);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных курсов:', err);
        setError(err.message || 'Не удалось загрузить курсы');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Обработка поиска курсов
  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;
      if (selectedLanguage) params.language = selectedLanguage;
      if (showOnlyFree) params.is_free = true;
      if (minPrice) params.price_min = parseFloat(minPrice);
      if (maxPrice) params.price_max = parseFloat(maxPrice);

      const response = await CoursesAPI.searchCourses(params);
      setSearchResults(response.data);
    } catch (err) {
      console.error('Ошибка при поиске курсов:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Сброс всех фильтров
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedLanguage('');
    setMinPrice('');
    setMaxPrice('');
    setShowOnlyFree(false);

    if (searchResults.length > 0) {
      handleSearch();
    }
  };

  // Проверка наличия активных фильтров
  const hasActiveFilters = () => {
    return searchQuery || selectedCategory || selectedLevel || selectedLanguage || minPrice || maxPrice || showOnlyFree;
  };

  // Форматирование цены курса
  const formatPrice = (course) => {
    if (course.is_free) return 'Бесплатно';
    return `${course.price} ${course.currency}`;
  };

  // Рендер секции с курсами
  const renderCourseSection = (title, courses, viewAllLink = null, icon = null) => (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        {icon}
        <h2 className="text-2xl font-bold text-gray-800 ml-2 tilda-font">{title}</h2>
      </div>
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              formatPrice={formatPrice}
              enrollment={
                course.enrollment_progress !== undefined
                  ? { progress: course.enrollment_progress }
                  : enrollments[course.id]
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 tilda-font">Курсы в этой категории отсутствуют</p>
        </div>
      )}
    </div>
  );

  if (loading) {
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

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 tilda-font">Загрузка курсов</h3>
              <p className="text-gray-600 tilda-font">Пожалуйста, подождите, пока мы подготовим для вас лучшие образовательные материалы</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                <X size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 tilda-font">Ошибка загрузки</h3>
              <p className="text-gray-600 mb-6 tilda-font">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors tilda-font"
              >
                <RefreshCw size={16} className="mr-2" />
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isActiveSearch = hasActiveFilters();
  const languages = [...new Set(allCourses.map(course => course.language))].filter(Boolean);
  const levels = [...new Set(allCourses.map(course => course.level))].filter(Boolean);

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

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 mb-8">
            <div className="md:flex md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-3 tilda-font">
                  ✨ Более 150+ курсов
                </div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center tilda-font">
                  <BookOpen className="mr-3" size={28} />
                  Образовательные курсы
                </h1>
                <p className="mt-2 opacity-90 tilda-font">
                  Повышайте свою квалификацию и осваивайте новые навыки с нашими адаптированными курсами
                </p>
              </div>

              <div className="max-w-xs w-full">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск курсов..."
                    className="w-full px-4 pl-10 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 tilda-font"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Десктоп фильтры */}
          <div className="hidden md:block mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="category" className="block text-xs font-medium text-gray-600 mb-2 tilda-font">
                    <div className="flex items-center">
                      <Layers size={14} className="mr-1 text-purple-600" />
                      Категория
                    </div>
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm text-sm tilda-font"
                  >
                    <option value="">Все категории</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="level" className="block text-xs font-medium text-gray-600 mb-2 tilda-font">
                    <div className="flex items-center">
                      <Award size={14} className="mr-1 text-purple-600" />
                      Уровень
                    </div>
                  </label>
                  <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm text-sm tilda-font"
                  >
                    <option value="">Любой уровень</option>
                    {levels.map((level, index) => (
                      <option key={index} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="language" className="block text-xs font-medium text-gray-600 mb-2 tilda-font">
                    <div className="flex items-center">
                      <Globe size={14} className="mr-1 text-purple-600" />
                      Язык
                    </div>
                  </label>
                  <select
                    id="language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm text-sm tilda-font"
                  >
                    <option value="">Любой язык</option>
                    {languages.map((language, index) => (
                      <option key={index} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>


              </div>

              {isPriceFilterOpen && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="minPrice" className="block text-xs font-medium text-gray-500 mb-1 tilda-font">
                        Минимальная цена
                      </label>
                      <input
                        type="number"
                        id="minPrice"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm text-sm tilda-font"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="maxPrice" className="block text-xs font-medium text-gray-500 mb-1 tilda-font">
                        Максимальная цена
                      </label>
                      <input
                        type="number"
                        id="maxPrice"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 shadow-sm text-sm tilda-font"
                        placeholder="Любая"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                {hasActiveFilters() && (
                  <button
                    onClick={resetFilters}
                    className="mr-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors text-sm font-medium flex items-center tilda-font"
                  >
                    <X size={16} className="mr-2" />
                    Сбросить
                  </button>
                )}
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none transition-colors text-sm font-medium flex items-center tilda-font"
                >
                  <Search size={16} className="mr-2" />
                  Применить фильтры
                </button>
              </div>
            </div>
          </div>

          {/* Мобильный фильтр */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 font-medium tilda-font"
            >
              <span className="flex items-center">
                <Filter size={18} className="mr-2 text-purple-600" />
                Фильтры
              </span>
              <ChevronRight size={18} className={`transform transition-transform ${isFilterExpanded ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {isFilterExpanded && (
            <div className="md:hidden mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 tilda-font">Фильтры курсов</h3>
                  <button
                    onClick={() => setIsFilterExpanded(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="category-mobile" className="block text-sm font-medium text-gray-700 mb-1 flex items-center tilda-font">
                      <Layers size={16} className="mr-2 text-purple-600" />
                      Категория
                    </label>
                    <select
                      id="category-mobile"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font"
                    >
                      <option value="">Все категории</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level-mobile" className="block text-sm font-medium text-gray-700 mb-1 flex items-center tilda-font">
                      <Award size={16} className="mr-2 text-purple-600" />
                      Уровень
                    </label>
                    <select
                      id="level-mobile"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font"
                    >
                      <option value="">Любой уровень</option>
                      {levels.map((level, index) => (
                        <option key={index} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="language-mobile" className="block text-sm font-medium text-gray-700 mb-1 flex items-center tilda-font">
                      <Globe size={16} className="mr-2 text-purple-600" />
                      Язык
                    </label>
                    <select
                      id="language-mobile"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font"
                    >
                      <option value="">Любой язык</option>
                      {languages.map((language, index) => (
                        <option key={index} value={language}>
                          {language}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center tilda-font">
                      <DollarSign size={16} className="mr-2 text-purple-600" />
                      Цена
                    </label>

                    <div className="flex items-center mb-3">
                      <input
                        id="showOnlyFree-mobile"
                        type="checkbox"
                        checked={showOnlyFree}
                        onChange={(e) => setShowOnlyFree(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="showOnlyFree-mobile" className="ml-2 block text-sm text-gray-700 tilda-font">
                        Только бесплатные
                      </label>
                    </div>

                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label htmlFor="minPrice-mobile" className="block text-xs font-medium text-gray-500 mb-1 tilda-font">
                          От
                        </label>
                        <input
                          type="number"
                          id="minPrice-mobile"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="maxPrice-mobile" className="block text-xs font-medium text-gray-500 mb-1 tilda-font">
                          До
                        </label>
                        <input
                          type="number"
                          id="maxPrice-mobile"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font"
                          placeholder="∞"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {hasActiveFilters() ? (
                    <button
                      onClick={resetFilters}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors text-sm font-medium flex items-center justify-center tilda-font"
                    >
                      <X size={16} className="mr-2" />
                      Сбросить
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsFilterExpanded(false)}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none transition-colors text-sm font-medium tilda-font"
                    >
                      Отмена
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleSearch();
                      setIsFilterExpanded(false);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none transition-colors text-sm font-medium flex items-center justify-center tilda-font"
                  >
                    <Search size={16} className="mr-2" />
                    Применить
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col mb-8">
            {isActiveSearch ? (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <Search size={24} className="text-purple-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-800 tilda-font">
                    Результаты поиска
                  </h2>
                </div>

                {isSearching ? (
                  <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600 font-medium tilda-font">Идет поиск подходящих курсов...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.map(course => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        formatPrice={formatPrice}
                        enrollment={enrollments[course.id]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                      <Search size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 tilda-font">Курсы не найдены</h3>
                    <p className="text-gray-600 mb-6 tilda-font">К сожалению, не удалось найти курсы по вашему запросу.</p>
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-colors tilda-font"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Сбросить фильтры
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {isAuthenticated && myCourses.length > 0 && (
                  renderCourseSection('Ваши курсы', myCourses, `/ru/my/courses`, <Bookmark size={24} className="text-indigo-600" />)
                )}
                {renderCourseSection('Рекомендуемые курсы', recommendedCourses, `/ru/courses/recommended`, <Award size={24} className="text-purple-600" />)}
                {renderCourseSection('Популярные курсы', popularCourses, `/ru/courses/popular`, <TrendingUp size={24} className="text-blue-600" />)}
                {renderCourseSection('Все курсы', allCourses, null, <Grid size={24} className="text-pink-600" />)}
              </>
            )}
          </div>
        </div>


      </div>
    </>
  );
};

export default CoursesPage;