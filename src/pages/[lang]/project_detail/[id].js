import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import HeaderBack from '../../../components/HeaderBack';
import VotingModal from '../../../components/projects/VotingModal';
import ApplicationModal from '../../../components/projects/ApplicationModal';
import AuthRequiredModal from '../../../components/projects/AuthRequiredModal';
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
  MapPin
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
  `}</style>
);

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id, lang } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [currentLang, setCurrentLang] = useState('ru');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (lang && ['kz', 'ru', 'en'].includes(lang)) {
      setCurrentLang(lang);
    }
  }, [lang]);

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
        'project.socialMedia': 'Соцсети'
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
        'project.socialMedia': 'Соцжелілер'
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
          <title>{project.title}</title>
          <meta name="description" content={project.description?.substring(0, 160) || project.title} />
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
                    alt={project.title}
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
                  {project.title}
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

            {/* Компактное описание */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover-lift">
              <h2 className="text-lg font-bold text-gray-900 mb-3 tilda-font flex items-center">
                <FileText size={20} className="mr-2 text-purple-500" />
                {getTranslation('project.description')}
              </h2>
              <div className="text-gray-700 leading-relaxed tilda-font text-sm">
                <div dangerouslySetInnerHTML={{ __html: project.description?.replace(/\n/g, '<br />') || '' }} />
              </div>
            </div>

            {/* Компактное видео */}
            {project.video_url && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover-lift">
                <a
                  href={project.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-all duration-200 border border-red-200 group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all duration-200">
                      <Youtube size={16} className="text-white" />
                    </div>
                    <span className="font-medium text-red-900 tilda-font">{getTranslation('project.watchVideo')}</span>
                  </div>
                  <Play size={16} className="text-red-600 group-hover:text-red-700 transition-colors duration-200" />
                </a>
              </div>
            )}

            {/* Компактная галерея */}
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

            {/* Компактные участники */}
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
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {participant.photo_url ? (
                            <img
                              src={participant.photo_url}
                              alt={participant.name}
                              className="w-12 h-12 object-cover rounded-full shadow-sm border-2 border-white"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                              <User size={16} className="text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-gray-900 mb-1 tilda-font">
                                {participant.name}
                              </h4>
                              {participant.description && (
                                <p className="text-sm text-gray-600 tilda-font leading-relaxed mb-2 line-clamp-3">
                                  {participant.description}
                                </p>
                              )}

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
                                  <a href={participant.video_url} target="_blank" rel="noopener noreferrer"
                                     className="w-6 h-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110">
                                    <Youtube size={12} className="text-white" />
                                  </a>
                                )}
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
              if (success) window.location.reload();
            }}
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
              if (success) window.location.reload();
            }}
            lang={currentLang}
          />
        )}
      </Layout>
    </>
  );
}