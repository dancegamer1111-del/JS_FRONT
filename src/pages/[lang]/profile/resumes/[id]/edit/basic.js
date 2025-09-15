import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../../../components/Layout';
import HeaderBack from '../../../../../../components/HeaderBack';
import { RESUMES_API } from '../../../../../../utils/apiConfig';
import {
  User,
  MapPin,
  Briefcase,
  Phone,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Save,
  AlertCircle,
  CheckCircle,
  Globe
} from 'lucide-react';

export default function EditBasicInfo() {
  const router = useRouter();
  const { id, lang } = router.query;
  const currentLang = lang || 'ru';

  const [resume, setResume] = useState(null);
  const [professions, setProfessions] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    profession_id: '',
    full_name: '',
    gender: 'male',
    city_id: '',
    phone_number: '',
    birth_date: '',
    citizenship: '',
    about_me: '',
    salary_expectation: '',
    employment_type: ''
  });

  // Переводы
  const translations = {
    'ru': {
      title: 'Редактировать основную информацию',
      save: 'Сохранить изменения',
      cancel: 'Отмена',
      personalInfo: 'Личная информация',
      profession: 'Профессия',
      professionPlaceholder: 'Выберите профессию',
      fullName: 'ФИО',
      fullNamePlaceholder: 'Введите полное имя',
      gender: 'Пол',
      male: 'Мужской',
      female: 'Женский',
      city: 'Город',
      cityPlaceholder: 'Выберите город',
      phone: 'Номер телефона',
      phonePlaceholder: '+7 (___) ___-__-__',
      birthDate: 'Дата рождения',
      citizenship: 'Гражданство',
      citizenshipPlaceholder: 'Укажите гражданство',
      aboutMe: 'О себе',
      aboutMePlaceholder: 'Расскажите о себе, ваших целях и мотивации...',
      salaryExpectation: 'Желаемая зарплата',
      salaryPlaceholder: 'Например: 500,000 - 600,000 тенге',
      employmentType: 'Тип занятости',
      employmentTypePlaceholder: 'Выберите тип занятости',
      fullTime: 'Полная занятость',
      partTime: 'Частичная занятость',
      project: 'Проектная работа',
      internship: 'Стажировка',
      required: 'Обязательное поле',
      fillRequired: 'Заполните все обязательные поля',
      minAge: 'Минимальный возраст: 16 лет',
      maxLength: 'символов максимум',
      updateSuccess: 'Основная информация обновлена',
      loading: 'Загрузка...',
      saving: 'Сохранение...'
    },
    'kz': {
      title: 'Негізгі ақпаратты өзгерту',
      save: 'Өзгерістерді сақтау',
      cancel: 'Болдырмау',
      personalInfo: 'Жеке ақпарат',
      profession: 'Мамандық',
      professionPlaceholder: 'Мамандықты таңдаңыз',
      fullName: 'Толық аты-жөні',
      fullNamePlaceholder: 'Толық атыңызды енгізіңіз',
      gender: 'Жынысы',
      male: 'Ер',
      female: 'Әйел',
      city: 'Қала',
      cityPlaceholder: 'Қаланы таңдаңыз',
      phone: 'Телефон нөмірі',
      phonePlaceholder: '+7 (___) ___-__-__',
      birthDate: 'Туған күні',
      citizenship: 'Азаматтық',
      citizenshipPlaceholder: 'Азаматтықты көрсетіңіз',
      aboutMe: 'Өзім туралы',
      aboutMePlaceholder: 'Өзіңіз, мақсаттарыңыз және мотивацияңыз туралы айтыңыз...',
      salaryExpectation: 'Күтілетін жалақы',
      salaryPlaceholder: 'Мысалы: 500,000 - 600,000 теңге',
      employmentType: 'Жұмыспен қамту түрі',
      employmentTypePlaceholder: 'Жұмыспен қамту түрін таңдаңыз',
      fullTime: 'Толық жұмыспен қамту',
      partTime: 'Ішінара жұмыспен қамту',
      project: 'Жобалық жұмыс',
      internship: 'Тәжірибеден өту',
      required: 'Міндетті өріс',
      fillRequired: 'Барлық міндетті өрістерді толтырыңыз',
      minAge: 'Ең аз жас: 16 жыл',
      maxLength: 'символ максимум',
      updateSuccess: 'Негізгі ақпарат жаңартылды',
      loading: 'Жүктелуде...',
      saving: 'Сақталуда...'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  const employmentOptions = [
    { value: 'full_time', label: t.fullTime },
    { value: 'part_time', label: t.partTime },
    { value: 'project', label: t.project },
    { value: 'internship', label: t.internship }
  ];

  useEffect(() => {
    if (id) {
      fetchResume();
      fetchProfessions();
      fetchCities();
    }
  }, [id]);

  const fetchResume = async () => {
    try {
      const response = await fetch(RESUMES_API.DETAILS(id), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResume(data);
        setFormData({
          profession_id: data.profession_id,
          full_name: data.full_name,
          gender: data.gender,
          city_id: data.city_id,
          phone_number: data.phone_number,
          birth_date: data.birth_date,
          citizenship: data.citizenship,
          about_me: data.about_me || '',
          salary_expectation: data.salary_expectation || '',
          employment_type: data.employment_type || ''
        });
      }
    } catch (err) {
      console.error('Error fetching resume:', err);
      setError('Ошибка загрузки резюме');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessions = async () => {
    try {
      const response = await fetch(RESUMES_API.PROFESSIONS);
      if (response.ok) {
        const data = await response.json();
        setProfessions(data);
      }
    } catch (err) {
      console.error('Error fetching professions:', err);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch(RESUMES_API.CITIES);
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const required = ['profession_id', 'full_name', 'city_id', 'phone_number', 'birth_date', 'citizenship'];

    for (let field of required) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setError(t.fillRequired);
        return false;
      }
    }

    // Проверка возраста
    const birthDate = new Date(formData.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      setError(t.minAge);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(RESUMES_API.UPDATE(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(t.updateSuccess);
        setTimeout(() => {
          router.push(`/${currentLang}/profile/resumes/${id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при обновлении');
      }
    } catch (err) {
      console.error('Error updating resume:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getProfessionName = (profession) => {
    return currentLang === 'kz' ? profession.name_kz : profession.name_ru;
  };

  const getCityName = (city) => {
    return currentLang === 'kz' ? city.name_kz : city.name_ru;
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
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
              <p className="text-lg text-gray-600 tilda-font">{t.loading}</p>
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

        .form-section {
          transition: all 0.2s ease;
        }

        .form-section:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .input-field {
          transition: all 0.2s ease;
        }

        .input-field:focus {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
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

            {/* Форма */}
            <div className="space-y-6">

              {/* Основная информация */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 form-section">
                <h2 className="text-lg font-bold text-gray-900 mb-4 tilda-font flex items-center">
                  <User size={20} className="mr-2 text-purple-500" />
                  {t.personalInfo}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Профессия */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.profession} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        name="profession_id"
                        value={formData.profession_id}
                        onChange={handleChange}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      >
                        <option value="">{t.professionPlaceholder}</option>
                        {professions.map(profession => (
                          <option key={profession.id} value={profession.id}>
                            {getProfessionName(profession)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ФИО */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.fullName} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder={t.fullNamePlaceholder}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        maxLength="255"
                        required
                      />
                    </div>
                  </div>

                  {/* Пол */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.gender} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={handleChange}
                          className="mr-2 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="tilda-font">{t.male}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={handleChange}
                          className="mr-2 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="tilda-font">{t.female}</span>
                      </label>
                    </div>
                  </div>

                  {/* Город */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.city} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        name="city_id"
                        value={formData.city_id}
                        onChange={handleChange}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      >
                        <option value="">{t.cityPlaceholder}</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>
                            {getCityName(city)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Телефон */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder={t.phonePlaceholder}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      />
                    </div>
                  </div>

                  {/* Дата рождения */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.birthDate} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleChange}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  {/* Гражданство */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.citizenship} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="citizenship"
                        value={formData.citizenship}
                        onChange={handleChange}
                        placeholder={t.citizenshipPlaceholder}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        maxLength="100"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 form-section">
                <h2 className="text-lg font-bold text-gray-900 mb-4 tilda-font flex items-center">
                  <FileText size={20} className="mr-2 text-blue-500" />
                  {t.aboutMe}
                </h2>

                {/* О себе */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                    {t.aboutMe}
                    <span className="text-gray-400 text-xs ml-2">500 {t.maxLength}</span>
                  </label>
                  <textarea
                    name="about_me"
                    value={formData.about_me}
                    onChange={handleChange}
                    placeholder={t.aboutMePlaceholder}
                    rows={4}
                    maxLength="500"
                    className="input-field w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font resize-none"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {formData.about_me.length}/500
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Зарплата */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.salaryExpectation}
                    </label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="salary_expectation"
                        value={formData.salary_expectation}
                        onChange={handleChange}
                        placeholder={t.salaryPlaceholder}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        maxLength="100"
                      />
                    </div>
                  </div>

                  {/* Тип занятости */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.employmentType}
                    </label>
                    <div className="relative">
                      <Users size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        name="employment_type"
                        value={formData.employment_type}
                        onChange={handleChange}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                      >
                        <option value="">{t.employmentTypePlaceholder}</option>
                        {employmentOptions.map(option => (
                          <option key={option.value} value={option.label}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 tilda-font transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      {t.save}
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.back()}
                  disabled={saving}
                  className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 tilda-font disabled:cursor-not-allowed"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}