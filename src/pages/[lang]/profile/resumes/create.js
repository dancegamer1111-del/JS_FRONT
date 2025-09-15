import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../components/Layout';
import HeaderBack from '../../../../components/HeaderBack';
import { RESUMES_API } from '../../../../utils/apiConfig';
import {
  User,
  MapPin,
  Briefcase,
  Phone,
  Calendar,
  FileText,
  Users,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Search,
  ChevronRight
} from 'lucide-react';

export default function CreateResumeWizardStep1() {
  const router = useRouter();
  const currentLang = router.query.lang || 'ru';

  const [formData, setFormData] = useState({
    profession_id: '',
    full_name: '',
    gender: 'male',
    city_id: '',
    phone_number: '',
    birth_date: '',
    citizenship: 'Казахстан',
    about_me: '',
    salary_expectation: '',
    employment_type: ''
  });

  const [phoneDisplay, setPhoneDisplay] = useState(''); // Для отображения с маской
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Переводы
  const translations = {
    'ru': {
      title: 'Создать резюме - Шаг 1 из 4',
      subtitle: 'Основная информация',
      nextStep: 'Далее - Образование',
      backToList: 'Отмена',
      personalInfo: 'Личная информация',
      profession: 'Профессия',
      professionPlaceholder: 'Выберите профессию',
      searchProfession: 'Найти профессию',
      professionSelected: 'Профессия выбрана',
      changeProfession: 'Изменить',
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
      salaryPlaceholder: 'Например: 500,000 - 600,000 ₸',
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
      step: 'Шаг',
      of: 'из',
      basicInfo: 'Основная информация',
      education: 'Образование',
      experience: 'Опыт работы',
      skills: 'Навыки'
    },
    'kz': {
      title: 'Түйіндеме жасау - 1 қадам 4-тен',
      subtitle: 'Негізгі ақпарат',
      nextStep: 'Келесі - Білім',
      backToList: 'Болдырмау',
      personalInfo: 'Жеке ақпарат',
      profession: 'Мамандық',
      professionPlaceholder: 'Мамандықты таңдаңыз',
      searchProfession: 'Мамандық іздеу',
      professionSelected: 'Мамандық таңдалды',
      changeProfession: 'Өзгерту',
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
      salaryPlaceholder: 'Мысалы: 500,000 - 600,000 ₸',
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
      step: 'Қадам',
      of: 'тан',
      basicInfo: 'Негізгі ақпарат',
      education: 'Білім',
      experience: 'Жұмыс тәжірибесі',
      skills: 'Дағдылар'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  const employmentOptions = [
    { value: 'full_time', label: t.fullTime },
    { value: 'part_time', label: t.partTime },
    { value: 'project', label: t.project },
    { value: 'internship', label: t.internship }
  ];

  // Шаги мастера
  const steps = [
    { id: 1, name: t.basicInfo, current: true },
    { id: 2, name: t.education, current: false },
    { id: 3, name: t.experience, current: false },
    { id: 4, name: t.skills, current: false }
  ];

  // Функция для форматирования номера телефона
  const formatPhoneNumber = (value) => {
    // Удаляем все символы кроме цифр
    const numbers = value.replace(/\D/g, '');

    // Если начинается с 8, заменяем на 7
    let cleanNumbers = numbers;
    if (cleanNumbers.startsWith('8')) {
      cleanNumbers = '7' + cleanNumbers.slice(1);
    }

    // Если не начинается с 7, добавляем 7
    if (!cleanNumbers.startsWith('7')) {
      cleanNumbers = '7' + cleanNumbers;
    }

    // Ограничиваем до 11 цифр
    cleanNumbers = cleanNumbers.slice(0, 11);

    // Форматируем как +7 (XXX) XXX-XX-XX
    if (cleanNumbers.length >= 1) {
      let formatted = '+7';
      if (cleanNumbers.length > 1) {
        formatted += ' (' + cleanNumbers.slice(1, 4);
        if (cleanNumbers.length >= 4) {
          formatted += ')';
          if (cleanNumbers.length > 4) {
            formatted += ' ' + cleanNumbers.slice(4, 7);
            if (cleanNumbers.length > 7) {
              formatted += '-' + cleanNumbers.slice(7, 9);
              if (cleanNumbers.length > 9) {
                formatted += '-' + cleanNumbers.slice(9, 11);
              }
            }
          }
        }
      }
      return { formatted, clean: cleanNumbers };
    }

    return { formatted: '', clean: '' };
  };

  useEffect(() => {
    fetchCities();

    // Проверяем, есть ли выбранная профессия в localStorage
    const savedProfession = localStorage.getItem('selectedProfession');
    if (savedProfession) {
      try {
        const profession = JSON.parse(savedProfession);
        setSelectedProfession(profession);
        setFormData(prev => ({
          ...prev,
          profession_id: profession.id
        }));
        // Очищаем localStorage после использования
        localStorage.removeItem('selectedProfession');
      } catch (err) {
        console.error('Error parsing saved profession:', err);
      }
    }
  }, []);

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
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const { formatted, clean } = formatPhoneNumber(value);

    setPhoneDisplay(formatted);
    setFormData(prev => ({
      ...prev,
      phone_number: clean
    }));

    if (error) setError('');
  };

  const handleProfessionSearch = () => {
    // Переходим на страницу поиска профессий
    const selectedId = selectedProfession?.id || '';
    router.push(`/${currentLang}/profile/resumes/profession-search?selectedId=${selectedId}`);
  };

  const validateForm = () => {
    const required = ['profession_id', 'full_name', 'city_id', 'phone_number', 'birth_date', 'citizenship'];

    for (let field of required) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setError(t.fillRequired);
        return false;
      }
    }

    // Проверка номера телефона (должен быть 11 цифр)
    if (formData.phone_number.length !== 11) {
      setError('Введите корректный номер телефона');
      return false;
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

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Создаем базовое резюме
      const response = await fetch(RESUMES_API.CREATE, {
        method: 'POST',
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

      const data = await response.json();

      // Сохраняем ID резюме в localStorage для следующих шагов
      localStorage.setItem('resume_wizard_id', data.resume_id);

      // Переходим к следующему шагу
      router.push(`/${currentLang}/profile/resumes/step2`);

    } catch (err) {
      console.error('Error creating resume:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCityName = (city) => {
    return currentLang === 'kz' ? city.name_kz : city.name_ru;
  };

  const getProfessionName = (profession) => {
    return currentLang === 'kz' ? profession.name_kz : profession.name_ru;
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

        .profession-button {
          transition: all 0.2s ease;
        }

        .profession-button:hover {
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
                <h2 className="text-sm font-medium text-gray-600 tilda-font">{t.step} 1 {t.of} 4</h2>
                <span className="text-sm text-gray-500 tilda-font">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
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
                            : 'border-gray-300 bg-white text-gray-500'
                        }`}>
                          <span className="text-sm font-medium tilda-font">{step.id}</span>
                        </div>
                        <span className={`ml-2 text-sm font-medium ${
                          step.current ? 'text-purple-600' : 'text-gray-500'
                        } tilda-font hidden sm:block`}>
                          {step.name}
                        </span>
                        {stepIdx !== steps.length - 1 && (
                          <div className="flex-1 ml-4 mr-4">
                            <div className="h-0.5 bg-gray-200"></div>
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
              <p className="text-gray-600 tilda-font">Заполните основную информацию о себе</p>
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

            {/* Форма */}
            <div className="space-y-6">

              {/* Основная информация */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 form-section">
                <h2 className="text-lg font-bold text-gray-900 mb-4 tilda-font flex items-center">
                  <User size={20} className="mr-2 text-purple-500" />
                  {t.personalInfo}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Профессия - новое поле с поиском */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.profession} <span className="text-red-500">*</span>
                    </label>

                    {selectedProfession ? (
                      // Показываем выбранную профессию
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle size={20} className="text-green-600 mr-3" />
                            <div>
                              <p className="font-semibold text-green-900 tilda-font">
                                {getProfessionName(selectedProfession)}
                              </p>
                              {selectedProfession.category && (
                                <p className="text-sm text-green-600 tilda-font">
                                  {selectedProfession.category}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleProfessionSearch}
                            className="text-sm text-purple-600 hover:text-purple-700 font-medium tilda-font"
                          >
                            {t.changeProfession}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Показываем кнопку для поиска профессии
                      <button
                        type="button"
                        onClick={handleProfessionSearch}
                        className="profession-button w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <div className="flex items-center">
                          <Search size={16} className="text-gray-400 mr-3" />
                          <span className="text-gray-500 tilda-font">{t.searchProfession}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </button>
                    )}
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

                  {/* Телефон с маской */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneDisplay}
                        onChange={handlePhoneChange}
                        placeholder={t.phonePlaceholder}
                        className="input-field w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                        required
                      />
                    </div>
                    {formData.phone_number && formData.phone_number.length < 11 && (
                      <p className="text-xs text-gray-500 mt-1 tilda-font">
                        Введите номер в формате: +7 (777) 123-45-67
                      </p>
                    )}
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
                    <input
                      type="text"
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleChange}
                      placeholder={t.citizenshipPlaceholder}
                      className="input-field w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font"
                      maxLength="100"
                      required
                    />
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
                  {/* Зарплата с символом тенге */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 tilda-font">
                      {t.salaryExpectation}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₸</span>
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
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 tilda-font transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Создание...
                    </>
                  ) : (
                    <>
                      {t.nextStep}
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 tilda-font disabled:cursor-not-allowed"
                >
                  {t.backToList}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}