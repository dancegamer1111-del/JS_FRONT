import { useState } from 'react';
import { X, Instagram, Facebook, Youtube, User, Vote, Trophy, Play, Pause, Volume2, VolumeX } from 'lucide-react';

// Компонент для встроенного видео участника
const ParticipantVideo = ({ videoUrl, className = "" }) => {
  // Функция для получения ID видео из YouTube URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <Youtube size={24} className="text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 tilda-font">Неподдерживаемый формат видео</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0`}
        title="Видео участника"
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default function ParticipantDetailModal({ participant, onClose, onVote, lang }) {
  const [imageError, setImageError] = useState(false);

  // Хардкодим переводы
  const translations = {
    'ru': {
      'participant.details': 'О участнике',
      'participant.votes': 'голосов',
      'participant.vote': 'Голосовать',
      'participant.description': 'Описание',
      'participant.video': 'Видео',
      'participant.socialMedia': 'Социальные сети',
      'participant.close': 'Закрыть',
      'participant.noDescription': 'Описание не указано',
      'participant.instagram': 'Instagram',
      'participant.facebook': 'Facebook',
      'participant.youtube': 'YouTube'
    },
    'kz': {
      'participant.details': 'Қатысушы туралы',
      'participant.votes': 'дауыс',
      'participant.vote': 'Дауыс беру',
      'participant.description': 'Сипаттама',
      'participant.video': 'Видео',
      'participant.socialMedia': 'Әлеуметтік желілер',
      'participant.close': 'Жабу',
      'participant.noDescription': 'Сипаттама көрсетілмеген',
      'participant.instagram': 'Instagram',
      'participant.facebook': 'Facebook',
      'participant.youtube': 'YouTube'
    }
  };

  const getTranslation = (key) => {
    return translations[lang]?.[key] || translations['ru'][key] || key;
  };

  // Функция для получения локализованного описания участника
  const getLocalizedDescription = (participant) => {
    if (lang === 'ru' && participant.description_ru) {
      return participant.description_ru;
    }
    return participant.description;
  };

  const localizedDescription = getLocalizedDescription(participant);

  return (
    <>
      <style jsx global>{`
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 tilda-font">
              {getTranslation('participant.details')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Контент с прокруткой */}
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 140px)' }}>
            <div className="p-4 space-y-6">
              {/* Фото и основная информация */}
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  {participant.photo_url && !imageError ? (
                    <img
                      src={participant.photo_url}
                      alt={participant.name}
                      className="w-32 h-32 object-cover rounded-2xl shadow-lg border-4 border-white"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                      <User size={48} className="text-white" />
                    </div>
                  )}

                  {/* Бейдж с количеством голосов */}
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow-lg border-2 border-purple-100 px-3 py-1">
                    <div className="flex items-center gap-1">
                      <Trophy size={14} className="text-purple-600" />
                      <span className="text-sm font-bold text-purple-600 tilda-font">
                        {participant.votes_count}
                      </span>
                    </div>
                  </div>
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-2 tilda-font">
                  {participant.name}
                </h4>

                <div className="text-sm text-gray-500 tilda-font">
                  {participant.votes_count} {getTranslation('participant.votes')}
                </div>
              </div>

              {/* Описание */}
              {localizedDescription && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 tilda-font">
                    {getTranslation('participant.description')}
                  </h5>
                  <div className="text-gray-700 leading-relaxed tilda-font bg-gray-50 rounded-lg p-4 border">
                    <div dangerouslySetInnerHTML={{
                      __html: localizedDescription.replace(/\n/g, '<br />')
                    }} />
                  </div>
                </div>
              )}

              {!localizedDescription && (
                <div className="text-center py-4">
                  <p className="text-gray-500 tilda-font italic">
                    {getTranslation('participant.noDescription')}
                  </p>
                </div>
              )}

              {/* Видео */}
              {participant.video_url && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 tilda-font flex items-center">
                    <Play size={18} className="mr-2 text-purple-500" />
                    {getTranslation('participant.video')}
                  </h5>
                  <ParticipantVideo
                    videoUrl={participant.video_url}
                    className="w-full h-48 border rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Социальные сети */}
              {(participant.instagram_url || participant.facebook_url) && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 tilda-font">
                    {getTranslation('participant.socialMedia')}
                  </h5>
                  <div className="flex gap-3">
                    {participant.instagram_url && (
                      <a
                        href={participant.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
                      >
                        <Instagram size={18} />
                        <span className="font-medium">{getTranslation('participant.instagram')}</span>
                      </a>
                    )}

                    {participant.facebook_url && (
                      <a
                        href={participant.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
                      >
                        <Facebook size={18} />
                        <span className="font-medium">{getTranslation('participant.facebook')}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Нижняя панель с кнопками */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg font-semibold transition-colors duration-200 tilda-font"
              >
                {getTranslation('participant.close')}
              </button>

              {onVote && (
                <button
                  onClick={onVote}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 tilda-font flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Vote size={18} />
                  {getTranslation('participant.vote')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}