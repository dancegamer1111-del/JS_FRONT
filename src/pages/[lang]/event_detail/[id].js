import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import HeaderBack from '../../../components/HeaderBack';
import { EVENTS_API } from '../../../utils/apiConfig';
import { translations } from '../../../locales/translations';
import { Calendar, MapPin, Clock, Video, Users, X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function EventDetailPage() {
  const router = useRouter();
  const { lang = 'ru', id } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    email: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  const getTranslation = (key) => {
    if (!translations[lang]) return key;
    const parts = key.split('.');
    let result = translations[lang];
    for (const part of parts) {
      if (result && result[part] !== undefined) {
        result = result[part];
      } else {
        return key;
      }
    }
    return result;
  };

  useEffect(() => {
    if (!id) return;

    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(EVENTS_API.DETAILS(id));
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError(getTranslation('events.fetchError') || 'Ошибка при загрузке данных мероприятия');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ type: 'loading', message: 'Отправка данных...' });

    try {
      const response = await fetch(EVENTS_API.PARTICIPATE(id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      setSubmitStatus({
        type: 'success',
        message: 'Вы успешно зарегистрированы!'
      });

      setFormData({ first_name: '', last_name: '', company_name: '', email: '' });
      setTimeout(() => {
        setShowModal(false);
        setSubmitStatus(null);
      }, 3000);
    } catch (err) {
      setSubmitStatus({
        type: 'error',
        message: 'Произошла ошибка при регистрации'
      });
    }
  };

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'kz' ? 'kk-KZ' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout currentLang={lang}>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
        <HeaderBack title="Детали мероприятия" onBack={() => router.back()} />
        <div className="max-w-6xl mx-auto px-4 py-8 flex justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout currentLang={lang}>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
        <HeaderBack title="Детали мероприятия" onBack={() => router.back()} />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center text-red-700">
              <AlertTriangle size={20} className="mr-2" />
              <p className="font-semibold tilda-font">{error || 'Мероприятие не найдено'}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentLang={lang}>
      <style jsx global>{`
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Regular.ttf') format('truetype');
          font-weight: 400;
        }
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Bold.ttf') format('truetype');
          font-weight: 700;
        }
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      <Head>
        <title>{event.title}</title>
      </Head>

      <HeaderBack title="Детали мероприятия" onBack={() => router.push(`/${lang}/events`)} />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header карточка */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {event.photo_url && (
            <div className="relative h-64">
              <img src={event.photo_url} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          )}

          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tilda-font">{event.title}</h1>

            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm tilda-font">
                <Calendar size={16} className="mr-2" />
                {formatEventDate(event.date)}
              </div>

              <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm tilda-font">
                <MapPin size={16} className="mr-2" />
                {event.location}
              </div>

              <span className={`flex items-center rounded-lg px-3 py-2 text-sm font-semibold tilda-font ${
                event.format === 'Online'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
              }`}>
                {event.format === 'Online' ? <Video size={16} className="mr-2" /> : <Users size={16} className="mr-2" />}
                {event.format === 'Online' ? 'Онлайн' : 'Офлайн'}
              </span>
            </div>


          </div>
        </div>

        {/* Контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            {/* Описание */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 tilda-font">
                <Calendar size={20} className="mr-2 text-purple-600" />
                Описание мероприятия
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed tilda-font text-sm">{event.description}</p>
            </div>

            {/* Программа */}
            {event.programs && event.programs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 tilda-font">
                  <Clock size={20} className="mr-2 text-purple-600" />
                  Программа
                </h2>
                <div className="space-y-3">
                  {event.programs.map((program, index) => (
                    <div key={program.id || index} className="flex border-l-4 border-purple-500 pl-4 py-2 hover:bg-purple-50 transition-colors rounded-r-lg">
                      <div className="min-w-[60px] text-purple-700 font-semibold text-sm tilda-font">
                        {program.time} мин.
                      </div>
                      <div className="text-gray-700 ml-4 text-sm tilda-font">{program.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Спикеры */}
          <div>
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 tilda-font">
                  <Users size={20} className="mr-2 text-purple-600" />
                  Спикеры
                </h2>
                <div className="space-y-4">
                  {event.speakers.map((speaker, index) => (
                    <div key={speaker.id || index} className="p-4 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors">
                      <div className="flex items-start">
                        {speaker.photo_url ? (
                          <img
                            src={speaker.photo_url}
                            alt={`${speaker.first_name} ${speaker.last_name}`}
                            className="w-14 h-14 rounded-full object-cover mr-3 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-3 text-white flex-shrink-0">
                            <span className="text-lg font-bold tilda-font">
                              {speaker.first_name.charAt(0)}{speaker.last_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm tilda-font">
                            {speaker.last_name} {speaker.first_name}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1 tilda-font">{speaker.bio}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>


              <div className="p-6">
                {submitStatus ? (
                  <div className={`p-4 rounded-lg flex items-center tilda-font ${
                    submitStatus.type === 'success' ? 'bg-green-50 text-green-800' :
                    submitStatus.type === 'error' ? 'bg-red-50 text-red-800' :
                    'bg-blue-50 text-blue-800'
                  }`}>
                    {submitStatus.type === 'loading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent mr-3"></div>
                    )}
                    {submitStatus.type === 'success' && <CheckCircle size={20} className="mr-3" />}
                    {submitStatus.type === 'error' && <X size={20} className="mr-3" />}
                    <p>{submitStatus.message}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 tilda-font">Фамилия *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm tilda-font"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 tilda-font">Имя *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm tilda-font"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 tilda-font">Название компании *</label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm tilda-font"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 tilda-font">E-mail *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm tilda-font"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors tilda-font"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 tilda-font"
                      >
                        Зарегистрироваться
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}