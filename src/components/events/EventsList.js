import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EVENTS_API, appendQueryParams } from '../../utils/apiConfig';
import {
  Calendar,
  MapPin,
  Clock,
  Video,
  Users,
  RefreshCw,
  Coffee,
  ChevronRight
} from 'lucide-react';

export default function EventsList({ filters, getTranslation, currentLang }) {
  const safeGetTranslation = (key) => {
    if (typeof getTranslation === 'function') {
      return getTranslation(key);
    }
    const fallbacks = {
      'events.upcomingEvents': currentLang === 'kz' ? 'Келе жатқан мероприятиялар' : 'Предстоящие мероприятия',
      'events.fetchError': currentLang === 'kz' ? 'Мероприятияларды жүктеу кезінде қате' : 'Ошибка при загрузке мероприятий',
      'events.loadMore': currentLang === 'kz' ? 'Көбірек жүктеу' : 'Загрузить еще',
      'events.date': currentLang === 'kz' ? 'Күні' : 'Дата',
      'events.location': currentLang === 'kz' ? 'Орны' : 'Место проведения',
      'events.format': currentLang === 'kz' ? 'Формат' : 'Формат',
      'events.online': currentLang === 'kz' ? 'Онлайн' : 'Онлайн',
      'events.offline': currentLang === 'kz' ? 'Офлайн' : 'Офлайн',
      'events.noEvents': currentLang === 'kz' ? 'Мероприятиялар табылмады' : 'Мероприятия не найдены',
      'events.noEventsFound': currentLang === 'kz' ? 'Іздеу нәтижелері табылмады' : 'Мероприятия не найдены. Попробуйте изменить параметры поиска.',
      'events.viewDetails': currentLang === 'kz' ? 'Толығырақ' : 'Подробнее'
    };
    return fallbacks[key] || key;
  };

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = {
          ...filters,
          skip: (page - 1) * 10,
          limit: 10,
        };

        const url = appendQueryParams(
          filters?.search ? EVENTS_API.SEARCH : EVENTS_API.LIST,
          queryParams
        );

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseText = await response.text();
        let data;

        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response:', responseText);
          throw new Error('Invalid JSON response from server');
        }

        let processedData;

        if (Array.isArray(data)) {
          processedData = {
            items: data,
            total: data.length
          };
        } else if (data && Array.isArray(data.items)) {
          processedData = data;
        } else {
          console.warn('Unexpected API response format:', data);
          processedData = { items: [], total: 0 };
        }

        if (page === 1) {
          setEvents(processedData.items);
        } else {
          setEvents(prev => [...prev, ...processedData.items]);
        }

        setTotal(processedData.total);
        setHasMore(processedData.total > page * 10);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(safeGetTranslation('events.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(currentLang === 'kz' ? 'kk-KZ' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const formatShortDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString(currentLang === 'kz' ? 'kk-KZ' : 'ru-RU', { month: 'short' });
      return { day, month };
    } catch (e) {
      console.error('Error formatting short date:', e);
      return { day: '??', month: '???' };
    }
  };

  if (isLoading && page === 1) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
        <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium ml-3 tilda-font">Загрузка...</p>
        </div>
      </>
    );
  }

  if (error && page === 1) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="font-medium text-red-700 mb-1 tilda-font">Ошибка</p>
            <p className="text-red-600 text-sm tilda-font">{error}</p>
          </div>
        </div>
      </>
    );
  }

  if (!events || events.length === 0) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>
        <div className="flex flex-col justify-center items-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Calendar size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2 tilda-font">{safeGetTranslation('events.noEvents')}</h3>
          <p className="text-gray-600 max-w-md mx-auto tilda-font text-sm">
            {safeGetTranslation('events.noEventsFound')}
          </p>
        </div>
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
        }
        @font-face {
          font-family: 'TildaSans';
          src: url('/fonts/tilda/TildaSans-Bold.ttf') format('truetype');
          font-weight: 700;
        }
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .hover-lift {
          transition: all 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center tilda-font">
            <Calendar size={24} className="text-purple-600 mr-2" />
            {safeGetTranslation('events.upcomingEvents')}
          </h2>
          <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-semibold tilda-font">
            {total}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Link
              key={event.id}
              href={`/${currentLang}/event_detail/${event.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover-lift cursor-pointer"
            >
              {/* Изображение */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {event.photo_url ? (
                  <img
                    src={event.photo_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-600/10 flex items-center justify-center">
                    {event.format === 'Online' ? (
                      <Video size={48} className="text-purple-500" />
                    ) : (
                      <Coffee size={48} className="text-purple-500" />
                    )}
                  </div>
                )}

                {/* Дата */}
                <div className="absolute top-3 left-3 w-14 h-14 bg-white rounded-lg shadow-md flex flex-col items-center justify-center">
                  {(() => {
                    const { day, month } = formatShortDate(event.event_date || event.date);
                    return (
                      <>
                        <span className="text-xl font-bold text-gray-800 tilda-font">{day}</span>
                        <span className="text-xs font-medium text-gray-600 tilda-font">{month}</span>
                      </>
                    );
                  })()}
                </div>

                {/* Формат */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tilda-font ${
                    event.format === 'Online'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  }`}>
                    {event.format === 'Online' ? (
                      <>
                        <Video size={12} className="mr-1" />
                        {safeGetTranslation('events.online')}
                      </>
                    ) : (
                      <>
                        <Users size={12} className="mr-1" />
                        {safeGetTranslation('events.offline')}
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Контент */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors tilda-font">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                    <span className="tilda-font text-xs">{formatEventDate(event.event_date || event.date)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-1 tilda-font text-xs">{event.location}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4 tilda-font">
                  {event.description}
                </p>

                <div className="pt-3 border-t border-gray-100">
                  <span className="text-purple-600 text-sm font-medium flex items-center group-hover:text-purple-700 transition-colors tilda-font">
                    {safeGetTranslation('events.viewDetails')}
                    <ChevronRight size={16} className="ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {isLoading && page > 1 && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="text-center pt-4">
            <button
              onClick={loadMore}
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:shadow-md tilda-font"
            >
              <RefreshCw size={16} className="mr-2" />
              {safeGetTranslation('events.loadMore')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}