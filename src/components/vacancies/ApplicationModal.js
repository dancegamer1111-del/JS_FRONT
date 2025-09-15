import { useState, useEffect } from 'react';
import { X, FileText, Send, CheckCircle, AlertCircle, User, LogIn } from 'lucide-react';

// Правильное получение API URL
const getApiBaseUrl = () => {
  // В Next.js переменные окружения с префиксом NEXT_PUBLIC_ доступны в браузере
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || window.location.origin;
  }
  // Fallback для серверного рендеринга
  return process.env.NEXT_PUBLIC_API_URL || '';
};

const API_BASE_URL = getApiBaseUrl();

const ApplicationModal = ({ vacancyId, vacancyTitle, onClose, currentLang = 'ru' }) => {
  // Переводы прямо в компоненте
  const translations = {
    'ru': {
      applyFor: 'Подать заявку на',
      selectResume: 'Выберите резюме',
      coverLetter: 'Сопроводительное письмо',
      cancel: 'Отмена',
      submit: 'Отправить',
      sending: 'Отправка...',
      applicationSent: 'Заявка отправлена',
      thankYouForApplication: 'Спасибо за вашую заявку! Мы свяжемся с вами в ближайшее время.',
      close: 'Закрыть',
      loginRequired: 'Необходима авторизация',
      loginRequiredToApply: 'Для подачи заявки на вакансию необходимо войти в систему и создать хотя бы одно резюме',
      loginButton: 'Войти',
      sessionExpired: 'Сессия истекла. Войдите в систему заново',
      noResumes: 'У вас нет активных резюме. Создайте резюме для подачи заявки',
      resumeLoadError: 'Ошибка при загрузке списка резюме',
      alreadyApplied: 'Вы уже подавали отклик на эту вакансию',
      applicationError: 'Произошла ошибка при отправке заявки',
      createResume: 'Создать резюме',
      loadingResumes: 'Загрузка резюме...',
      published: 'Опубликовано',
      draft: 'Черновик',
      coverLetterPlaceholder: 'Расскажите, почему вы подходите для этой позиции...'
    },
    'kz': {
      applyFor: 'Өтінім жіберу',
      selectResume: 'Түйіндеме таңдаңыз',
      coverLetter: 'Ілеспе хат',
      cancel: 'Болдырмау',
      submit: 'Жіберу',
      sending: 'Жіберілуде...',
      applicationSent: 'Өтінім жіберілді',
      thankYouForApplication: 'Өтініміңіз үшін рахмет! Біз сізбен жақын арада хабарласамыз.',
      close: 'Жабу',
      loginRequired: 'Авторизация қажет',
      loginRequiredToApply: 'Вакансияға өтінім жіберу үшін жүйеге кіру және кемінде бір түйіндеме жасау қажет',
      loginButton: 'Кіру',
      sessionExpired: 'Сессия аяқталды. Қайта кіріңіз',
      noResumes: 'Сізде белсенді түйіндемелер жоқ. Өтінім жіберу үшін түйіндеме жасаңыз',
      resumeLoadError: 'Түйіндемелер тізімін жүктеу қатесі',
      alreadyApplied: 'Сіз бұл вакансияға өтінім бергенсіз',
      applicationError: 'Өтінім жіберу кезінде қате орын алды',
      createResume: 'Түйіндеме жасау',
      loadingResumes: 'Түйіндемелер жүктелуде...',
      published: 'Жарияланған',
      draft: 'Жоба',
      coverLetterPlaceholder: 'Неліктен бұл позицияға сәйкес келетініңізді айтыңыз...'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [error, setError] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [needsAuth, setNeedsAuth] = useState(false);

  // Загружаем резюме пользователя при открытии модального окна
  useEffect(() => {
    const fetchUserResumes = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        setNeedsAuth(true);
        setLoadingResumes(false);
        return;
      }

      try {
        const apiUrl = typeof window !== 'undefined' ? getApiBaseUrl() : API_BASE_URL;
        const response = await fetch(`${apiUrl}/api/v2/resumes/my`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            setNeedsAuth(true);
            setLoadingResumes(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resumesData = await response.json();
        setResumes(resumesData);

        if (resumesData.length === 0) {
          setError(t.noResumes);
        }
      } catch (err) {
        console.error('Ошибка при загрузке резюме:', err);
        setError(t.resumeLoadError);
      } finally {
        setLoadingResumes(false);
      }
    };

    fetchUserResumes();
  }, [currentLang, t]);

  const handleLogin = () => {
    // Перенаправляем на страницу авторизации
    window.location.href = `/${currentLang}/login`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedResumeId) {
      setError(t.selectResume);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const applicationData = {
        vacancy_id: parseInt(vacancyId),
        resume_id: parseInt(selectedResumeId),
        cover_letter: coverLetter.trim() || null
      };

      const apiUrl = typeof window !== 'undefined' ? getApiBaseUrl() : API_BASE_URL;
      const response = await fetch(`${apiUrl}/api/v2/vacancies/${vacancyId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `HTTP error! status: ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        if (response.status === 401) {
          setNeedsAuth(true);
          return;
        } else if (response.status === 400 && errorMessage.includes('уже подавали отклик')) {
          errorMessage = t.alreadyApplied;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Отклик отправлен успешно:', result);

      setSubmitStatus('success');
    } catch (err) {
      console.error('Ошибка при отправке отклика:', err);
      setError(err.message || t.applicationError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResumeProfessionName = (resume) => {
    // Здесь можно добавить маппинг profession_id к названию профессии
    return `Профессия ID: ${resume.profession_id}`;
  };

  const getResumeCityName = (resume) => {
    // Здесь можно добавить маппинг city_id к названию города
    return resume.city_id ? `Город ID: ${resume.city_id}` : '';
  };

  // Если пользователь не авторизован
  if (needsAuth) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 tilda-font">
            {t.loginRequired}
          </h3>
          <p className="text-gray-600 mb-6 tilda-font">
            {t.loginRequiredToApply}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors tilda-font"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 tilda-font flex items-center justify-center"
            >
              <LogIn size={16} className="mr-2" />
              {t.loginButton}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 tilda-font">
            {t.applicationSent}
          </h3>
          <p className="text-gray-600 mb-6 tilda-font">
            {t.thankYouForApplication}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 tilda-font"
          >
            {t.close}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tilda-font">
              {t.applyFor} "{vacancyTitle}"
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="px-6 py-4">
          {loadingResumes ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600 tilda-font">{t.loadingResumes}</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <p className="text-red-600 text-sm tilda-font">{error}</p>
              {error.includes('резюме') && (
                <button
                  onClick={() => window.location.href = `/${currentLang}/profile/resumes/create`}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors tilda-font"
                >
                  {t.createResume}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Выбор резюме */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                  {t.selectResume} *
                </label>
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedResumeId === resume.id.toString()
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedResumeId(resume.id.toString())}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <input
                            type="radio"
                            name="resume"
                            value={resume.id}
                            checked={selectedResumeId === resume.id.toString()}
                            onChange={(e) => setSelectedResumeId(e.target.value)}
                            className="mt-1 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center space-x-2">
                            <User size={16} className="text-gray-400 flex-shrink-0" />
                            <h4 className="text-sm font-medium text-gray-900 tilda-font truncate">
                              {resume.full_name}
                            </h4>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 tilda-font">
                            {getResumeProfessionName(resume)}
                          </p>
                          {getResumeCityName(resume) && (
                            <p className="text-xs text-gray-500 mt-1 tilda-font">
                              {getResumeCityName(resume)}
                            </p>
                          )}
                          <div className="flex items-center mt-1 space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              resume.is_published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {resume.is_published ? t.published : t.draft}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Сопроводительное письмо */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                  {t.coverLetter} (опционально)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm tilda-font"
                  placeholder={t.coverLetterPlaceholder}
                />
              </div>

              {/* Ошибка */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 tilda-font">{error}</p>
                </div>
              )}

              {/* Кнопки */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors tilda-font"
                  disabled={isSubmitting}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedResumeId}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 tilda-font flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {t.sending}
                    </>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" />
                      {t.submit}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;