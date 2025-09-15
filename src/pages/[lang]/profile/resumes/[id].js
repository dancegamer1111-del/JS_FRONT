import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../components/Layout';
import HeaderBack from '../../../../components/HeaderBack';
import { RESUMES_API } from '../../../../utils/apiConfig';
import { formatDate } from '../../../../utils/dateUtils';
import {
  User,
  MapPin,
  Briefcase,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  Users,
  GraduationCap,
  Building,
  Award,
  Edit3,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Globe,
  Power,
  PowerOff
} from 'lucide-react';

export default function ResumeDetailPage() {
  const router = useRouter();
  const { id, lang } = router.query;
  const currentLang = lang || 'ru';

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Переводы
  const translations = {
    'ru': {
      title: 'Просмотр резюме',
      backToList: 'К списку резюме',
      edit: 'Редактировать',
      publish: 'Опубликовать',
      unpublish: 'Снять с публикации',
      activate: 'Активировать',
      deactivate: 'Деактивировать',
      published: 'Опубликовано',
      draft: 'Черновик',
      active: 'Активно',
      inactive: 'Неактивно',
      personalInfo: 'Личная информация',
      aboutMe: 'О себе',
      education: 'Образование',
      experience: 'Опыт работы',
      skills: 'Навыки',
      noEducation: 'Образование не указано',
      noExperience: 'Опыт работы не указан',
      noSkills: 'Навыки не указаны',
      noAbout: 'Описание не указано',
      phone: 'Телефон',
      birthDate: 'Дата рождения',
      citizenship: 'Гражданство',
      gender: 'Пол',
      male: 'Мужской',
      female: 'Женский',
      salary: 'Желаемая зарплата',
      employmentType: 'Тип занятости',
      profession: 'Профессия',
      location: 'Местоположение',
      current: 'по настоящее время',
      currentJob: 'Работаю в настоящее время',
      currentStudy: 'Учусь в настоящее время',
      publishSuccess: 'Резюме опубликовано',
      unpublishSuccess: 'Резюме снято с публикации',
      activateSuccess: 'Резюме активировано',
      deactivateSuccess: 'Резюме деактивировано',
      loading: 'Загрузка...',
      notFound: 'Резюме не найдено',
      // Уровни образования
      secondary: 'Среднее образование',
      vocational: 'Профессиональное образование',
      bachelor: 'Бакалавриат',
      master: 'Магистратура',
      phd: 'Докторантура'
    },
    'kz': {
      title: 'Түйіндемені қарау',
      backToList: 'Түйіндемелер тізіміне',
      edit: 'Өзгерту',
      publish: 'Жариялау',
      unpublish: 'Жариялаудан алып тастау',
      activate: 'Белсендіру',
      deactivate: 'Өшіру',
      published: 'Жарияланған',
      draft: 'Жобасы',
      active: 'Белсенді',
      inactive: 'Белсенді емес',
      personalInfo: 'Жеке ақпарат',
      aboutMe: 'Өзім туралы',
      education: 'Білім',
      experience: 'Жұмыс тәжірибесі',
      skills: 'Дағдылар',
      noEducation: 'Білім көрсетілмеген',
      noExperience: 'Жұмыс тәжірибесі көрсетілмеген',
      noSkills: 'Дағдылар көрсетілмеген',
      noAbout: 'Сипаттама көрсетілмеген',
      phone: 'Телефон нөмірі',
      birthDate: 'Туған күні',
      citizenship: 'Азаматтық',
      gender: 'Жынысы',
      male: 'Ер',
      female: 'Әйел',
      salary: 'Күтілетін жалақы',
      employmentType: 'Жұмыспен қамту түрі',
      profession: 'Мамандық',
      location: 'Орналасқан жері',
      current: 'қазіргі уақытқа дейін',
      currentJob: 'Қазір жұмыс істеп жатырмын',
      currentStudy: 'Қазір оқып жатырмын',
      publishSuccess: 'Түйіндеме жарияланды',
      unpublishSuccess: 'Түйіндеме жариялаудан алынды',
      activateSuccess: 'Түйіндеме белсендірілді',
      deactivateSuccess: 'Түйіндеме өшірілді',
      loading: 'Жүктелуде...',
      notFound: 'Түйіндеме табылмады',
      // Уровни образования
      secondary: 'Орта білім',
      vocational: 'Кәсіптік білім',
      bachelor: 'Бакалавриат',
      master: 'Магистратура',
      phd: 'Докторантура'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  useEffect(() => {
    if (id) {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await fetch(RESUMES_API.DETAILS(id), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError(t.notFound);
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setResume(data);
    } catch (err) {
      console.error('Error fetching resume:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setActionLoading(true);
      const endpoint = resume.is_published
        ? RESUMES_API.UNPUBLISH(id)
        : RESUMES_API.PUBLISH(id);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(resume.is_published ? t.unpublishSuccess : t.publishSuccess);
        fetchResume();
      }
    } catch (err) {
      console.error('Error updating publish status:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivation = async () => {
    try {
      setActionLoading(true);
      const endpoint = resume.is_active
        ? RESUMES_API.DEACTIVATE(id)
        : RESUMES_API.ACTIVATE(id);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(resume.is_active ? t.deactivateSuccess : t.activateSuccess);
        fetchResume();
      }
    } catch (err) {
      console.error('Error updating activation status:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getEducationLevelLabel = (level) => {
    const levelMap = {
      'secondary': t.secondary,
      'vocational': t.vocational,
      'bachelor': t.bachelor,
      'master': t.master,
      'phd': t.phd
    };
    return levelMap[level] || level;
  };

  const formatDateRange = (startDate, endDate, isCurrent) => {
    const start = formatDate(startDate, currentLang);
    if (isCurrent) {
      return `${start} - ${t.current}`;
    }
    const end = endDate ? formatDate(endDate, currentLang) : '';
    return end ? `${start} - ${end}` : start;
  };

  if (loading) {
    return (
      <>
        <style jsx global>{`
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
          <Head><title>{t.title}</title></Head>
          <HeaderBack title={t.title} onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 tilda-font">{error}</h2>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (!resume) {
    return null;
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

        .section-card {
          transition: all 0.2s ease;
        }

        .section-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .print-hidden {
          display: none !important;
        }

        @media print {
          .print-hidden {
            display: none !important;
          }
          .print-visible {
            display: block !important;
          }
        }
      `}</style>

      <Layout>
        <Head>
          <title>{resume.full_name} - {t.title}</title>
        </Head>

        <HeaderBack title={t.title} onBack={() => router.back()} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-4">

            {/* Уведомления */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 print-hidden">
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-red-500 mr-3" />
                  <p className="text-red-700 tilda-font">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 print-hidden">
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-500 mr-3" />
                  <p className="text-green-700 tilda-font">{success}</p>
                </div>
              </div>
            )}

            {/* Заголовок и действия */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100">
              <div className="space-y-4">
                {/* Заголовок и статусы */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tilda-font mb-3">{resume.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
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

                    <span className="text-xs sm:text-sm text-gray-500 tilda-font">
                      {formatDate(resume.updated_at, currentLang)}
                    </span>
                  </div>
                </div>

                {/* Кнопки управления */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handlePublish}
                    disabled={actionLoading}
                    className={`flex items-center justify-center px-4 py-3 font-medium rounded-lg transition-colors tilda-font text-sm sm:text-base ${
                      resume.is_published
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                    ) : resume.is_published ? (
                      <EyeOff size={16} className="mr-2" />
                    ) : (
                      <Eye size={16} className="mr-2" />
                    )}
                    {resume.is_published ? t.unpublish : t.publish}
                  </button>
                </div>
              </div>
            </div>

            {/* Основная информация */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 section-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 tilda-font flex items-center">
                  <User size={20} className="mr-2 text-purple-500" />
                  {t.personalInfo}
                </h2>
                <button
                  onClick={() => router.push(`/${currentLang}/profile/resumes/${resume.id}/edit/basic`)}
                  className="flex items-center px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors tilda-font"
                >
                  <Edit3 size={16} className="mr-1" />
                  {t.edit}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Briefcase size={16} className="mr-3 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500 tilda-font">{t.profession}</span>
                      <p className="font-medium text-gray-900 tilda-font">{resume.profession_name || t.profession}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin size={16} className="mr-3 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500 tilda-font">{t.location}</span>
                      <p className="font-medium text-gray-900 tilda-font">{resume.city_name || t.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone size={16} className="mr-3 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500 tilda-font">{t.phone}</span>
                      <p className="font-medium text-gray-900 tilda-font">{resume.phone_number}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-3 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500 tilda-font">{t.birthDate}</span>
                      <p className="font-medium text-gray-900 tilda-font">{formatDate(resume.birth_date, currentLang)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users size={16} className="mr-3 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500 tilda-font">{t.gender}</span>
                      <p className="font-medium text-gray-900 tilda-font">{resume.gender === 'male' ? t.male : t.female}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Globe size={16} className="mr-3 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500 tilda-font">{t.citizenship}</span>
                      <p className="font-medium text-gray-900 tilda-font">{resume.citizenship}</p>
                    </div>
                  </div>
                </div>
              </div>

              {(resume.salary_expectation || resume.employment_type) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resume.salary_expectation && (
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-3 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-500 tilda-font">{t.salary}</span>
                          <p className="font-medium text-gray-900 tilda-font">{resume.salary_expectation}</p>
                        </div>
                      </div>
                    )}

                    {resume.employment_type && (
                      <div className="flex items-center">
                        <Users size={16} className="mr-3 text-gray-400" />
                        <div>
                          <span className="text-sm text-gray-500 tilda-font">{t.employmentType}</span>
                          <p className="font-medium text-gray-900 tilda-font">{resume.employment_type}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* О себе */}
            {resume.about_me && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 section-card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900 tilda-font flex items-center">
                    <FileText size={20} className="mr-2 text-blue-500" />
                    {t.aboutMe}
                  </h2>
                  <button
                    onClick={() => router.push(`/${currentLang}/profile/resumes/${resume.id}/edit/basic`)}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors tilda-font"
                  >
                    <Edit3 size={16} className="mr-1" />
                    {t.edit}
                  </button>
                </div>
                <p className="text-gray-700 leading-relaxed tilda-font whitespace-pre-wrap">{resume.about_me}</p>
              </div>
            )}

            {/* Образование */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 section-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 tilda-font flex items-center">
                  <GraduationCap size={20} className="mr-2 text-green-500" />
                  {t.education}
                </h2>
                <button
                  onClick={() => router.push(`/${currentLang}/profile/resumes/${resume.id}/edit/education`)}
                  className="flex items-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors tilda-font"
                >
                  <Edit3 size={16} className="mr-1" />
                  {t.edit}
                </button>
              </div>

              {!resume.education || resume.education.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 italic tilda-font">{t.noEducation}</p>
                  <button
                    onClick={() => router.push(`/${currentLang}/profile/resumes/${resume.id}/edit/education`)}
                    className="mt-3 text-green-600 hover:text-green-700 underline tilda-font text-sm"
                  >
                    Добавить образование
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {resume.education.map((edu, index) => (
                    <div key={edu.id || index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-gray-900 tilda-font">{edu.institution_name}</h3>
                      <p className="text-purple-600 font-medium tilda-font">{edu.specialization}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          {getEducationLevelLabel(edu.education_level)}
                        </span>
                        <span className="flex items-center tilda-font">
                          <Calendar size={12} className="mr-1" />
                          {edu.start_year} - {edu.is_current ? t.current : edu.end_year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Опыт работы */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 section-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 tilda-font flex items-center">
                  <Building size={20} className="mr-2 text-blue-500" />
                  {t.experience}
                </h2>
                <button
                  onClick={() => router.push(`/${currentLang}/profile/resumes/${resume.id}/edit/experience`)}
                  className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors tilda-font"
                >
                  <Edit3 size={16} className="mr-1" />
                  {t.edit}
                </button>
              </div>

              {!resume.work_experience || resume.work_experience.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 italic tilda-font">{t.noExperience}</p>
                  <button
                    onClick={() => router.push(`/${currentLang}/profile/resumes/${resume.id}/edit/experience`)}
                    className="mt-3 text-blue-600 hover:text-blue-700 underline tilda-font text-sm"
                  >
                    Добавить опыт работы
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {resume.work_experience.map((exp, index) => (
                    <div key={exp.id || index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 tilda-font">{exp.position}</h3>
                          <p className="text-blue-600 font-medium tilda-font">{exp.company_name}</p>
                        </div>
                        {exp.is_current && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {t.currentJob}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mb-3 text-sm text-gray-600">
                        <Calendar size={12} className="mr-1" />
                        <span className="tilda-font">
                          {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                        </span>
                      </div>
                      {exp.responsibilities && (
                        <div className="text-gray-700 text-sm leading-relaxed tilda-font">
                          {exp.responsibilities.split('\n').map((line, idx) => (
                            <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Навыки */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 section-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 tilda-font flex items-center">
                  <Award size={20} className="mr-2 text-orange-500" />
                  {t.skills}
                </h2>
                <button
                  onClick={() => router.push(`/${currentLang}/profile/resumes/${resume.id}/edit/skills`)}
                  className="flex items-center px-3 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors tilda-font"
                >
                  <Edit3 size={16} className="mr-1" />
                  {t.edit}
                </button>
              </div>

              {!resume.skills || resume.skills.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 italic tilda-font">{t.noSkills}</p>
                  <button
                    onClick={() => router.push(`/${currentLang}/profile/resumes/${resume.id}/edit/skills`)}
                    className="mt-3 text-orange-600 hover:text-orange-700 underline tilda-font text-sm"
                  >
                    Добавить навыки
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, index) => (
                    <div key={skill.id || index} className="flex items-center bg-orange-50 text-orange-700 px-3 py-2 rounded-lg">
                      <span className="font-medium tilda-font">{skill.skill_name || skill.name}</span>
                      {skill.skill_level && (
                        <span className="ml-2 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                          {skill.skill_level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}