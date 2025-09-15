import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../../components/Layout';
import HeaderBack from '../../../../components/HeaderBack';
import { RESUMES_API } from '../../../../utils/apiConfig';
import {
  Search,
  Briefcase,
  CheckCircle,
  ArrowLeft,
  Loader
} from 'lucide-react';

export default function ProfessionSearchPage() {
  const router = useRouter();
  const currentLang = router.query.lang || 'ru';
  const { selectedId } = router.query; // ID уже выбранной профессии

  const [searchQuery, setSearchQuery] = useState('');
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState(null);

  // Переводы
  const translations = {
    'ru': {
      title: 'Выбор профессии',
      searchPlaceholder: 'Введите название профессии...',
      noResults: 'Профессии не найдены',
      select: 'Выбрать',
      selected: 'Выбрано',
      searching: 'Поиск...',
      backToForm: 'Назад к форме',
      category: 'Категория'
    },
    'kz': {
      title: 'Мамандық таңдау',
      searchPlaceholder: 'Мамандық атауын енгізіңіз...',
      noResults: 'Мамандықтар табылмады',
      select: 'Таңдау',
      selected: 'Таңдалды',
      searching: 'Іздеу...',
      backToForm: 'Формаға оралу',
      category: 'Санат'
    }
  };

  const t = translations[currentLang] || translations['ru'];

  useEffect(() => {
    // Загружаем начальный список профессий
    fetchProfessions('');

    // Если есть уже выбранная профессия, устанавливаем её
    if (selectedId) {
      fetchSelectedProfession(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    // Делаем поиск с задержкой при изменении запроса
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchProfessions(searchQuery);
      } else {
        fetchProfessions('');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSelectedProfession = async (professionId) => {
    try {
      const response = await fetch(`${RESUMES_API.PROFESSIONS}/${professionId}`);
      if (response.ok) {
        const profession = await response.json();
        setSelectedProfession(profession);
      }
    } catch (err) {
      console.error('Error fetching selected profession:', err);
    }
  };

  const fetchProfessions = async (query) => {
    setLoading(true);
    try {
      let url = `${RESUMES_API.PROFESSIONS}/search?language=${currentLang}&limit=50`;
      if (query.trim()) {
        url += `&query=${encodeURIComponent(query.trim())}`;
      } else {
        // Если нет запроса, загружаем все профессии
        url = `${RESUMES_API.PROFESSIONS}?limit=50`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProfessions(data);
      }
    } catch (err) {
      console.error('Error fetching professions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfession = (profession) => {
    setSelectedProfession(profession);

    // Возвращаемся на предыдущую страницу с выбранной профессией
    // Используем localStorage для передачи данных
    localStorage.setItem('selectedProfession', JSON.stringify({
      id: profession.id,
      name_ru: profession.name_ru,
      name_kz: profession.name_kz,
      category: profession.category
    }));

    router.back();
  };

  const getProfessionName = (profession) => {
    return currentLang === 'kz' ? profession.name_kz : profession.name_ru;
  };

  const handleBack = () => {
    router.back();
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

        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .profession-item {
          transition: all 0.2s ease;
        }

        .profession-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .search-input {
          transition: all 0.2s ease;
        }

        .search-input:focus {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
        }
      `}</style>

      <Layout>
        <Head>
          <title>{t.title}</title>
        </Head>

        <HeaderBack title={t.title} onBack={handleBack} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto p-4">

            {/* Поисковая строка */}
            <div className="mb-6">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="search-input w-full pl-10 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent tilda-font text-lg"
                />
                {loading && (
                  <Loader size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>

              {searchQuery && (
                <p className="mt-2 text-sm text-gray-500 tilda-font">
                  {loading ? t.searching : `Результаты поиска для "${searchQuery}"`}
                </p>
              )}
            </div>

            {/* Список профессий */}
            <div className="space-y-3">
              {professions.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 tilda-font">{t.noResults}</p>
                </div>
              )}

              {professions.map((profession) => {
                const isSelected = selectedProfession?.id === profession.id;

                return (
                  <div
                    key={profession.id}
                    className={`profession-item bg-white rounded-xl p-4 border cursor-pointer ${
                      isSelected
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                    onClick={() => handleSelectProfession(profession)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Briefcase size={20} className={`mr-3 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                          <div>
                            <h3 className={`font-semibold tilda-font ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                              {getProfessionName(profession)}
                            </h3>
                            {profession.category && (
                              <p className={`text-sm mt-1 tilda-font ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                                {t.category}: {profession.category}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        {isSelected ? (
                          <div className="flex items-center text-purple-600">
                            <CheckCircle size={20} className="mr-2" />
                            <span className="text-sm font-medium tilda-font">{t.selected}</span>
                          </div>
                        ) : (
                          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors tilda-font">
                            {t.select}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Кнопка "Назад" внизу */}
            <div className="mt-8 pb-6">
              <button
                onClick={handleBack}
                className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors tilda-font"
              >
                <ArrowLeft size={18} className="mr-2" />
                {t.backToForm}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}