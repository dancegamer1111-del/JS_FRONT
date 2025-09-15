import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../components/Layout';
import HeaderBack from '../../../../components/HeaderBack';
import { RESUMES_API } from '../../../../utils/apiConfig';
import {
  GraduationCap,
  Plus,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';

export default function CreateResumeWizardStep2() {
  const router = useRouter();
  const currentLang = router.query.lang || 'ru';

  const [resumeId, setResumeId] = useState(null);
  const [education, setEducation] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    institution_name: '',
    specialization: '',
    education_level: '',
    start_year: '',
    end_year: '',
    is_current: false
  });

  // Переводы
  const translations = {
    'ru': {
      title: 'Создать резюме - Шаг 2 из 4',
      subtitle: 'Образование',
      nextStep: 'Далее - Опыт работы',
      prevStep: 'Назад',
      skip: 'Пропустить этот шаг',
      addEducation: 'Добавить образование',
      noEducation: 'Образование не добавлено',
      noEducationDesc: 'Добавьте информацию о вашем образовании, чтобы работодатели могли оценить ваши знания',
      institutionName: 'Название учебного заведения',
      institutionPlaceholder: 'Например: КазНУ имени аль-Фараби',
      specialization: 'Специализация',
      specializationPlaceholder: 'Например: Информационные системы',
      educationLevel: 'Уровень образования',
      educationLevelPlaceholder: 'Выберите уровень',
      startYear: 'Год поступления',
      endYear: 'Год окончания',
      isCurrent: 'Учусь в настоящее время',
      save: 'Сохранить',
      cancel: 'Отмена',
      edit: 'Редактировать',
      delete: 'Удалить',
      required: 'Обязательное поле',
      fillRequired: 'Заполните все обязательные поля',
      invalidYear: 'Некорректный год',
      yearRange: 'Год окончания не может быть раньше года поступления',
      addSuccess: 'Образование добавлено',
      updateSuccess: 'Образование обновлено',
      deleteSuccess: 'Образование удалено',
      step: 'Шаг',
      of: 'из',
      basicInfo: 'Основная информация',
      education: 'Образование',
      experience: 'Опыт работы',
      skills: 'Навыки',
      // Уровни образования
      secondary: 'Среднее образование',
      vocational: 'Профессиональное образование',
      bachelor: 'Бакалавриат',
      master: 'Магистратура',
      phd: 'Докторантура'
    },
    'kz': {
      title: 'Түйіндеме жасау - 2 қадам 4-тен',
      subtitle: 'Білім',
      nextStep: 'Келесі - Жұмыс тәжірибесі',
      prevStep: 'Артқа',
      skip: 'Бұл қадамды өткізу',
      addEducation: 'Білім қосу',
      noEducation: 'Білім қосылмаған',
      noEducationDesc: 'Жұмыс берушілер сіздің білімдеріңізді бағалай алуы үшін білім туралы ақпарат қосыңыз',
      institutionName: 'Оқу орнының атауы',
      institutionPlaceholder: 'Мысалы: Әл-Фараби атындағы ҚазҰУ',
      specialization: 'Мамандық',
      specializationPlaceholder: 'Мысалы: Ақпараттық жүйелер',
      educationLevel: 'Білім деңгейі',
      educationLevelPlaceholder: 'Деңгейді таңдаңыз',
      startYear: 'Түсу жылы',
      endYear: 'Бітіру жылы',
      isCurrent: 'Қазір оқып жатырмын',
      save: 'Сақтау',
      cancel: 'Болдырмау',
      edit: 'Өзгерту',
      delete: 'Жою',
      required: 'Міндетті өріс',
      fillRequired: 'Барлық міндетті өрістерді толтырыңыз',
      invalidYear: 'Дұрыс емес жыл',
      yearRange: 'Бітіру жылы түсу жылынан ерте болмауы тиіс',
      addSuccess: 'Білім қосылды',
      updateSuccess: 'Білім жаңартылды',
      deleteSuccess: 'Білім жойылды',
      step: 'Қадам',
      of: 'тан',
      basicInfo: 'Негізгі ақпарат',
      education: 'Білім',
      experience: 'Жұмыс тәжірибесі',
      skills: 'Дағдылар',
      // Уровни образования
      secondary: 'Орта білім',
      vocational: 'Кәсіптік білім',
      bachelor: 'Бакалавриат',
      master: 'Магистратура',
      phd: 'Докторантура'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  const educationLevels = [
    { value: 'secondary', label: t.secondary },
    { value: 'vocational', label: t.vocational },
    { value: 'bachelor', label: t.bachelor },
    { value: 'master', label: t.master },
    { value: 'phd', label: t.phd }
  ];

  // Шаги мастера
  const steps = [
    { id: 1, name: t.basicInfo, current: false },
    { id: 2, name: t.education, current: true },
    { id: 3, name: t.experience, current: false },
    { id: 4, name: t.skills, current: false }
  ];

  useEffect(() => {
    // Получаем ID резюме из localStorage или URL
    const wizardResumeId = localStorage.getItem('resume_wizard_id');
    if (!wizardResumeId) {
      router.push(`/${currentLang}/profile/resumes/create`);
      return;
    }

    setResumeId(wizardResumeId);
    fetchEducation(wizardResumeId);
  }, []);

  const fetchEducation = async (id) => {
    try {
      const response = await fetch(RESUMES_API.GET_EDUCATION(id), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEducation(data);
      }
    } catch (err) {
      console.error('Error fetching education:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const required = ['institution_name', 'specialization', 'education_level', 'start_year'];

    for (let field of required) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setError(t.fillRequired);
        return false;
      }
    }

    // Проверка годов
    const currentYear = new Date().getFullYear();
    const startYear = parseInt(formData.start_year);

    if (startYear < 1950 || startYear > currentYear) {
      setError(t.invalidYear);
      return false;
    }

    if (!formData.is_current && formData.end_year) {
      const endYear = parseInt(formData.end_year);
      if (endYear < startYear) {
        setError(t.yearRange);
        return false;
      }
      if (endYear > currentYear) {
        setError(t.invalidYear);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);
  setError('');

  try {
    const url = editingId
      ? RESUMES_API.UPDATE_EDUCATION(editingId)
      : RESUMES_API.ADD_EDUCATION(resumeId);

    const method = editingId ? 'PUT' : 'POST';

    // Prepare data with proper integer conversion
    const submitData = {
      ...formData,
      start_year: parseInt(formData.start_year),
      // Only include end_year if it's not empty and not current education
      end_year: (!formData.is_current && formData.end_year)
        ? parseInt(formData.end_year)
        : null
    };

    // Remove null values to avoid sending them to API
    if (submitData.end_year === null) {
      delete submitData.end_year;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(submitData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.detail);
    }

    setSuccess(editingId ? t.updateSuccess : t.addSuccess);
    setShowForm(false);
    setEditingId(null);
    setFormData({
      institution_name: '',
      specialization: '',
      education_level: '',
      start_year: '',
      end_year: '',
      is_current: false
    });

    fetchEducation(resumeId);

  } catch (err) {
    console.error('Error saving education:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (edu) => {
    setFormData({
      institution_name: edu.institution_name,
      specialization: edu.specialization,
      education_level: edu.education_level,
      start_year: edu.start_year,
      end_year: edu.end_year || '',
      is_current: edu.is_current
    });
    setEditingId(edu.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить это образование?')) return;

    try {
      const response = await fetch(RESUMES_API.DELETE_EDUCATION(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(t.deleteSuccess);
        fetchEducation(resumeId);
      }
    } catch (err) {
      console.error('Error deleting education:', err);
      setError('Ошибка при удалении');
    }
  };

  const handleNext = () => {
      router.push(`/${currentLang}/profile/resumes/step3`);
  };

  const handlePrev = () => {
      router.push(`/${currentLang}/profile/resumes/step1`);
  };

  const getEducationLevelLabel = (level) => {
    const levelObj = educationLevels.find(l => l.value === level);
    return levelObj ? levelObj.label : level;
  };

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

        .education-card {
          transition: all 0.2s ease;
        }

        .education-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <Layout>
        <Head>
          <title>{t.title}</title>
        </Head>

        <HeaderBack title={t.title} onBack={() => router.back()} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto p-4">

            {/* Прогресс-бар */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-gray-600 tilda-font">{t.step} 2 {t.of} 4</h2>
                <span className="text-sm text-gray-500 tilda-font">50%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
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
                            : step.id < 2
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 bg-white text-gray-500'
                        }`}>
                          <span className="text-sm font-medium tilda-font">{step.id}</span>
                        </div>
                        <span className={`ml-2 text-sm font-medium ${
                          step.current ? 'text-purple-600' : step.id < 2 ? 'text-green-600' : 'text-gray-500'
                        } tilda-font hidden sm:block`}>
                          {step.name}
                        </span>
                        {stepIdx !== steps.length - 1 && (
                          <div className="flex-1 ml-4 mr-4">
                            <div className={`h-0.5 ${step.id < 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
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
              <p className="text-gray-600 tilda-font">Добавьте информацию о вашем образовании</p>
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

            {/* Список образования */}
            <div className="mb-6">
              {education.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 tilda-font">{t.noEducation}</h3>
                  <p className="text-gray-600 mb-6 tilda-font">{t.noEducationDesc}</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors tilda-font"
                  >
                    <Plus size={18} className="mr-2" />
                    {t.addEducation}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 education-card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 tilda-font">{edu.institution_name}</h3>
                          <p className="text-gray-700 tilda-font">{edu.specialization}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                              {getEducationLevelLabel(edu.education_level)}
                            </span>
                            <span className="flex items-center tilda-font">
                              <Calendar size={14} className="mr-1" />
                              {edu.start_year} - {edu.is_current ? 'настоящее время' : edu.end_year}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(edu)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(edu.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors tilda-font"
                  >
                    <Plus size={20} className="mr-2" />
                    {t.addEducation}
                  </button>
                </div>
              )}
            </div>

            {/* Форма добавления/редактирования */}
            {showForm && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 tilda-font">
                  {editingId ? 'Редактировать образование' : t.addEducation}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Название учебного заведения */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                        {t.institutionName} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="institution_name"
                        value={formData.institution_name}
                        onChange={handleChange}
                        placeholder={t.institutionPlaceholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      />
                    </div>

                    {/* Специализация */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                        {t.specialization} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder={t.specializationPlaceholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      />
                    </div>

                    {/* Уровень образования */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                        {t.educationLevel} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="education_level"
                        value={formData.education_level}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      >
                        <option value="">{t.educationLevelPlaceholder}</option>
                        {educationLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Год поступления */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                        {t.startYear} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="start_year"
                        value={formData.start_year}
                        onChange={handleChange}
                        min="1950"
                        max={new Date().getFullYear()}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      />
                    </div>

                    {/* Год окончания */}
                    {!formData.is_current && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.endYear}
                        </label>
                        <input
                          type="number"
                          name="end_year"
                          value={formData.end_year}
                          onChange={handleChange}
                          min="1950"
                          max={new Date().getFullYear()}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        />
                      </div>
                    )}

                    {/* Учусь в настоящее время */}
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_current"
                          checked={formData.is_current}
                          onChange={handleChange}
                          className="mr-3 text-purple-600 focus:ring-purple-500 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 tilda-font">{t.isCurrent}</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors tilda-font"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      ) : null}
                      {t.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setFormData({
                          institution_name: '',
                          specialization: '',
                          education_level: '',
                          start_year: '',
                          end_year: '',
                          is_current: false
                        });
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors tilda-font"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Кнопки навигации */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 tilda-font transform hover:-translate-y-1"
              >
                {t.nextStep}
                <ArrowRight size={18} className="ml-2" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="text-purple-600 hover:text-purple-700 font-medium underline tilda-font"
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