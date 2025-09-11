import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import HeaderBack from '../../../components/HeaderBack';
import VotingModal from '../../../components/projects/VotingModal';
import ApplicationModal from '../../../components/projects/ApplicationModal';
import AuthRequiredModal from '../../../components/projects/AuthRequiredModal';
import ParticipantDetailModal from '../../../components/projects/ParticipantDetailModal';
import { PROJECTS_API } from '../../../utils/apiConfig';
import { formatDate } from '../../../utils/dateUtils';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Vote,
  Trophy,
  AlertTriangle,
  Youtube,
  User,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Play,
  Image as ImageIcon,
  MapPin,
  Eye,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Компактные стили шрифтов
const FontStyles = () => (
  <style jsx global>{`
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Light.ttf') format('truetype'); font-weight: 300; }
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Regular.ttf') format('truetype'); font-weight: 400; }
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Medium.ttf') format('truetype'); font-weight: 500; }
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Semibold.ttf') format('truetype'); font-weight: 600; }
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Bold.ttf') format('truetype'); font-weight: 700; }

    .tilda-font { font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .hover-lift { transition: all 0.2s ease; }
    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `}</style>
);

// Компонент для встроенного видео
const EmbeddedVideo = ({ videoUrl, className = "", autoplay = false }) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(true);

  // Функция для получения ID видео из YouTube URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <Youtube size={24} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 tilda-font">Неподдерживаемый формат видео</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0`}
        title="Video"
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

