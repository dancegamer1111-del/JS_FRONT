import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PROJECTS_API, appendQueryParams } from '../../utils/apiConfig';
import { formatDate } from '../../utils/dateUtils';


import {
  Calendar,
  Clock,
  Users,
  FileText,
  RefreshCw,
  Search,
  Trophy,
  Play,
  Award,
  TrendingUp,
  Heart,
  Eye,
  ArrowRight
} from 'lucide-react';

export default function ProjectsList({ getTranslation, currentLang }) {
  const safeGetTranslation = (key) => {
    if (typeof getTranslation === 'function') {
      return getTranslation(key);
    }

    const translations = {
      'projects.availableProjects': currentLang === 'kz' ? 'Қолжетімді жобалар' : 'Доступные проекты',
      'projects.fetchError': currentLang === 'kz' ? 'Жобаларды жүктеу кезінде қате' : 'Ошибка при загрузке проектов',
      'projects.loadMore': currentLang === 'kz' ? 'Көбірек жүктеу' : 'Загрузить еще',
      'projects.noProjects': currentLang === 'kz' ? 'Жобалар табылмады' : 'Проекты не найдены',
      'projects.loading': currentLang === 'kz' ? 'Жүктелуде...' : 'Загрузка...',
      'projects.title': currentLang === 'kz' ? 'Жастар жобалары' : 'Молодежные проекты',
      'projects.description': currentLang === 'kz' ? 'Дауыс беруге қатысып, жобаларға өтінім беріңіз' : 'Участвуйте в голосованиях и подавайте заявки на проекты',
      'projects.searchPlaceholder': currentLang === 'kz' ? 'Жобаларды іздеу...' : 'Поиск проектов...',
      'projects.moreDetails': currentLang === 'kz' ? 'Толығырақ' : 'Подробнее',
      'projects.voting': currentLang === 'kz' ? 'Дауыс беру' : 'Голосование',
      'projects.application': currentLang === 'kz' ? 'Өтінімдерді қабылдау' : 'Прием заявок',
      'projects.active': currentLang === 'kz' ? 'Белсенді' : 'Активный',
      'projects.completed': currentLang === 'kz' ? 'Аяқталған' : 'Завершенный',
      'projects.participantsCount': currentLang === 'kz' ? 'қатысушы' : 'участников',
      'projects.votesCount': currentLang === 'kz' ? 'дауыс' : 'голосов',
      'projects.applicationsCount': currentLang === 'kz' ? 'өтінім' : 'заявок',
      'projects.endDate': currentLang === 'kz' ? 'Аяқталады' : 'Завершается',
      'projects.author': currentLang === 'kz' ? 'Автор' : 'Автор',
      'projects.noProjectsDescription': currentLang === 'kz' ? 'Жуырда жаңа жобалар пайда болады. Жаңартуларды күтіңіз!' : 'Скоро появятся новые проекты. Следите за обновлениями!',
      'projects.filter.all': currentLang === 'kz' ? 'Барлығы' : 'Все',
      'projects.filter.voting': currentLang === 'kz' ? 'Дауыс беру' : 'Голосование',
      'projects.filter.application': currentLang === 'kz' ? 'Өтінім' : 'Заявки',
      'projects.stats.total': currentLang === 'kz' ? 'Жалпы жобалар' : 'Всего проектов'
    };
    return translations[key] || key;
  };

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = {
          page,
          limit: 10,
        };

        const url = appendQueryParams(PROJECTS_API.LIST, queryParams);
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

        let processedData;

        if (Array.isArray(data)) {
          processedData = {
            items: data,
            total: data.length
          };
        } else if (data && Array.isArray(data.items)) {
          processedData = data;
        } else {
          console.warn('Unexpected API response format:', data);
          processedData = { items: [], total: 0 };
        }

        // ВРЕМЕННЫЙ КОСТЫЛЬ: фильтруем проект с id = 2
        const filteredItems = processedData.items.filter(project => project.id !== 2);

        if (page === 1) {
          setProjects(filteredItems);
        } else {
          setProjects(prev => [...prev, ...filteredItems]);
        }

        // Корректируем total с учетом скрытого проекта
        const adjustedTotal = processedData.total > 0 ? processedData.total - 1 : 0;
        setTotal(adjustedTotal);
        setHasMore(adjustedTotal > page * 10);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(safeGetTranslation('projects.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, []);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const getProjectTypeColor = (type) => {
    switch (type) {
      case 'voting':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
      case 'application':
        return 'bg-gradient-to-r from-green-500 to-teal-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
      case 'completed':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 'draft':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-400 to-pink-500 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    }
  };

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
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
              <p className="text-lg text-gray-600 tilda-font">{safeGetTranslation('projects.loading')}</p>
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="bg-red-500 text-white rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FileText size={20} className="mr-3" />
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

  if (!projects || projects.length === 0) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <div className="min-h-screen bg-gray-50">
          {/* Компактный Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm mb-4">
                  <Trophy size={32} />
                </div>
                <h1 className="text-3xl font-bold mb-2 tilda-font">
                  {safeGetTranslation('projects.title')}
                </h1>
                <p className="text-lg opacity-90 tilda-font">
                  {safeGetTranslation('projects.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <FileText size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 tilda-font">
                  {safeGetTranslation('projects.noProjects')}
                </h3>
                <p className="text-gray-600 tilda-font">
                  {safeGetTranslation('projects.noProjectsDescription')}
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

        .project-card {
          transition: all 0.2s ease;
        }

        .project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .filter-button {
          transition: all 0.2s ease;
        }

        .filter-button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* Компактная панель поиска и фильтров */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Поиск */}
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={safeGetTranslation('projects.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-0 transition-colors tilda-font"
                />
              </div>

              {/* Фильтры
              <div className="flex gap-2">
                {['all', 'voting', 'application'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 tilda-font filter-button ${
                      filterType === type
                        ? 'text-white shadow-md active'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {safeGetTranslation(`projects.filter.${type}`)}
                  </button>
                ))}
              </div>*/}
            </div>
          </div>

          {/* Компактный список проектов */}
          <div className="space-y-4">
            {projects.map((project) => (
              <Link href={`/${currentLang}/project_detail/${project.id}`} key={project.id} legacyBehavior>
                <a className="block project-card">
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:border-purple-200 border border-transparent">
                    <div className="md:flex">
                      {/* Компактное изображение */}
                      {project.photo_url ? (
                        <div className="md:flex-shrink-0 md:w-64">
                          <img
                            src={project.photo_url}
                            alt={project.title}
                            className="h-48 w-full object-cover md:h-full"
                          />
                        </div>
                      ) : (
                        <div className="md:flex-shrink-0 md:w-64">
                          <div className="h-48 md:h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                            <FileText size={48} className="text-white opacity-70" />
                          </div>
                        </div>
                      )}

                      {/* Компактный контент */}
                      <div className="p-6 flex-1">
                        {/* Теги и статус */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getProjectTypeColor(project.project_type)}`}>
                            {project.project_type === 'voting' ? (
                              <Award size={12} className="mr-1" />
                            ) : (
                              <FileText size={12} className="mr-1" />
                            )}
                            {safeGetTranslation(`projects.${project.project_type}`)}
                          </span>

                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(project.status)}`}>
                            {safeGetTranslation(`projects.${project.status}`)}
                          </span>

                          {project.video_url && (
                            <span className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                              <Play size={12} className="mr-1" />
                              Видео
                            </span>
                          )}
                        </div>

                        {/* Заголовок */}
                        <h3 className="text-xl font-bold text-gray-800 mb-3 tilda-font hover:text-purple-600 transition-colors">
                          {project.title}
                        </h3>

                        {/* Описание */}
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed tilda-font line-clamp-2">
                          {project.description}
                        </p>

                        {/* Метаданные и статистика в одной строке */}
                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Users size={14} className="mr-1 text-purple-500" />
                              <span className="tilda-font">{project.author}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar size={14} className="mr-1 text-blue-500" />
                              <span className="tilda-font">{formatDate(project.end_date, currentLang)}</span>
                            </div>
                          </div>

                          {/* Компактная статистика */}
                          <div className="flex items-center gap-4 text-sm">
                            {project.project_type === 'voting' && project.votes_count !== undefined && (
                              <div className="text-center">
                                <div className="font-bold text-green-600 tilda-font">{project.votes_count}</div>
                                <div className="text-xs text-gray-500 tilda-font">{safeGetTranslation('projects.votesCount')}</div>
                              </div>
                            )}

                            {project.project_type === 'application' && project.applications_count !== undefined && (
                              <div className="text-center">
                                <div className="font-bold text-purple-600 tilda-font">{project.applications_count}</div>
                                <div className="text-xs text-gray-500 tilda-font">{safeGetTranslation('projects.applicationsCount')}</div>
                              </div>
                            )}

                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md tilda-font">
                              {safeGetTranslation('projects.moreDetails')}
                              <ArrowRight size={14} className="ml-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>

          {/* Компактная загрузка */}
          {isLoading && page > 1 && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}

          {hasMore && !isLoading && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md tilda-font"
              >
                <RefreshCw size={18} className="mr-2" />
                {safeGetTranslation('projects.loadMore')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}