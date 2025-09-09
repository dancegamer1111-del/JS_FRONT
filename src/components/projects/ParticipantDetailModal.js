import { useState, useEffect } from 'react';
import { X, Instagram, Youtube, User, Vote, Trophy, Play } from 'lucide-react';

// Компонент для встроенного видео участника
const ParticipantVideo = ({ videoUrl, className = "" }) => {
  const [embedHtml, setEmbedHtml] = useState('');

  // Функция для получения ID видео из YouTube URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Получаем Instagram ID из URL
  const getInstagramId = (url) => {
    const patterns = [
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  // Определяем тип видео
  const getVideoType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('instagram.com/reel/')) {
      return 'instagram-reel';
    }
    if (url.includes('instagram.com')) {
      return 'instagram-post';
    }
    return 'unknown';
  };

  // Создаем полный HTML шаблон Instagram embed
  const createInstagramEmbed = (url) => {
    return `
      <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${url}/?utm_source=ig_embed&utm_campaign=loading" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);">
        <div style="padding:16px;">
          <a href="${url}/?utm_source=ig_embed&utm_campaign=loading" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
            <div style="display: flex; flex-direction: row; align-items: center;">
              <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
              <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
              </div>
            </div>
            <div style="padding: 19% 0;"></div>
            <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
              <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                    <g>
                      <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div style="padding-top: 8px;">
              <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">Посмотреть эту публикацию в Instagram</div>
            </div>
            <div style="padding: 12.5% 0;"></div>
            <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;">
              <div>
                <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div>
                <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div>
                <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div>
              </div>
              <div style="margin-left: 8px;">
                <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div>
                <div style="width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div>
              </div>
              <div style="margin-left: auto;">
                <div style="width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div>
                <div style="background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div>
                <div style="width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;">
              <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div>
              <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div>
            </div>
          </a>
          <p style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">
            <a href="${url}/?utm_source=ig_embed&utm_campaign=loading" style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">Публикация в Instagram</a>
          </p>
        </div>
      </blockquote>
    `;
  };

  const videoType = getVideoType(videoUrl);

  // Обработка YouTube видео
  if (videoType === 'youtube') {
    const videoId = getYouTubeVideoId(videoUrl);

    if (!videoId) {
      return (
        <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
          <div className="text-center p-4">
            <Youtube size={24} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 tilda-font">Неверный формат YouTube видео</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative rounded-lg overflow-hidden ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0`}
          title="YouTube видео участника"
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Обработка Instagram Reels (вертикальный формат)
  if (videoType === 'instagram-reel') {
    const instagramId = getInstagramId(videoUrl);

    if (!instagramId) {
      return (
        <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
          <div className="text-center p-4">
            <Instagram size={24} className="text-pink-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 tilda-font">Неверный формат Instagram Reel</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`} style={{ aspectRatio: '9/16' }}>
        <iframe
          src={`https://www.instagram.com/reel/${instagramId}/embed/`}
          title="Instagram Reel участника"
          className="w-full h-full"
          frameBorder="0"
          scrolling="no"
          allowtransparency="true"
          allow="encrypted-media"
          style={{ minHeight: '400px' }}
        />
      </div>
    );
  }

  // Обработка Instagram постов (квадратный формат с полным embed)
  if (videoType === 'instagram-post') {
    useEffect(() => {
      const html = createInstagramEmbed(videoUrl);
      setEmbedHtml(html);

      // Загружаем Instagram embed script
      const loadInstagramScript = () => {
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
          const script = document.createElement('script');
          script.async = true;
          script.src = '//www.instagram.com/embed.js';
          script.onload = () => {
            if (window.instgrm) {
              window.instgrm.Embeds.process();
            }
          };
          document.body.appendChild(script);
        } else if (window.instgrm) {
          // Если скрипт уже загружен, обрабатываем embeds
          setTimeout(() => {
            window.instgrm.Embeds.process();
          }, 100);
        }
      };

      // Небольшая задержка для корректной отрисовки
      setTimeout(loadInstagramScript, 100);
    }, [videoUrl]);

    return (
      <div className={`relative rounded-lg overflow-hidden bg-white ${className}`}>
        <div
          dangerouslySetInnerHTML={{ __html: embedHtml }}
          className="w-full h-full"
        />
      </div>
    );
  }

  // Неподдерживаемый формат
  return (
    <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center p-4">
        <Play size={24} className="text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 tilda-font mb-2">Неподдерживаемый формат видео</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline text-sm tilda-font"
        >
          Открыть видео
        </a>
      </div>
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
                    className={`w-full border rounded-lg shadow-sm ${
                      participant.video_url.includes('/reel/')
                        ? 'max-w-xs mx-auto' // Узкий контейнер для reels
                        : 'h-48' // Обычная высота для других видео
                    }`}
                  />
                </div>
              )}

              {/* Социальные сети */}
              {participant.instagram_url && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3 tilda-font">
                    {getTranslation('participant.socialMedia')}
                  </h5>
                  <div className="flex gap-3">
                    <a
                      href={participant.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
                    >
                      <Instagram size={18} />
                      <span className="font-medium">{getTranslation('participant.instagram')}</span>
                    </a>
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