import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../../../components/Layout';
import HeaderBack from '../../../../../../components/HeaderBack';
import { RESUMES_API } from '../../../../../../utils/apiConfig';
import {
  Award,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle,
  Check,
  X
} from 'lucide-react';

export default function EditSkills() {
  const router = useRouter();
  const { id, lang } = router.query;
  const currentLang = lang || 'ru';

  const [skills, setSkills] = useState([]);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Переводы
  const translations = {
    'ru': {
      title: 'Редактировать навыки',
      noSkills: 'Навыки не добавлены',
      noSkillsDesc: 'Добавьте навыки, чтобы показать свои компетенции',
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
      noSkillsFound: 'Навыки не найдены',
      backToResume: 'Вернуться к резюме'
    },
    'kz': {
      title: 'Дағдыларды өзгерту',
      noSkills: 'Дағдылар қосылмаған',
      noSkillsDesc: 'Құзыреттеріңізді көрсету үшін дағдыларыңызды қосыңыз',
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
      noSkillsFound: 'Дағдылар табылмады',
      backToResume: 'Түйіндемеге оралу'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  const skillLevels = [
    { value: 'beginner', label: t.beginner },
    { value: 'intermediate', label: t.intermediate },
    { value: 'advanced', label: t.advanced },
    { value: 'expert', label: t.expert }
  ];

  useEffect(() => {
    if (id) {
      fetchSkills();
      fetchResumeSkills();
    }
  }, [id]);

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

  const fetchResumeSkills = async () => {
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
      setLoading(true);
      const response = await fetch(RESUMES_API.ADD_SKILL(id), {
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
        fetchResumeSkills();
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      setError('Ошибка при добавлении навыка');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      setLoading(true);
      const response = await fetch(RESUMES_API.DELETE_SKILL(skillId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(t.removeSuccess);
        fetchResumeSkills();
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      console.error('Error removing skill:', err);
      setError('Ошибка при удалении навыка');
    } finally {
      setLoading(false);
    }
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

            {/* Уведомления */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-red-500 mr-3" />
                  <p className="text-red-700 tilda-font">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="ml-auto p-1 text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-green-500 mr-3" />
                  <p className="text-green-700 tilda-font">{success}</p>
                  <button
                    onClick={() => setSuccess('')}
                    className="ml-auto p-1 text-green-400 hover:text-green-600"
                  >
                    <X size={16} />
                  </button>
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
                    <p className="text-gray-500 tilda-font text-sm">{t.noSkills}</p>
                    <p className="text-gray-400 tilda-font text-xs mt-1">{t.noSkillsDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {resumeSkills.map((resumeSkill) => {
                      const skill = skills.find(s => s.id === resumeSkill.skill_id);
                      if (!skill) return null;

                      return (
                        <div key={resumeSkill.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 tilda-font">
                              {getSkillName(skill)}
                            </span>
                            {skill.category && (
                              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {skill.category}
                              </span>
                            )}
                            {resumeSkill.skill_level && (
                              <div className="text-sm text-gray-600 tilda-font mt-1">
                                Уровень: {resumeSkill.skill_level}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveSkill(resumeSkill.id)}
                            disabled={loading}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
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
                    <p className="text-gray-500 text-center py-4 tilda-font text-sm">{t.noSkillsFound}</p>
                  ) : (
                    filteredSkills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg skill-card">
                        <div className="flex-1">
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
                            disabled={loading}
                            className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm font-medium rounded transition-colors tilda-font"
                          >
                            {loading ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                            ) : (
                              <Plus size={14} className="mr-1" />
                            )}
                            {t.add}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Кнопка возврата к резюме */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push(`/${currentLang}/profile/resumes/${id}`)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 tilda-font transform hover:-translate-y-1"
              >
                {t.backToResume}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}