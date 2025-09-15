import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import HeaderBack from '../../../components/HeaderBack';
import { VACANCIES_API } from '../../../utils/apiConfig';
import ApplicationModal from '../../../components/vacancies/ApplicationModal';
import { formatDate } from '../../../utils/dateUtils';
import {
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  FileText,
  CheckCircle,
  Building
} from 'lucide-react';

export default function VacancyDetailPage() {
  const router = useRouter();
  const { id, lang } = router.query;

  // Извлекаем язык из URL точно как в других компонентах
  const currentLang = router.query.lang || 'ru';

  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchVacancyDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const url = VACANCIES_API.DETAILS(id);
        const response = await fetch(url);

        if (!response.ok) {
          let errorMsg = `HTTP ошибка! Статус: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch (e) {
            // Если тело ответа не JSON или пустое
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setVacancy(data);
      } catch (err) {
        console.error('Ошибка при загрузке деталей вакансии:', err);
        setError(err.message || 'Произошла ошибка при загрузке информации о вакансии');
      } finally {
        setLoading(false);
      }
    };

    fetchVacancyDetails();
  }, [id]);

  const getLocalizedField = (fieldName) => {
    if (!vacancy) return '';
    return vacancy[`${fieldName}_${currentLang}`] || vacancy[`${fieldName}_ru`] || vacancy[`${fieldName}_kz`] || vacancy[fieldName] || '';
  };

  // Переводы прямо в файле
  const translations = {
    'ru': {
      title: 'Детали вакансии',
      backToList: 'Назад к списку',
      notFound: 'Вакансия не найдена',
      responsibilities: 'Должностные обязанности',
      requirements: 'Требования',
      apply: 'Подать заявку',
      posted: 'Опубликовано',
      deadline: 'Срок подачи',
      loading: 'Загрузка...',
      errorTitle: 'Ошибка загрузки',
      location: 'Местоположение',
      company: 'Компания',
      applyNow: 'Подать заявку',
      backToVacancies: 'К вакансиям',
      aboutVacancy: 'О вакансии',
      keyInfo: 'Ключевая информация'
    },
    'kz': {
      title: 'Вакансия мәліметтері',
      backToList: 'Тізімге қайту',
      notFound: 'Вакансия табылмады',
      responsibilities: 'Лауазымдық міндеттер',
      requirements: 'Талаптар',
      apply: 'Өтінім жіберу',
      posted: 'Жарияланды',
      deadline: 'Соңғы мерзім',
      loading: 'Жүктелуде...',
      errorTitle: 'Жүктеу қатесі',
      location: 'Орналасқан жері',
      company: 'Компания',
      applyNow: 'Өтінім жіберу',
      backToVacancies: 'Вакансияларға',
      aboutVacancy: 'Вакансия туралы',
      keyInfo: 'Негізгі ақпарат'
    }
  };

  const t = translations[currentLang] || translations['ru'];

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

  if (error || !vacancy) {
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
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 tilda-font">{error || t.notFound}</h2>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
                >
                  {t.backToList}
                </button>
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

        .info-card {
          transition: all 0.2s ease;
        }

        .info-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <Layout>
        <Head>
          <title>{getLocalizedField('title')} | {t.title}</title>
          <meta name="description" content={getLocalizedField('description')?.substring(0, 160) || getLocalizedField('title')} />
        </Head>

        <HeaderBack title={t.title} onBack={() => router.back()} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-4 space-y-4">

            {/* Компактный заголовок */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-4">
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
                      {vacancy.salary}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tilda-font leading-tight">
                  {getLocalizedField('title')}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                  {getLocalizedField('location') && (
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-purple-500" />
                      <span className="tilda-font">{getLocalizedField('location')}</span>
                    </div>
                  )}

                  {vacancy.company && (
                    <div className="flex items-center">
                      <Building size={16} className="mr-2 text-blue-500" />
                      <span className="tilda-font">{vacancy.company}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ключевая информация */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 info-card">
                <div className="flex items-center text-gray-500 mb-2">
                  <Calendar size={16} className="mr-2 text-green-500" />
                  <span className="text-sm font-medium tilda-font">{t.posted}</span>
                </div>
                <div className="text-sm font-bold text-gray-900 tilda-font">
                  {formatDate(vacancy.created_at, currentLang)}
                </div>
              </div>

              {vacancy.deadline && (
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 info-card">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Clock size={16} className="mr-2 text-orange-500" />
                    <span className="text-sm font-medium tilda-font">{t.deadline}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 tilda-font">
                    {formatDate(vacancy.deadline, currentLang)}
                  </div>
                </div>
              )}
            </div>

            {/* Описание/Обязанности */}
            {getLocalizedField('description') && (
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3 tilda-font flex items-center">
                  <FileText size={20} className="mr-2 text-purple-500" />
                  {t.responsibilities}
                </h2>
                <div className="text-gray-700 leading-relaxed tilda-font text-sm">
                  <div dangerouslySetInnerHTML={{
                    __html: getLocalizedField('description').replace(/\n/g, '<br />')
                  }} />
                </div>
              </div>
            )}

            {/* Требования */}
            {getLocalizedField('requirements') && (
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3 tilda-font flex items-center">
                  <CheckCircle size={20} className="mr-2 text-green-500" />
                  {t.requirements}
                </h2>
                <div className="text-gray-700 leading-relaxed tilda-font text-sm">
                  <div dangerouslySetInnerHTML={{
                    __html: getLocalizedField('requirements').replace(/\n/g, '<br />')
                  }} />
                </div>
              </div>
            )}

            {/* Действия */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 tilda-font text-lg transform hover:-translate-y-1"
              >
                {t.applyNow}
                <ArrowRight size={18} className="inline ml-2" />
              </button>

              <button
                onClick={() => router.back()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 tilda-font sm:w-auto"
              >
                {t.backToVacancies}
              </button>
            </div>
          </div>
        </div>

        {showModal && (
          <ApplicationModal
            vacancyId={vacancy.id}
            vacancyTitle={getLocalizedField('title')}
            onClose={() => setShowModal(false)}
            getTranslation={(key) => {
              const modalTranslations = {
                'vacancies.applyFor': currentLang === 'kz' ? 'Өтінім жіберу' : 'Подать заявку на',
                'vacancies.lastName': currentLang === 'kz' ? 'Тегі' : 'Фамилия',
                'vacancies.firstName': currentLang === 'kz' ? 'Аты' : 'Имя',
                'vacancies.email': currentLang === 'kz' ? 'Электрондық пошта' : 'Электронная почта',
                'vacancies.phone': currentLang === 'kz' ? 'Телефон' : 'Телефон',
                'vacancies.coverLetter': currentLang === 'kz' ? 'Ілеспе хат' : 'Сопроводительное письмо',
                'vacancies.resume': currentLang === 'kz' ? 'Түйіндеме' : 'Резюме',
                'vacancies.cancel': currentLang === 'kz' ? 'Болдырмау' : 'Отмена',
                'vacancies.submit': currentLang === 'kz' ? 'Жіберу' : 'Отправить',
                'vacancies.sending': currentLang === 'kz' ? 'Жіберілуде...' : 'Отправка...',
                'vacancies.applicationSent': currentLang === 'kz' ? 'Өтінім жіберілді' : 'Заявка отправлена',
                'vacancies.thankYouForApplication': currentLang === 'kz'
                  ? 'Өтініміңіз үшін рахмет! Біз сізбен жақын арада хабарласамыз.'
                  : 'Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время.',
                'vacancies.close': currentLang === 'kz' ? 'Жабу' : 'Закрыть',
                'vacancies.fillRequiredFields': currentLang === 'kz'
                  ? 'Барлық міндетті өрістерді толтырыңыз'
                  : 'Пожалуйста, заполните все обязательные поля',
                'vacancies.applicationError': currentLang === 'kz'
                  ? 'Өтінім жіберу кезінде қате орын алды'
                  : 'Произошла ошибка при отправке заявки',
                'vacancies.invalidFileFormat': currentLang === 'kz'
                  ? 'Файл пішіміне қолдау көрсетілмейді. Тек .doc, .docx немесе .pdf пішімдеріне рұқсат етіледі.'
                  : 'Неподдерживаемый формат файла. Разрешены только форматы .doc, .docx или .pdf'
              };
              return modalTranslations[key] || key;
            }}
          />
        )}
      </Layout>
    </>
  );
}