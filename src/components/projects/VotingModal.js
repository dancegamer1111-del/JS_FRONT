import { useState } from 'react';
import { X, ThumbsUp, Check } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function VotingModal({ projectId, participant, onClose, lang }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Хардкодим переводы прямо в этом компоненте
  const translations = {
    'ru': {
      'voting.title': 'Подтвердить голос',
      'voting.confirmVote': 'Голосовать за',
      'voting.oneVoteOnly': 'Можно проголосовать только один раз',
      'voting.cancel': 'Отмена',
      'voting.vote': 'Голосовать',
      'voting.voting': 'Голосуем...',
      'voting.success': 'Голос принят!',
      'voting.thankYou': 'Спасибо за участие!',
      'voting.close': 'Закрыть',
      'voting.defaultError': 'Ошибка при голосовании'
    },
    'kz': {
      'voting.title': 'Дауысты растау',
      'voting.confirmVote': 'Дауыс беру',
      'voting.oneVoteOnly': 'Тек бір рет дауыс бере аласыз',
      'voting.cancel': 'Бас тарту',
      'voting.vote': 'Дауыс беру',
      'voting.voting': 'Дауыс берілуде...',
      'voting.success': 'Дауыс қабылданды!',
      'voting.thankYou': 'Қатысқаныңызға рахмет!',
      'voting.close': 'Жабу',
      'voting.defaultError': 'Дауыс беру кезінде қате орын алды'
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

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Неверный ответ сервера: ${responseText}`);
      }

      if (!response.ok) {
        const errorMessage = data.detail || data.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      setIsSuccess(true);

    } catch (err) {
      console.error('Voting error:', err);
      setError(err.message || getTranslation('voting.defaultError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 tilda-font">
                {getTranslation('voting.success')}
              </h3>
              <p className="text-gray-600 mb-6 tilda-font">
                {getTranslation('voting.thankYou')}
              </p>
              <button
                onClick={() => onClose(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 tilda-font"
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
      <style jsx global>{`
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 tilda-font">
              {getTranslation('voting.title')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>

          {/* Простое подтверждение */}
          <div className="text-center mb-6">
            <p className="text-gray-800 mb-4 tilda-font">
              {getTranslation('voting.confirmVote')}
            </p>
            <div className="text-lg font-bold text-purple-600 mb-4 tilda-font">
              {participant.name}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700 tilda-font">
                {getTranslation('voting.oneVoteOnly')}
              </p>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 tilda-font">{error}</p>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 tilda-font"
            >
              {getTranslation('voting.cancel')}
            </button>
            <button
              onClick={handleVote}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 flex items-center justify-center tilda-font"
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