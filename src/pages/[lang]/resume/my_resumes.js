import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import HeaderBack from '../../../components/HeaderBack';
import { RESUMES_API } from '../../../utils/apiConfig';
import { formatDate } from '../../../utils/dateUtils';
import {
  FileText,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  AlertCircle,
  MoreVertical,
  Trash2,
  Settings,
  CheckCircle
} from 'lucide-react';

export default function MyResumesPage() {
  const router = useRouter();
  const currentLang = router.query.lang || 'ru';

  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [success, setSuccess] = useState('');

  // Переводы
  const translations = {
    'ru': {
      title: 'Мои резюме',
      backToProfile: 'К профилю',
      createResume: 'Создать резюме',
      noResumes: 'У вас пока нет резюме',
      noResumesDescription: 'Создайте свое первое резюме, чтобы найти работу мечты',
      published: 'Опубликовано',
      draft: 'Черновик',
      lastUpdated: 'Обновлено',
      createdAt: 'Создано',
      edit: 'Редактировать',
      view: 'Просмотр',
      publish: 'Опубликовать',
      unpublish: 'Снять с публикации',
      delete: 'Удалить',
      education: 'образование',
      experience: 'опыт работы',
      skills: 'навыки',
      loading: 'Загрузка...',
      errorTitle: 'Ошибка загрузки',
      salary: 'Зарплата',
      location: 'Местоположение',
      profession: 'Профессия',
      publishSuccess: 'Резюме опубликовано',
      unpublishSuccess: 'Резюме снято с публикации',
      deleteSuccess: 'Резюме удалено',
      deleteConfirm: 'Вы действительно хотите удалить это резюме?',
      quickView: 'Быстрый просмотр',
      quickEdit: 'Быстрое редактирование'
    },
    'kz': {
      title: 'Менің түйіндемелерім',
      backToProfile: 'Профильге',
      createResume: 'Түйіндеме жасау',
      noResumes: 'Сізде әзірше түйіндеме жоқ',
      noResumesDescription: 'Арман жұмысыңызды табу үшін алғашқы түйіндемеңізді жасаңыз',
      published: 'Жарияланған',
      draft: 'Жобасы',
      lastUpdated: 'Жаңартылды',
      createdAt: 'Жасалды',
      edit: 'Өзгерту',
      view: 'Қарау',
      publish: 'Жариялау',
      unpublish: 'Жариялаудан алып тастау',
      delete: 'Жою',
      education: 'білім',
      experience: 'жұмыс тәжірибесі',
      skills: 'дағдылар',
      loading: 'Жүктелуде...',
      errorTitle: 'Жүктеу қатесі',
      salary: 'Жалақы',
      location: 'Орналасқан жері',
      profession: 'Мамандық',
      publishSuccess: 'Түйіндеме жарияланды',
      unpublishSuccess: 'Түйіндеме жариялаудан алынды',
      deleteSuccess: 'Түйіндеме жойылды',
      deleteConfirm: 'Бұл түйіндемені жою керек пе?',
      quickView: 'Жылдам қарау',
      quickEdit: 'Жылдам өзгерту'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  useEffect(() => {
    fetchMyResumes();
    fetchStats();
  }, []);

  const fetchMyResumes = async () => {
    try {
      setLoading(true);
      const response = await fetch(RESUMES_API.MY, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(RESUMES_API.STATS, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handlePublish = async (resumeId, isPublished) => {
    try {
      const endpoint = isPublished ? RESUMES_API.UNPUBLISH(resumeId) : RESUMES_API.PUBLISH(resumeId);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(isPublished ? t.unpublishSuccess : t.publishSuccess);
        fetchMyResumes();
        fetchStats(); // Обновляем статистику
        // Скрыть сообщение через 3 секунды
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error updating publish status:', err);
      setError(err.message);
    }
    setActionMenu(null);
  };

  const handleDelete = async (resumeId) => {
    if (confirm(t.deleteConfirm)) {
      try {
        const response = await fetch(RESUMES_API.DELETE(resumeId), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setSuccess(t.deleteSuccess);
          fetchMyResumes();
          fetchStats(); // Обновляем статистику
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        console.error('Error deleting resume:', err);
        setError(err.message);
      }
    }
    setActionMenu(null);
  };

  // Обработчик клика по карточке резюме для быстрого просмотра
  const handleResumeClick = (resumeId) => {
    // Закрываем меню если оно открыто
    setActionMenu(null);
    // Переходим к просмотру резюме
    router.push(`/${currentLang}/profile/resumes/${resumeId}`);
  };

  if (loading) {
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
        `}</style>

        <Layout>
          <Head><title>{t.loading}</title></Head>
          <HeaderBack title={t.title} onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
                <p className="text-lg text-gray-600 tilda-font">{t.loading}</p>
              </div>
            </div>
          </div>
        </Layout>
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

        <Layout>
          <Head><title>{t.errorTitle}</title></Head>
          <HeaderBack title={t.title} onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 tilda-font">{t.errorTitle}</h2>
                <p className="text-gray-600 tilda-font">{error}</p>
              </div>
            </div>
          </div>
        </Layout>
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

        .resume-card {
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .resume-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .action-menu {
          position: absolute;
          right: 0;
          top: 100%;
          z-index: 10;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
          min-width: 160px;
        }

        .resume-card-content {
          position: relative;
        }

        .quick-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .resume-card:hover .quick-actions {
          opacity: 1;
        }
      `}</style>

      <Layout>
        <Head>
          <title>{t.title}</title>
        </Head>

        <HeaderBack title={t.title} onBack={() => router.back()} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-4">

            {/* Уведомления об успехе */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-500 mr-3" />
                  <p className="text-green-700 tilda-font">{success}</p>
                </div>
              </div>
            )}


            {/* Кнопка создания резюме */}
            <div className="mb-6">
              <Link href={`/${currentLang}/profile/resumes/create`} legacyBehavior>
                <a className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 tilda-font transform hover:-translate-y-1">
                  <Plus size={20} className="mr-2" />
                  {t.createResume}
                </a>
              </Link>
            </div>

            {/* Список резюме */}
            {resumes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <FileText size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 tilda-font">
                    {t.noResumes}
                  </h3>
                  <p className="text-gray-600 mb-6 tilda-font">
                    {t.noResumesDescription}
                  </p>
                  <Link href={`/${currentLang}/profile/resumes/create`} legacyBehavior>
                    <a className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 tilda-font">
                      <Plus size={18} className="mr-2" />
                      {t.createResume}
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden resume-card"
                    onClick={() => handleResumeClick(resume.id)}
                  >
                    <div className="p-6 resume-card-content">
                      {/* Быстрые действия */}
                      <div className="quick-actions">
                        <Link href={`/${currentLang}/profile/resumes/${resume.id}`} legacyBehavior>
                          <a
                            className="p-2 bg-white rounded-lg shadow-md text-gray-600 hover:text-purple-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title={t.quickView}
                          >
                            <Eye size={16} />
                          </a>
                        </Link>

                      </div>

                      {/* Заголовок и статус */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 tilda-font">
                              {resume.full_name}
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              resume.is_published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {resume.is_published ? (
                                <>
                                  <Eye size={12} className="mr-1" />
                                  {t.published}
                                </>
                              ) : (
                                <>
                                  <EyeOff size={12} className="mr-1" />
                                  {t.draft}
                                </>
                              )}
                            </span>
                          </div>

                          {/* Основная информация */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Briefcase size={14} className="mr-2 text-purple-500" />
                              <span className="tilda-font">{resume.profession_name || t.profession}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-2 text-blue-500" />
                              <span className="tilda-font">{resume.city_name || t.location}</span>
                            </div>
                            {resume.salary_expectation && (
                              <div className="flex items-center">
                                <DollarSign size={14} className="mr-2 text-green-500" />
                                <span className="tilda-font">{resume.salary_expectation}</span>
                              </div>
                            )}
                          </div>

                          {/* Даты */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              <span className="tilda-font">
                                {t.lastUpdated}: {formatDate(resume.updated_at, currentLang)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Меню действий */}

                      </div>

                      {/* Краткое описание */}
                      {resume.about_me && (
                        <p className="text-gray-600 text-sm leading-relaxed tilda-font line-clamp-2">
                          {resume.about_me}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Клик вне меню для закрытия */}
        {actionMenu && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setActionMenu(null)}
          />
        )}
      </Layout>
    </>
  );
}