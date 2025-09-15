import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../../../components/Layout';
import HeaderBack from '../../../../../../components/HeaderBack';
import { RESUMES_API } from '../../../../../../utils/apiConfig';
import {
  Building,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  Save,
  X
} from 'lucide-react';

export default function EditExperience() {
  const router = useRouter();
  const { id, lang } = router.query;
  const currentLang = lang || 'ru';

  const [experience, setExperience] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    responsibilities: '',
    start_date: '',
    end_date: '',
    is_current: false
  });

  // Переводы
  const translations = {
    'ru': {
      title: 'Редактировать опыт работы',
      addExperience: 'Добавить опыт работы',
      noExperience: 'Опыт работы не добавлен',
      noExperienceDesc: 'Добавьте информацию о вашем опыте работы',
      companyName: 'Название компании',
      companyPlaceholder: 'Например: ТОО "Технологии"',
      position: 'Должность',
      positionPlaceholder: 'Например: Frontend разработчик',
      responsibilities: 'Обязанности и достижения',
      responsibilitiesPlaceholder: 'Опишите ваши основные обязанности и достижения...',
      startDate: 'Дата начала работы',
      endDate: 'Дата окончания работы',
      isCurrent: 'Работаю в настоящее время',
      save: 'Сохранить',
      cancel: 'Отмена',
      edit: 'Редактировать',
      delete: 'Удалить',
      required: 'Обязательное поле',
      fillRequired: 'Заполните все обязательные поля',
      invalidDate: 'Некорректная дата',
      dateRange: 'Дата окончания не может быть раньше даты начала',
      addSuccess: 'Опыт работы добавлен',
      updateSuccess: 'Опыт работы обновлен',
      deleteSuccess: 'Опыт работы удален',
      current: 'по настоящее время',
      maxLength: 'символов максимум'
    },
    'kz': {
      title: 'Жұмыс тәжірибесін өзгерту',
      addExperience: 'Жұмыс тәжірибесін қосу',
      noExperience: 'Жұмыс тәжірибесі қосылмаған',
      noExperienceDesc: 'Жұмыс тәжірибеңіз туралы ақпарат қосыңыз',
      companyName: 'Компания атауы',
      companyPlaceholder: 'Мысалы: "Технологиялар" ЖШС',
      position: 'Лауазымы',
      positionPlaceholder: 'Мысалы: Frontend әзірлеуші',
      responsibilities: 'Міндеттер мен жетістіктер',
      responsibilitiesPlaceholder: 'Негізгі міндеттеріңіз бен жетістіктеріңізді сипаттаңыз...',
      startDate: 'Жұмысты бастаған күні',
      endDate: 'Жұмысты аяқтаған күні',
      isCurrent: 'Қазір жұмыс істеп жатырмын',
      save: 'Сақтау',
      cancel: 'Болдырмау',
      edit: 'Өзгерту',
      delete: 'Жою',
      required: 'Міндетті өріс',
      fillRequired: 'Барлық міндетті өрістерді толтырыңыз',
      invalidDate: 'Дұрыс емес күн',
      dateRange: 'Аяқтау күні бастау күнінен ерте болмауы тиіс',
      addSuccess: 'Жұмыс тәжірибесі қосылды',
      updateSuccess: 'Жұмыс тәжірибесі жаңартылды',
      deleteSuccess: 'Жұмыс тәжірибесі жойылды',
      current: 'қазіргі уақытқа дейін',
      maxLength: 'символ максимум'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  useEffect(() => {
    if (id) {
      fetchExperience();
    }
  }, [id]);

  const fetchExperience = async () => {
    try {
      const response = await fetch(RESUMES_API.GET_EXPERIENCE(id), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExperience(data);
      }
    } catch (err) {
      console.error('Error fetching experience:', err);
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
    const required = ['company_name', 'position', 'start_date'];

    for (let field of required) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setError(t.fillRequired);
        return false;
      }
    }

    // Проверка дат
    const startDate = new Date(formData.start_date);

    if (!formData.is_current && formData.end_date) {
      const endDate = new Date(formData.end_date);
      if (endDate <= startDate) {
        setError(t.dateRange);
        return false;
      }

      // Проверяем, что дата не в будущем
      if (endDate > new Date()) {
        setError(t.invalidDate);
        return false;
      }
    }

    // Проверяем, что дата начала не в далеком будущем
    if (startDate > new Date()) {
      setError(t.invalidDate);
      return false;
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
        ? RESUMES_API.UPDATE_EXPERIENCE(editingId)
        : RESUMES_API.ADD_EXPERIENCE(id);

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.detail);
      }

      setSuccess(editingId ? t.updateSuccess : t.addSuccess);
      setShowForm(false);
      setEditingId(null);
      setFormData({
        company_name: '',
        position: '',
        responsibilities: '',
        start_date: '',
        end_date: '',
        is_current: false
      });

      fetchExperience();

    } catch (err) {
      console.error('Error saving experience:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp) => {
    setFormData({
      company_name: exp.company_name,
      position: exp.position,
      responsibilities: exp.responsibilities || '',
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      is_current: exp.is_current
    });
    setEditingId(exp.id);
    setShowForm(true);
  };

  const handleDelete = async (experienceId) => {
    if (!confirm('Удалить этот опыт работы?')) return;

    try {
      const response = await fetch(RESUMES_API.DELETE_EXPERIENCE(experienceId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSuccess(t.deleteSuccess);
        fetchExperience();
      }
    } catch (err) {
      console.error('Error deleting experience:', err);
      setError('Ошибка при удалении');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'kz' ? 'kk-KZ' : 'ru-RU', {
      month: 'long',
      year: 'numeric'
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      company_name: '',
      position: '',
      responsibilities: '',
      start_date: '',
      end_date: '',
      is_current: false
    });
    setError('');
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

        .experience-card {
          transition: all 0.2s ease;
        }

        .experience-card:hover {
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

            {/* Кнопка добавления */}
            {!showForm && (
              <div className="mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors tilda-font"
                >
                  <Plus size={18} className="mr-2" />
                  {t.addExperience}
                </button>
              </div>
            )}

            {/* Список опыта работы */}
            <div className="mb-6">
              {experience.length === 0 && !showForm ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <Building size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 tilda-font">{t.noExperience}</h3>
                  <p className="text-gray-600 mb-6 tilda-font">{t.noExperienceDesc}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 experience-card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 tilda-font">{exp.position}</h3>
                            <span className="text-gray-500 tilda-font">•</span>
                            <span className="text-gray-700 tilda-font">{exp.company_name}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                            <Calendar size={14} />
                            <span className="tilda-font">
                              {formatDate(exp.start_date)} - {exp.is_current ? t.current : formatDate(exp.end_date)}
                            </span>
                            {exp.is_current && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                Текущее место работы
                              </span>
                            )}
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
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(exp)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Форма добавления/редактирования */}
            {showForm && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 tilda-font">
                    {editingId ? 'Редактировать опыт работы' : t.addExperience}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Название компании */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                        {t.companyName} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder={t.companyPlaceholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      />
                    </div>

                    {/* Должность */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                        {t.position} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        placeholder={t.positionPlaceholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      />
                    </div>

                    {/* Дата начала */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                        {t.startDate} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      />
                    </div>

                    {/* Дата окончания */}
                    {!formData.is_current && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                          {t.endDate}
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        />
                      </div>
                    )}

                    {/* Работаю в настоящее время */}
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

                    {/* Обязанности */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                        {t.responsibilities}
                        <span className="text-gray-400 text-xs ml-2">1000 {t.maxLength}</span>
                      </label>
                      <textarea
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleChange}
                        placeholder={t.responsibilitiesPlaceholder}
                        rows={4}
                        maxLength="1000"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font resize-none"
                      />
                      <div className="text-right text-xs text-gray-400 mt-1">
                        {formData.responsibilities.length}/1000
                      </div>
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
                      ) : (
                        <Save size={16} className="mr-2" />
                      )}
                      {t.save}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors tilda-font"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}