import { useState } from 'react';
import { X, ThumbsUp, User, Check, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function VotingModal({ projectId, participant, onClose, lang }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Хардкодим переводы прямо в этом компоненте
  const translations = {
    'ru': {
      'voting.title': 'Подтверждение голосования',
      'voting.confirmVote': 'Вы уверены, что хотите проголосовать за',
      'voting.oneVoteOnly': 'Вы можете проголосовать только один раз в этом проекте',
      'voting.cancel': 'Отмена',
      'voting.vote': 'Голосовать',
      'voting.voting': 'Голосуем...',
      'voting.success': 'Голос принят!',
      'voting.thankYou': 'Спасибо за участие в голосовании!',
      'voting.close': 'Закрыть',
      'voting.currentVotes': 'Текущий результат',
      'voting.defaultError': 'Ошибка при голосовании',
      'voting.showMore': 'Показать полностью',
      'voting.showLess': 'Свернуть'
    },
    'kz': {
      'voting.title': 'Дауыс беруді растау',
      'voting.confirmVote': 'Дауыс бергіңіз келетініне сенімдісіз бе',
      'voting.oneVoteOnly': 'Бұл жобада тек бір рет дауыс бере аласыз',
      'voting.cancel': 'Бас тарту',
      'voting.vote': 'Дауыс беру',
      'voting.voting': 'Дауыс берілуде...',
      'voting.success': 'Дауыс қабылданды!',
      'voting.thankYou': 'Дауыс беруге қатысқаныңызға рахмет!',
      'voting.close': 'Жабу',
      'voting.currentVotes': 'Ағымдағы нәтиже',
      'voting.defaultError': 'Дауыс беру кезінде қате орын алды',
      'voting.showMore': 'Толығырақ көрсету',
      'voting.showLess': 'Жасыру'
    }
  };

  const getTranslation = (key) => {
    return translations[lang]?.[key] || translations['ru'][key] || key;
  };

  const handleVote = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        participant_id: participant.id
      };

      // Добавляем отладочную информацию
      console.log('Voting request details:');
      console.log('Project ID:', projectId);
      console.log('Participant ID:', participant.id);
      console.log('Request body:', requestBody);
      console.log('Token present:', !!token);
      console.log('API URL:', `${API_BASE_URL}/api/v2/projects/${projectId}/vote`);

      if (!token) {
        throw new Error('Токен авторизации не найден. Пожалуйста, войдите в систему.');
      }

      const response = await fetch(`${API_BASE_URL}/api/v2/projects/${projectId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        throw new Error(`Неверный ответ сервера: ${responseText}`);
      }

      if (!response.ok) {
        const errorMessage = data.detail || data.message || `HTTP ${response.status}`;
        console.error('API error response:', data);
        throw new Error(errorMessage);
      }

      console.log('Vote successful:', data);
      setIsSuccess(true);

      // Обновляем количество голосов в родительском компоненте
      if (typeof onClose === 'function') {
        // Можно передать обновленные данные обратно
        setTimeout(() => onClose(true), 2000); // Закрываем через 2 секунды с флагом успеха
      }

    } catch (err) {
      console.error('Voting error details:', {
        error: err,
        message: err.message,
        stack: err.stack
      });
      setError(err.message || getTranslation('voting.defaultError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Проверяем, нужна ли кнопка "Показать больше"
  const needsExpansion = participant.description && participant.description.length > 150;

  if (isSuccess) {
    return (
      <>
        {/* Стили для шрифтов */}
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-lg sm:rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-md border">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tilda-font">
                {getTranslation('voting.success')}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed tilda-font">
                {getTranslation('voting.thankYou')}
              </p>
              <button
                onClick={() => onClose(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 tilda-font"
              >
                {getTranslation('voting.close')}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Стили для шрифтов */}
      <style jsx global>{`
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Улучшенная прокрутка */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 2px;
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
        <div className="bg-white rounded-t-lg sm:rounded-lg shadow-2xl p-4 sm:p-8 w-full max-w-md border max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 tilda-font">
              {getTranslation('voting.title')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300 p-1"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Информация об участнике - адаптивная версия */}
          <div className="mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border">
              {/* Мобильная версия - вертикальная компоновка */}
              <div className="sm:hidden">
                <div className="flex items-center gap-3 mb-3">
                  {participant.photo_url ? (
                    <img
                      src={participant.photo_url}
                      alt={participant.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm tilda-font truncate">
                      {participant.name}
                    </h4>
                    <div className="flex items-center text-xs">
                      <span className="text-gray-500 tilda-font">{getTranslation('voting.currentVotes')}: </span>
                      <span className="font-semibold text-purple-600 ml-1 tilda-font">{participant.votes_count}</span>
                    </div>
                  </div>
                </div>

                {participant.description && (
                  <div>
                    <p className={`text-sm text-gray-600 leading-relaxed tilda-font transition-all duration-200 ${
                      !isDescriptionExpanded && needsExpansion ? 'line-clamp-3' : ''
                    }`}>
                      {participant.description}
                    </p>
                    {needsExpansion && (
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="mt-2 flex items-center text-xs text-purple-600 hover:text-purple-800 transition-colors tilda-font"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            {getTranslation('voting.showLess')}
                            <ChevronUp size={14} className="ml-1" />
                          </>
                        ) : (
                          <>
                            {getTranslation('voting.showMore')}
                            <ChevronDown size={14} className="ml-1" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Десктопная версия - горизонтальная компоновка */}
              <div className="hidden sm:flex items-start gap-4">
                {participant.photo_url ? (
                  <img
                    src={participant.photo_url}
                    alt={participant.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User size={24} className="text-gray-500" />
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-gray-900 mb-2 tilda-font">{participant.name}</h4>
                  {participant.description && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 leading-relaxed tilda-font">
                        {participant.description}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 tilda-font">{getTranslation('voting.currentVotes')}: </span>
                    <span className="font-semibold text-purple-600 ml-1 tilda-font">{participant.votes_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Подтверждение */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-gray-800 mb-4 leading-relaxed tilda-font">
              {getTranslation('voting.confirmVote')} <strong className="break-words">{participant.name}</strong>?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-amber-700 tilda-font">
                {getTranslation('voting.oneVoteOnly')}
              </p>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-800 mb-1 tilda-font">Ошибка:</p>
              <p className="text-xs sm:text-sm text-red-700 tilda-font break-words">{error}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="order-2 sm:order-1 flex-1 px-4 sm:px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors duration-300 disabled:opacity-50 tilda-font text-sm sm:text-base"
            >
              {getTranslation('voting.cancel')}
            </button>
            <button
              onClick={handleVote}
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex-1 px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-300 disabled:opacity-50 flex items-center justify-center tilda-font text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {getTranslation('voting.voting')}
                </>
              ) : (
                <>
                  <ThumbsUp size={16} className="mr-2" />
                  {getTranslation('voting.vote')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}