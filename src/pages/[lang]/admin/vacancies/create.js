import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { translations } from '../../../../locales/translations';
import Footer from '../../../../components/Footer';
import HeaderBack from '../../../../components/HeaderBack';
import { VACANCIES_API } from '../../../../utils/apiConfig';

export default function CreateVacancy({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang } = router.query;

  // Используем язык из серверных пропсов или из client-side маршрутизации
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Используем переводы из серверных пропсов или из импортированного файла
  const [t, setT] = useState(serverTranslations || {});

  // Состояние для формы создания вакансии
  const [formData, setFormData] = useState({
    title_kz: '',
    title_ru: '',
    description_kz: '',
    description_ru: '',
    requirements_kz: '',
    requirements_ru: '',
    salary: '',
    location_kz: '',
    location_ru: '',
    is_active: true,
    deadline: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Обновляем язык при client-side навигации
    if (clientLang && clientLang !== currentLang) {
      setCurrentLang(clientLang);
      setT(translations[clientLang] || translations['kz']);
    }
  }, [clientLang]);

  // Функция для получения переводов
  const getTranslation = (key) => {
    try {
      const keys = key.split('.');
      let result = t;

      for (const k of keys) {
        if (!result || result[k] === undefined) {
          console.warn(`Translation missing: ${key}`);
          return key;
        }
        result = result[k];
      }

      return typeof result === 'string' ? result : key;
    } catch (e) {
      console.error(`Error getting translation for key: ${key}`, e);
      return key;
    }
  };

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    // Проверяем обязательные поля
    if (!formData.title_kz) newErrors.title_kz = getTranslation('validation.required');
    if (!formData.title_ru) newErrors.title_ru = getTranslation('validation.required');
    if (!formData.description_kz) newErrors.description_kz = getTranslation('validation.required');
    if (!formData.description_ru) newErrors.description_ru = getTranslation('validation.required');
    if (!formData.deadline) newErrors.deadline = getTranslation('validation.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



// Отправка формы
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    // Используем правильный эндпоинт для создания вакансии
    const createEndpoint = VACANCIES_API.CREATE;

    console.log('Sending request to:', createEndpoint);
    console.log('Request body:', JSON.stringify(formData));

    const response = await fetch(createEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // Получаем текст ответа сначала как строку, чтобы проверить его
    const responseText = await response.text();

    // Логируем ответ для отладки
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers]));
    console.log('Response text:', responseText.slice(0, 200) + '...'); // Логируем первые 200 символов

    if (!response.ok) {
      try {
        // Пробуем парсить как JSON, если это возможно
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || 'Failed to create vacancy');
      } catch (parseError) {
        // Если не получается распарсить как JSON
        console.error('Error parsing response:', parseError);
        throw new Error(
          `Server returned ${response.status} with non-JSON response. Check API endpoint and server logs.`
        );
      }
    }

    // Если ответ успешный, и есть текст - пробуем распарсить как JSON
    let responseData;
    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
        console.log('Response data:', responseData);
      } catch (parseError) {
        console.warn('Response is not JSON, but request was successful');
      }
    }

    setSubmitSuccess(true);
    // Редирект на страницу с вакансиями после успешного создания
    setTimeout(() => {
      router.push(`/${currentLang}/admin/vacancies`);
    }, 2000);

  } catch (error) {
    console.error('Error creating vacancy:', error);
    setErrors(prev => ({
      ...prev,
      general: error.message
    }));
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{getTranslation('admin.vacancies.createTitle')}</title>
      </Head>

      <HeaderBack
        title={getTranslation('admin.vacancies.createTitle')}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {submitSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {getTranslation('admin.vacancies.createSuccess')}
          </div>
        ) : null}

        {errors.general ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.general}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              {getTranslation('admin.vacancies.basicInfo')}
            </h3>

            {/* Название вакансии на казахском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title_kz">
                {getTranslation('admin.vacancies.titleKz')} *
              </label>
              <input
                id="title_kz"
                type="text"
                name="title_kz"
                className={`shadow appearance-none border ${errors.title_kz ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.title_kz}
                onChange={handleChange}
              />
              {errors.title_kz && <p className="text-red-500 text-xs italic mt-1">{errors.title_kz}</p>}
            </div>

            {/* Название вакансии на русском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title_ru">
                {getTranslation('admin.vacancies.titleRu')} *
              </label>
              <input
                id="title_ru"
                type="text"
                name="title_ru"
                className={`shadow appearance-none border ${errors.title_ru ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.title_ru}
                onChange={handleChange}
              />
              {errors.title_ru && <p className="text-red-500 text-xs italic mt-1">{errors.title_ru}</p>}
            </div>

            {/* Зарплата */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salary">
                {getTranslation('admin.vacancies.salary')}
              </label>
              <input
                id="salary"
                type="text"
                name="salary"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.salary}
                onChange={handleChange}
                placeholder={getTranslation('admin.vacancies.salaryPlaceholder')}
              />
            </div>

            {/* Местоположение на казахском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location_kz">
                {getTranslation('admin.vacancies.locationKz')}
              </label>
              <input
                id="location_kz"
                type="text"
                name="location_kz"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.location_kz}
                onChange={handleChange}
              />
            </div>

            {/* Местоположение на русском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location_ru">
                {getTranslation('admin.vacancies.locationRu')}
              </label>
              <input
                id="location_ru"
                type="text"
                name="location_ru"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.location_ru}
                onChange={handleChange}
              />
            </div>

            {/* Срок подачи заявок */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">
                {getTranslation('admin.vacancies.deadline')} *
              </label>
              <input
                id="deadline"
                type="date"
                name="deadline"
                className={`shadow appearance-none border ${errors.deadline ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.deadline}
                onChange={handleChange}
              />
              {errors.deadline && <p className="text-red-500 text-xs italic mt-1">{errors.deadline}</p>}
            </div>

            {/* Активна ли вакансия */}
            <div className="mb-4 flex items-center">
              <input
                id="is_active"
                type="checkbox"
                name="is_active"
                className="mr-2"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <label className="text-gray-700 text-sm font-bold" htmlFor="is_active">
                {getTranslation('admin.vacancies.isActive')}
              </label>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              {getTranslation('admin.vacancies.description')}
            </h3>

            {/* Описание на казахском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description_kz">
                {getTranslation('admin.vacancies.descriptionKz')} *
              </label>
              <textarea
                id="description_kz"
                name="description_kz"
                rows="5"
                className={`shadow appearance-none border ${errors.description_kz ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.description_kz}
                onChange={handleChange}
              ></textarea>
              {errors.description_kz && <p className="text-red-500 text-xs italic mt-1">{errors.description_kz}</p>}
            </div>

            {/* Описание на русском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description_ru">
                {getTranslation('admin.vacancies.descriptionRu')} *
              </label>
              <textarea
                id="description_ru"
                name="description_ru"
                rows="5"
                className={`shadow appearance-none border ${errors.description_ru ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                value={formData.description_ru}
                onChange={handleChange}
              ></textarea>
              {errors.description_ru && <p className="text-red-500 text-xs italic mt-1">{errors.description_ru}</p>}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">
              {getTranslation('admin.vacancies.requirements')}
            </h3>

            {/* Требования на казахском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements_kz">
                {getTranslation('admin.vacancies.requirementsKz')}
              </label>
              <textarea
                id="requirements_kz"
                name="requirements_kz"
                rows="5"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.requirements_kz}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Требования на русском */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="requirements_ru">
                {getTranslation('admin.vacancies.requirementsRu')}
              </label>
              <textarea
                id="requirements_ru"
                name="requirements_ru"
                rows="5"
                className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={formData.requirements_ru}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => router.push(`/${currentLang}/admin/vacancies`)}
            >
              {getTranslation('common.cancel')}
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? getTranslation('common.submitting')
                : getTranslation('common.create')}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export async function getServerSideProps(context) {
  const { lang } = context.params;
  const validLang = ['kz', 'ru'].includes(lang) ? lang : 'kz';

  if (lang !== validLang) {
    return {
      redirect: {
        destination: `/${validLang}/admin/vacancies/create`,
        permanent: false,
      },
    };
  }

  const langTranslations = translations[validLang] || translations['kz'];

  return {
    props: {
      lang: validLang,
      translations: langTranslations,
    }
  };
}