// Компонент для сворачиваемого описания
const CollapsibleDescription = ({ description, maxLength = 150, currentLang }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getTranslation = (key) => {
    const translations = {
      'ru': {
        'showMore': 'Показать больше',
        'showLess': 'Скрыть'
      },
      'kz': {
        'showMore': 'Толығырақ көрсету',
        'showLess': 'Жасыру'
      }
    };
    return translations[currentLang]?.[key] || translations['ru']?.[key] || key;
  };

  if (!description) return null;

  const shouldTruncate = isMobile && description.length > maxLength;
  const displayText = shouldTruncate && !isExpanded
    ? description.substring(0, maxLength) + '...'
    : description;

  return (
    <div className="text-gray-700 leading-relaxed tilda-font text-sm">
      <div dangerouslySetInnerHTML={{
        __html: displayText.replace(/\n/g, '<br />')
      }} />

      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors duration-200"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              {getTranslation('showLess')}
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              {getTranslation('showMore')}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id, lang } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [currentLang, setCurrentLang] = useState('ru');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (lang && ['kz', 'ru', 'en'].includes(lang)) {
      setCurrentLang(lang);
    }
  }, [lang]);

  // Функции для получения локализованного контента
  const getLocalizedTitle = (item) => {
    if (currentLang === 'ru' && item.title_ru) {
      return item.title_ru;
    }
    return item.title;
  };

  const getLocalizedDescription = (item) => {
    if (currentLang === 'ru' && item.description_ru) {
      return item.description_ru;
    }
    return item.description;
  };

  // Проверка авторизации
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
      }
    };

    checkAuth();

    // Проверяем при каждом фокусе на окне (если пользователь вернулся после логина)
    const handleFocus = () => checkAuth();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const url = PROJECTS_API.DETAILS(id);
        const response = await fetch(url);

        if (!response.ok) {
          let errorMsg = `HTTP ошибка! Статус: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.detail || errorMsg;
          } catch (e) {
            // Если тело ответа не JSON
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error('Ошибка при загрузке деталей проекта:', err);
        setError(err.message || 'Произошла ошибка при загрузке информации о проекте');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const getTranslation = (key, fallbackText = '') => {
    const translations = {
      'ru': {
        'project.title': 'Детали проекта',
        'project.backToList': 'Назад',
        'project.notFound': 'Проект не найден',
        'project.loading': 'Загрузка...',
        'project.errorTitle': 'Ошибка',
        'project.vote': 'Голос',
        'project.apply': 'Подать заявку',
        'project.voting': 'Голосование',
        'project.application': 'Заявки',
        'project.active': 'Активный',
        'project.completed': 'Завершен',
        'project.draft': 'Черновик',
        'project.cancelled': 'Отменен',
        'project.author': 'Автор',
        'project.startDate': 'Начало',
        'project.endDate': 'Конец',
        'project.participants': 'Участники',
        'project.results': 'Результаты',
        'project.totalVotes': 'Голосов',
        'project.applicationsCount': 'Заявок',
        'project.description': 'Описание',
        'project.gallery': 'Галерея',
        'project.watchVideo': 'Видео',
        'project.socialMedia': 'Соцсети',
        'project.viewDetails': 'Подробнее'
      },
      'kz': {
        'project.title': 'Жоба мәліметтері',
        'project.backToList': 'Артқа',
        'project.notFound': 'Жоба жоқ',
        'project.loading': 'Жүктелуде...',
        'project.errorTitle': 'Қате',
        'project.vote': 'Дауыс',
        'project.apply': 'Өтінім',
        'project.voting': 'Дауыс беру',
        'project.application': 'Өтінімдер',
        'project.active': 'Белсенді',
        'project.completed': 'Аяқталған',
        'project.draft': 'Жоба',
        'project.cancelled': 'Болдырылған',
        'project.author': 'Автор',
        'project.startDate': 'Басталуы',
        'project.endDate': 'Аяқталуы',
        'project.participants': 'Қатысушылар',
        'project.results': 'Нәтижелер',
        'project.totalVotes': 'Дауыстар',
        'project.applicationsCount': 'Өтінімдер',
        'project.description': 'Сипаттама',
        'project.gallery': 'Галерея',
        'project.watchVideo': 'Видео',
        'project.socialMedia': 'Соцжелілер',
        'project.viewDetails': 'Толығырақ'
      }
    };

    return translations[currentLang]?.[key] || translations['ru']?.[key] || fallbackText || key;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'completed': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'draft': return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const handleVote = (participant) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setSelectedParticipant(participant);
    setShowVotingModal(true);
  };

  const handleViewParticipantDetails = (participant) => {
    setSelectedParticipant(participant);
    setShowParticipantModal(true);
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setShowApplicationModal(true);
  };

  if (loading) {
    return (
      <>
        <FontStyles />
        <Layout>
          <Head><title>{getTranslation('project.loading')}</title></Head>
          <HeaderBack title={getTranslation('project.title')} onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 tilda-font">{getTranslation('project.loading')}</p>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <FontStyles />
        <Layout>
          <Head><title>{getTranslation('project.errorTitle')}</title></Head>
          <HeaderBack title={getTranslation('project.title')} onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 tilda-font">{error || getTranslation('project.notFound')}</h2>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
                >
                  {getTranslation('project.backToList')}
                </button>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  const now = new Date();
  const startDate = new Date(project.start_date);
  const endDate = new Date(project.end_date);
  const isActive = project.status === 'active' && now >= startDate && now <= endDate;

  return (
    <>
      <FontStyles />
      <Layout>
        <Head>
          <title>{getLocalizedTitle(project)}</title>
          <meta name="description" content={getLocalizedDescription(project)?.substring(0, 160) || getLocalizedTitle(project)} />
        </Head>

        <HeaderBack title={getTranslation('project.title')} onBack={() => router.back()} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-4 space-y-4">

            {/* Компактный заголовок с фото */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
              {project.photo_url && (
                <div className="relative">
                  <img
                    src={project.photo_url}
                    alt={getLocalizedTitle(project)}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(project.status)} tilda-font`}>
                    {getTranslation(`project.${project.status}`)}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-purple-100 text-purple-700 border border-purple-200 tilda-font">
                    {getTranslation(`project.${project.project_type}`)}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 tilda-font leading-tight">
                  {getLocalizedTitle(project)}
                </h1>

                <div className="flex items-center text-sm text-gray-600 tilda-font">
                  <User size={16} className="mr-2 text-purple-500" />
                  <span>{getTranslation('project.author')}: </span>
                  <span className="ml-1 font-medium text-gray-800">{project.author}</span>
                </div>
              </div>
            </div>

            {/* Компактная информация о датах */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover-lift">
                <div className="flex items-center text-gray-500 mb-2">
                  <Calendar size={16} className="mr-2 text-emerald-500" />
                  <span className="text-sm font-medium tilda-font">{getTranslation('project.startDate')}</span>
                </div>
                <div className="text-sm font-bold text-gray-900 tilda-font">
                  {formatDate(project.start_date, currentLang)}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover-lift">
                <div className="flex items-center text-gray-500 mb-2">
                  <Clock size={16} className="mr-2 text-rose-500" />
                  <span className="text-sm font-medium tilda-font">{getTranslation('project.endDate')}</span>
                </div>
                <div className="text-sm font-bold text-gray-900 tilda-font">
                  {formatDate(project.end_date, currentLang)}
                </div>
              </div>
            </div>

            {/* Компактное описание с локализацией и сворачиванием */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover-lift">
              <h2 className="text-lg font-bold text-gray-900 mb-3 tilda-font flex items-center">
                <FileText size={20} className="mr-2 text-purple-500" />
                {getTranslation('project.description')}
              </h2>
              <CollapsibleDescription
                description={getLocalizedDescription(project)}
                currentLang={currentLang}
              />
            </div>

            {/* Встроенное видео */}
            {project.video_url && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover-lift">
                <h3 className="font-bold text-gray-900 mb-3 tilda-font flex items-center">
                  <Play size={20} className="mr-2 text-purple-500" />
                  {getTranslation('project.watchVideo')}
                </h3>
                <EmbeddedVideo
                  videoUrl={project.video_url}
                  className="w-full h-48 sm:h-64"
                />
              </div>
            )}

            {/* Галерея с нумерацией */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover-lift">
                <h3 className="font-bold text-gray-900 mb-3 tilda-font flex items-center">
                  <ImageIcon size={20} className="mr-2 text-purple-500" />
                  {getTranslation('project.gallery')}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {project.gallery.slice(0, 8).map((image, index) => (
                    <div key={image.id || index} className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group">
                      <img
                        src={image.image_url}
                        alt={image.description || `Фото ${index + 1}`}
                        className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {/* Более заметная нумерация фото */}
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white tilda-font min-w-[24px] text-center">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                {project.gallery.length > 8 && (
                  <div className="text-center mt-3">
                    <span className="text-xs text-gray-500 tilda-font bg-gray-100 px-2 py-1 rounded-full">+{project.gallery.length - 8} еще</span>
                  </div>
                )}
              </div>
            )}

            {/* Компактные участники с улучшенным дизайном и местами */}
            {project.project_type === 'voting' && project.participants && project.participants.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 tilda-font flex items-center">
                      <Users size={20} className="mr-2 text-purple-500" />
                      {getTranslation('project.participants')}
                    </h3>
                    <span className="text-sm text-gray-600 tilda-font bg-white px-2 py-1 rounded-full shadow-sm font-medium">
                      {project.participants.length}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {project.participants.map((participant) => (
                    <div key={participant.id} className="p-4 hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 relative">
                          {participant.photo_url ? (
                            <img
                              src={participant.photo_url}
                              alt={participant.name}
                              className="w-14 h-14 object-cover rounded-xl shadow-sm border-2 border-white"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm border-2 border-white">
                              <User size={18} className="text-white" />
                            </div>
                          )}

                          {/* Индикатор места */}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-lg border-2 border-white ${
                              (() => {
                                // Сортируем участников по количеству голосов для определения места
                                const sortedParticipants = [...project.participants].sort((a, b) => b.votes_count - a.votes_count);
                                const place = sortedParticipants.findIndex(p => p.id === participant.id) + 1;

                                if (place === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900';
                                if (place === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
                                if (place === 3) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900';
                                return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
                              })()
                            } tilda-font min-w-[20px] text-center`}>
                              {(() => {
                                const sortedParticipants = [...project.participants].sort((a, b) => b.votes_count - a.votes_count);
                                const place = sortedParticipants.findIndex(p => p.id === participant.id) + 1;
                                return place;
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-gray-900 mb-1 tilda-font">
                            {participant.name}
                          </h4>
                          {getLocalizedDescription(participant) && (
                            <p className="text-sm text-gray-600 tilda-font leading-relaxed mb-2 line-clamp-2">
                              {getLocalizedDescription(participant)}
                            </p>
                          )}

                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {participant.instagram_url && (
                                <a href={participant.instagram_url} target="_blank" rel="noopener noreferrer"
                                   className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110">
                                  <Instagram size={12} className="text-white" />
                                </a>
                              )}
                              {participant.facebook_url && (
                                <a href={participant.facebook_url} target="_blank" rel="noopener noreferrer"
                                   className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110">
                                  <Facebook size={12} className="text-white" />
                                </a>
                              )}
                              {participant.video_url && (
                                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-sm">
                                  <Youtube size={12} className="text-white" />
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleViewParticipantDetails(participant)}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-md transition-all duration-200 tilda-font flex items-center gap-1"
                            >
                              <Info size={10} />
                              {getTranslation('project.viewDetails')}
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-purple-600 tilda-font">
                            {participant.votes_count}
                          </div>
                          <div className="text-xs text-gray-500 tilda-font mb-2">голосов</div>

                          {isActive && (
                            <button
                              onClick={() => handleVote(participant)}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font flex items-center gap-1"
                            >
                              <Vote size={12} />
                              {getTranslation('project.vote')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Компактные действия */}
            <div className="flex gap-3">
              {project.project_type === 'application' && isActive && (
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
                >
                  {getTranslation('project.apply')}
                </button>
              )}

              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
              >
                {getTranslation('project.backToList')}
              </button>
            </div>
          </div>
        </div>

        {/* Модалки */}
        {showVotingModal && (
          <VotingModal
            projectId={project.id}
            participant={selectedParticipant}
            onClose={(success) => {
              setShowVotingModal(false);
              setSelectedParticipant(null);
              if (success) {
                // Обновляем данные проекта
                const fetchProjectDetails = async () => {
                  try {
                    const url = PROJECTS_API.DETAILS(id);
                    const response = await fetch(url);
                    if (response.ok) {
                      const data = await response.json();
                      setProject(data);
                    }
                  } catch (err) {
                    console.error('Ошибка при обновлении данных:', err);
                  }
                };
                fetchProjectDetails();
              }
            }}
            lang={currentLang}
          />
        )}

        {/* Модалка детального просмотра участника */}
        {showParticipantModal && selectedParticipant && (
          <ParticipantDetailModal
            participant={selectedParticipant}
            onClose={() => {
              setShowParticipantModal(false);
              setSelectedParticipant(null);
            }}
            onVote={isActive ? () => {
              setShowParticipantModal(false);
              setShowVotingModal(true);
            } : null}
            lang={currentLang}
          />
        )}

        {/* Модалка авторизации */}
        {showAuthModal && (
          <AuthRequiredModal
            onClose={() => setShowAuthModal(false)}
            lang={currentLang}
          />
        )}

        {/* Модалка заявок */}
        {showApplicationModal && (
          <ApplicationModal
            projectId={project.id}
            onClose={(success) => {
              setShowApplicationModal(false);
            }}
            lang={currentLang}
          />
        )}
      </Layout>
    </>
  );
}