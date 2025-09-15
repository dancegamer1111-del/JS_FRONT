import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../components/Layout';
import HeaderBack from '../../../../components/HeaderBack';
import { RESUMES_API } from '../../../../utils/apiConfig';
import {
  Award,
  Plus,
  Search,
  ArrowLeft,
  Trash2,
  AlertCircle,
  CheckCircle,
  Check,
  Eye
} from 'lucide-react';

export default function CreateResumeWizardStep4() {
  const router = useRouter();
  const currentLang = router.query.lang || 'ru';

  const [resumeId, setResumeId] = useState(null);
  const [skills, setSkills] = useState([]);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [completingWizard, setCompletingWizard] = useState(false);

  // Переводы
  const translations = {
    'ru': {
      title: 'Создать резюме - Шаг 4 из 4',
      subtitle: 'Навыки',
      finish: 'Завершить создание резюме',
      prevStep: 'Назад',
      skip: 'Пропустить и завершить',
      addSkills: 'Добавить навыки',
      noSkills: 'Навыки не добавлены',
      noSkillsDesc: 'Добавьте ваши профессиональные навыки, чтобы показать свои компетенции',
      searchSkills: 'Поиск навыков...',
      allCategories: 'Все категории',
      selectedSkills: 'Выбранные навыки',
      availableSkills: 'Доступные навыки',
      skillLevel: 'Уровень навыка',
      skillLevelPlaceholder: 'Выберите уровень',
      beginner: 'Начинающий',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
      expert: 'Эксперт',
      add: 'Добавить',
      remove: 'Удалить',
      added: 'Добавлен',
      addSuccess: 'Навык добавлен',
      removeSuccess: 'Навык удален',
      step: 'Шаг',
      of: 'из',
      basicInfo: 'Основная информация',
      education: 'Образование',
      experience: 'Опыт работы',
      skills: 'Навыки',
      completing: 'Завершение...',
      resumeCreated: 'Резюме успешно создано!',
      viewResume: 'Посмотреть резюме',
      congratulations: 'Поздравляем!',
      resumeCreatedDesc: 'Ваше резюме создано. Теперь вы можете его просмотреть, отредактировать или опубликовать.'
    },
    'kz': {
      title: 'Түйіндеме жасау - 4 қадам 4-тен',
      subtitle: 'Дағдылар',
      finish: 'Түйіндеме жасауды аяқтау',
      prevStep: 'Артқа',
      skip: 'Өткізу және аяқтау',
      addSkills: 'Дағдылар қосу',
      noSkills: 'Дағдылар қосылмаған',
      noSkillsDesc: 'Құзыреттеріңізді көрсету үшін кәсіби дағдыларыңызды қосыңыз',
      searchSkills: 'Дағдыларды іздеу...',
      allCategories: 'Барлық категориялар',
      selectedSkills: 'Таңдалған дағдылар',
      availableSkills: 'Қолжетімді дағдылар',
      skillLevel: 'Дағды деңгейі',
      skillLevelPlaceholder: 'Деңгейді таңдаңыз',
      beginner: 'Бастаушы',
      intermediate: 'Орта',
      advanced: 'Алдыңғы',
      expert: 'Сарапшы',
      add: 'Қосу',
      remove: 'Жою',
      added: 'Қосылды',
      addSuccess: 'Дағды қосылды',
      removeSuccess: 'Дағды жойылды',
      step: 'Қадам',
      of: 'тан',
      basicInfo: 'Негізгі ақпарат',
      education: 'Білім',
      experience: 'Жұмыс тәжірибесі',
      skills: 'Дағдылар',
      completing: 'Аяқталуда...',
      resumeCreated: 'Түйіндеме сәтті жасалды!',
      viewResume: 'Түйіндемені көру',
      congratulations: 'Құттықтаймыз!',
      resumeCreatedDesc: 'Түйіндемеңіз жасалды. Енді оны көре, өзгерте немесе жариялай аласыз.'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  const skillLevels = [
    { value: 'beginner', label: t.beginner },
    { value: 'intermediate', label: t.intermediate },
    { value: 'advanced', label: t.advanced },
    { value: 'expert', label: t.expert }
  ];

  // Шаги мастера
  const steps = [
    { id: 1, name: t.basicInfo, current: false },
    { id: 2, name: t.education, current: false },
    { id: 3, name: t.experience, current: false },
    { id: 4, name: t.skills, current: true }
  ];

  useEffect(() => {
    const wizardResumeId = localStorage.getItem('resume_wizard_id');
    if (!wizardResumeId) {
      router.push(`/${currentLang}/profile/resumes/create`);
      return;
    }

    setResumeId(wizardResumeId);
    fetchSkills();
    fetchResumeSkills(wizardResumeId);
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch(RESUMES_API.SKILLS);
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchResumeSkills = async (id) => {
    try {
      const response = await fetch(RESUMES_API.GET_SKILLS(id), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResumeSkills(data);
      }
    } catch (err) {
      console.error('Error fetching resume skills:', err);
    }
  };

  const handleAddSkill = async (skill, level = '') => {
    try {
      const response = await fetch(RESUMES_API.ADD_SKILL(resumeId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          skill_id: skill.id,
          skill_level: level
        })
      });

      if (response.ok) {
        setSuccess(t.addSuccess);
        fetchResumeSkills(resumeId);
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      setError('Ошибка при добавлении навыка');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const response = await fetch(RESUMES_API.DELETE_SKILL(skillId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(t.removeSuccess);
        fetchResumeSkills(resumeId);
      }
    } catch (err) {
      console.error('Error removing skill:', err);
      setError('Ошибка при удалении навыка');
    }
  };

  const handleFinish = async () => {
    setCompletingWizard(true);

    // Очищаем localStorage
    localStorage.removeItem('resume_wizard_id');

    // Показываем сообщение об успехе
    setSuccess(t.resumeCreated);

    // Перенаправляем на страницу просмотра резюме
    setTimeout(() => {
      router.push(`/${currentLang}/resume/my_resumes`);
    }, 2000);
  };

  const handlePrev = () => {
      router.push(`/${currentLang}/profile/resumes/step3`);
  };

  const getSkillName = (skill) => {
    return currentLang === 'kz' ? skill.name_kz : skill.name_ru;
  };

  const isSkillAdded = (skillId) => {
    return resumeSkills.some(rs => rs.skill_id === skillId);
  };

  // Фильтрация навыков
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = searchTerm === '' ||
      getSkillName(skill).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Получаем уникальные категории
  const categories = [...new Set(skills.map(skill => skill.category).filter(Boolean))];

  if (completingWizard) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <Layout>
          <Head><title>{t.completing}</title></Head>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 tilda-font">{t.congratulations}</h2>
              <p className="text-gray-600 mb-6 tilda-font">{t.resumeCreatedDesc}</p>
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto"></div>
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

        .skill-card {
          transition: all 0.2s ease;
        }

        .skill-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <Layout>
        <Head>
          <title>{t.title}</title>
        </Head>

        <HeaderBack title={t.title} onBack={() => router.back()} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-4">

            {/* Прогресс-бар */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-600 tilda-font">{t.step} 4 {t.of} 4</h2>
                <span className="text-sm text-gray-500 tilda-font">100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Навигация по шагам */}
            <div className="mb-6">
              <nav aria-label="Progress">
                <ol className="flex items-center justify-between">
                  {steps.map((step, stepIdx) => (
                    <li key={step.id} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
                      <div className="flex items-center">
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                          step.current
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-green-500 bg-green-500 text-white'
                        }`}>
                          <span className="text-sm font-medium tilda-font">{step.id}</span>
                        </div>
                        <span className={`ml-2 text-sm font-medium ${
                          step.current ? 'text-purple-600' : 'text-green-600'
                        } tilda-font hidden sm:block`}>
                          {step.name}
                        </span>
                        {stepIdx !== steps.length - 1 && (
                          <div className="flex-1 ml-4 mr-4">
                            <div className="h-0.5 bg-green-500"></div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            {/* Заголовок шага */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 tilda-font">{t.subtitle}</h1>
              <p className="text-gray-600 tilda-font">Добавьте навыки, чтобы показать свои компетенции</p>
            </div>

            {/* Уведомления */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-red-500 mr-3" />
                  <p className="text-red-700 tilda-font">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-500 mr-3" />
                  <p className="text-green-700 tilda-font">{success}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Выбранные навыки */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 tilda-font flex items-center">
                  <Award size={20} className="mr-2 text-green-500" />
                  {t.selectedSkills} ({resumeSkills.length})
                </h3>

                {resumeSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <Award size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500 tilda-font">{t.noSkills}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {resumeSkills.map((resumeSkill) => {
                      const skill = skills.find(s => s.id === resumeSkill.skill_id);
                      if (!skill) return null;

                      return (
                        <div key={resumeSkill.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900 tilda-font">
                              {getSkillName(skill)}
                            </span>
                            {resumeSkill.skill_level && (
                              <span className="ml-2 text-sm text-gray-600 tilda-font">
                                ({resumeSkill.skill_level})
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveSkill(resumeSkill.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Доступные навыки */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 tilda-font">
                  {t.availableSkills}
                </h3>

                {/* Поиск и фильтры */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t.searchSkills}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                  >
                    <option value="">{t.allCategories}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Список навыков */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredSkills.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 tilda-font">Навыки не найдены</p>
                  ) : (
                    filteredSkills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg skill-card">
                        <div>
                          <span className="font-medium text-gray-900 tilda-font">
                            {getSkillName(skill)}
                          </span>
                          {skill.category && (
                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {skill.category}
                            </span>
                          )}
                        </div>

                        {isSkillAdded(skill.id) ? (
                          <span className="flex items-center text-green-600 text-sm font-medium tilda-font">
                            <Check size={14} className="mr-1" />
                            {t.added}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddSkill(skill)}
                            className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors tilda-font"
                          >
                            <Plus size={14} className="mr-1" />
                            {t.add}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Кнопки навигации */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 tilda-font transform hover:-translate-y-1"
              >
                <Check size={18} className="mr-2" />
                {t.finish}
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="text-green-600 hover:text-green-700 font-medium underline tilda-font"
              >
                {t.skip}
              </button>

              <button
                type="button"
                onClick={handlePrev}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 tilda-font flex items-center"
              >
                <ArrowLeft size={18} className="mr-2" />
                {t.prevStep}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}