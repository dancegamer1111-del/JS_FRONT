import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../components/Layout';
import HeaderBack from '../../../../components/HeaderBack';
import {
  Users,
  Vote,
  Plus,
  Minus,
  RotateCcw,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Hash,
  User,
  Crown,
  Award,
  Target
} from 'lucide-react';

// Компактные стили шрифтов (те же что в оригинале)
const FontStyles = () => (
  <style jsx global>{`
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Light.ttf') format('truetype'); font-weight: 300; }
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Regular.ttf') format('truetype'); font-weight: 400; }
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Medium.ttf') format('truetype'); font-weight: 500; }
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Semibold.ttf') format('truetype'); font-weight: 600; }
    @font-face { font-family: 'TildaSans'; src: url('/fonts/tilda/TildaSans-Bold.ttf') format('truetype'); font-weight: 700; }

    .tilda-font { font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .hover-lift { transition: all 0.2s ease; }
    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
    .animate-pulse-success { animation: pulse-success 0.5s ease-in-out; }
    @keyframes pulse-success { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); background-color: #10b981; } }
  `}</style>
);

export default function VotesManagementPage() {
  const router = useRouter();
  const { id, lang } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLang, setCurrentLang] = useState('ru');
  const [processingParticipants, setProcessingParticipants] = useState(new Set());
  const [successMessages, setSuccessMessages] = useState({});

  useEffect(() => {
    if (lang && ['kz', 'ru', 'en'].includes(lang)) {
      setCurrentLang(lang);
    }
  }, [lang]);

  const getTranslation = (key) => {
    const translations = {
      'ru': {
        'votes.title': 'Управление голосами',
        'votes.backToProject': 'К проекту',
        'votes.loading': 'Загрузка...',
        'votes.error': 'Ошибка',
        'votes.notFound': 'Проект не найден',
        'votes.participants': 'Участники',
        'votes.totalVotes': 'Всего голосов',
        'votes.addVotes': 'Добавить голоса',
        'votes.setVotes': 'Установить',
        'votes.resetVotes': 'Сбросить',
        'votes.boostAll': 'Накрутить всем',
        'votes.distributeRandom': 'Случайное распределение',
        'votes.resetAll': 'Сбросить всё',
        'votes.enterAmount': 'Введите количество',
        'votes.confirm': 'Подтвердить',
        'votes.cancel': 'Отмена',
        'votes.success': 'Успешно!',
        'votes.failed': 'Ошибка!',
        'votes.place': 'место',
        'votes.votesCount': 'голосов',
        'votes.processing': 'Обработка...',
        'votes.quickActions': 'Быстрые действия',
        'votes.massActions': 'Массовые действия'
      },
      'kz': {
        'votes.title': 'Дауыстарды басқару',
        'votes.backToProject': 'Жобаға',
        'votes.loading': 'Жүктелуде...',
        'votes.error': 'Қате',
        'votes.notFound': 'Жоба жоқ',
        'votes.participants': 'Қатысушылар',
        'votes.totalVotes': 'Барлық дауыстар',
        'votes.addVotes': 'Дауыс қосу',
        'votes.setVotes': 'Орнату',
        'votes.resetVotes': 'Тастау',
        'votes.boostAll': 'Барлығына қосу',
        'votes.distributeRandom': 'Кездейсоқ бөлу',
        'votes.resetAll': 'Барлығын тастау',
        'votes.enterAmount': 'Санын енгізіңіз',
        'votes.confirm': 'Растау',
        'votes.cancel': 'Болдырмау',
        'votes.success': 'Сәтті!',
        'votes.failed': 'Қате!',
        'votes.place': 'орын',
        'votes.votesCount': 'дауыстар',
        'votes.processing': 'Өңделуде...',
        'votes.quickActions': 'Жылдам әрекеттер',
        'votes.massActions': 'Жаппай әрекеттер'
      }
    };
    return translations[currentLang]?.[key] || translations['ru']?.[key] || key;
  };

  // Загрузка данных проекта
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const url = `${API_BASE_URL}/api/v2/projects/${id}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ошибка! Статус: ${response.status}`);
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error('Ошибка при загрузке проекта:', err);
        setError(err.message || 'Произошла ошибка при загрузке проекта');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  // Функция для показа сообщения об успехе
  const showSuccess = (participantId, message) => {
    setSuccessMessages(prev => ({ ...prev, [participantId]: message }));
    setTimeout(() => {
      setSuccessMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[participantId];
        return newMessages;
      });
    }, 3000);
  };

  // API вызовы для управления голосами
  const boostParticipantVotes = async (participantId, votesToAdd) => {
    try {
      setProcessingParticipants(prev => new Set([...prev, participantId]));

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/v2/projects/${id}/participants/${participantId}/boost-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ votes_to_add: votesToAdd })
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении голосов');
      }

      const result = await response.json();

      // Обновляем локальные данные
      setProject(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.id === participantId
            ? { ...p, votes_count: p.votes_count + votesToAdd }
            : p
        )
      }));

      showSuccess(participantId, `+${votesToAdd} голосов`);
      return result;
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    } finally {
      setProcessingParticipants(prev => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
    }
  };

  const setParticipantVotes = async (participantId, votesCount) => {
    try {
      setProcessingParticipants(prev => new Set([...prev, participantId]));

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/v2/projects/${id}/participants/${participantId}/set-votes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ votes_count: votesCount })
      });

      if (!response.ok) {
        throw new Error('Ошибка при установке голосов');
      }

      const result = await response.json();

      // Обновляем локальные данные
      setProject(prev => ({
        ...prev,
        participants: prev.participants.map(p =>
          p.id === participantId
            ? { ...p, votes_count: votesCount }
            : p
        )
      }));

      showSuccess(participantId, `Установлено: ${votesCount}`);
      return result;
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    } finally {
      setProcessingParticipants(prev => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
    }
  };

  const boostAllParticipants = async (votesToAdd) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/v2/projects/${id}/boost-all-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ votes_to_add: votesToAdd })
      });

      if (!response.ok) {
        throw new Error('Ошибка при массовом добавлении голосов');
      }

      const result = await response.json();

      // Обновляем локальные данные
      setProject(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          votes_count: p.votes_count + votesToAdd
        }))
      }));

      return result;
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  };

  const distributeRandomVotes = async (totalVotes) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/v2/projects/${id}/distribute-random-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total_votes: totalVotes })
      });

      if (!response.ok) {
        throw new Error('Ошибка при случайном распределении голосов');
      }

      const result = await response.json();

      // Перезагружаем данные
      const updatedResponse = await fetch(`${API_BASE_URL}/api/v2/projects/${id}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setProject(updatedData);
      }

      return result;
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  };

  const resetAllVotes = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/v2/projects/${id}/reset-votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при сбросе голосов');
      }

      const result = await response.json();

      // Обновляем локальные данные
      setProject(prev => ({
        ...prev,
        participants: prev.participants.map(p => ({
          ...p,
          votes_count: 0
        }))
      }));

      return result;
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  };

  // Обработчики действий
  const handleQuickBoost = (participantId, amount) => {
    boostParticipantVotes(participantId, amount);
  };

  const handleCustomBoost = (participantId) => {
    const amount = prompt(getTranslation('votes.enterAmount'));
    if (amount && !isNaN(amount) && parseInt(amount) > 0) {
      boostParticipantVotes(participantId, parseInt(amount));
    }
  };

  const handleSetVotes = (participantId) => {
    const amount = prompt(getTranslation('votes.enterAmount'));
    if (amount && !isNaN(amount) && parseInt(amount) >= 0) {
      setParticipantVotes(participantId, parseInt(amount));
    }
  };

  const handleMassAction = (action) => {
    const amount = prompt(getTranslation('votes.enterAmount'));
    if (amount && !isNaN(amount) && parseInt(amount) > 0) {
      switch (action) {
        case 'boostAll':
          boostAllParticipants(parseInt(amount));
          break;
        case 'distributeRandom':
          distributeRandomVotes(parseInt(amount));
          break;
      }
    }
  };

  const handleResetAll = () => {
    if (confirm('Вы уверены, что хотите сбросить все голоса?')) {
      resetAllVotes();
    }
  };

  if (loading) {
    return (
      <>
        <FontStyles />
        <Layout>
          <Head><title>{getTranslation('votes.loading')}</title></Head>
          <HeaderBack title={getTranslation('votes.title')} onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 tilda-font">{getTranslation('votes.loading')}</p>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <FontStyles />
        <Layout>
          <Head><title>{getTranslation('votes.error')}</title></Head>
          <HeaderBack title={getTranslation('votes.title')} onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 tilda-font">{error || getTranslation('votes.notFound')}</h2>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
                >
                  {getTranslation('votes.backToProject')}
                </button>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  const sortedParticipants = [...(project.participants || [])].sort((a, b) => b.votes_count - a.votes_count);
  const totalVotes = sortedParticipants.reduce((sum, p) => sum + p.votes_count, 0);

  return (
    <>
      <FontStyles />
      <Layout>
        <Head>
          <title>{getTranslation('votes.title')} - {project.title}</title>
        </Head>

        <HeaderBack title={getTranslation('votes.title')} onBack={() => router.back()} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-4 space-y-4">

            {/* Заголовок и статистика */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover-lift">
              <h1 className="text-xl font-bold text-gray-900 mb-2 tilda-font">{project.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 tilda-font">
                <div className="flex items-center gap-1">
                  <Users size={16} className="text-purple-500" />
                  <span>{getTranslation('votes.participants')}: {sortedParticipants.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Vote size={16} className="text-green-500" />
                  <span>{getTranslation('votes.totalVotes')}: {totalVotes}</span>
                </div>
              </div>
            </div>

            {/* Массовые действия */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover-lift">
              <h2 className="text-lg font-bold text-gray-900 mb-3 tilda-font flex items-center">
                <Settings size={20} className="mr-2 text-purple-500" />
                {getTranslation('votes.massActions')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">


              </div>
            </div>

            {/* Список участников */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-900 tilda-font flex items-center">
                  <Users size={20} className="mr-2 text-purple-500" />
                  {getTranslation('votes.participants')}
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {sortedParticipants.map((participant, index) => (
                  <div key={participant.id} className="p-4 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      {/* Место и фото */}
                      <div className="flex-shrink-0 relative">
                        <div className="w-16 h-16 relative">
                          {participant.photo_url ? (
                            <img
                              src={participant.photo_url}
                              alt={participant.name}
                              className="w-full h-full object-cover rounded-xl shadow-sm border-2 border-white"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-sm border-2 border-white">
                              <User size={20} className="text-white" />
                            </div>
                          )}

                          {/* Место */}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-lg border-2 border-white ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                              index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                              index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900' :
                              'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                            } tilda-font min-w-[24px] text-center`}>
                              {index + 1}
                            </div>
                          </div>

                          {/* Корона для лидера */}
                          {index === 0 && (
                            <div className="absolute -top-2 -right-2">
                              <Crown size={16} className="text-yellow-500" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Информация об участнике */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 tilda-font flex items-center gap-2">
                          {participant.name}
                          {index < 3 && (
                            <Award size={14} className={
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              'text-orange-500'
                            } />
                          )}
                        </h3>
                        <div className="text-lg font-bold text-purple-600 tilda-font">
                          {participant.votes_count} {getTranslation('votes.votesCount')}
                        </div>

                        {/* Сообщение об успехе */}
                        {successMessages[participant.id] && (
                          <div className="mt-1 text-sm text-green-600 font-medium animate-pulse-success">
                            <CheckCircle size={14} className="inline mr-1" />
                            {successMessages[participant.id]}
                          </div>
                        )}
                      </div>

                      {/* Действия */}
                      <div className="flex-shrink-0">
                        {processingParticipants.has(participant.id) ? (
                          <div className="flex items-center justify-center w-8 h-8">
                            <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          <div className="flex gap-1 flex-wrap">
                            {/* Быстрые кнопки +1, +3, +10, +50, +100 */}
                            <button
                              onClick={() => handleQuickBoost(participant.id, 1)}
                              className="w-8 h-8 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-bold"
                              title="+1"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => handleQuickBoost(participant.id, 3)}
                              className="w-8 h-8 bg-teal-100 hover:bg-teal-200 text-teal-600 rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-bold"
                              title="+3"
                            >
                              +3
                            </button>
                            <button
                              onClick={() => handleQuickBoost(participant.id, 10)}
                              className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-bold"
                              title="+10"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleQuickBoost(participant.id, 50)}
                              className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-bold"
                              title="+50"
                            >
                              +50
                            </button>
                            <button
                              onClick={() => handleQuickBoost(participant.id, 100)}
                              className="w-8 h-8 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-all duration-200 flex items-center justify-center text-xs font-bold"
                              title="+100"
                            >
                              +100
                            </button>

                            {/* Кнопка произвольного количества */}
                            <button
                              onClick={() => handleCustomBoost(participant.id)}
                              className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                              title={getTranslation('votes.addVotes')}
                            >
                              <Plus size={14} />
                            </button>

                            {/* Кнопка установки точного значения */}
                            <button
                              onClick={() => handleSetVotes(participant.id)}
                              className="w-8 h-8 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                              title={getTranslation('votes.setVotes')}
                            >
                              <Hash size={14} />
                            </button>

                            {/* Кнопка сброса */}
                            <button
                              onClick={() => setParticipantVotes(participant.id, 0)}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200 flex items-center justify-center"
                              title={getTranslation('votes.resetVotes')}
                            >
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопка возврата */}
            <div className="flex justify-center">
              <button
                onClick={() => router.push(`/${currentLang}/projects/${id}`)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
              >
                {getTranslation('votes.backToProject')}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}