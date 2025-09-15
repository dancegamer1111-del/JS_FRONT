import { useState } from 'react';
import {
  TrendingUp,
  Clock,
  User,
  Users,
  Briefcase,
  Star,
  Target,
  Coffee
} from 'lucide-react';

export default function PopularSearches({ currentLang = 'ru', onSearchClick }) {
  const getTranslation = (key) => {
    const translations = {
      'ru': {
        'popular.title': 'Популярные запросы',
        'popular.subtitle': 'Самые востребованные направления',
        'popular.bottomNote': 'Показано количество активных вакансий по каждой категории на данный момент'
      },
      'kz': {
        'popular.title': 'Танымал сұраулар',
        'popular.subtitle': 'Ең сұранысқа ие бағыттар',
        'popular.bottomNote': 'Әр санат бойынша қазіргі кездегі белсенді вакансиялар саны көрсетілген'
      }
    };

    return translations[currentLang]?.[key] || translations['ru']?.[key] || key;
  };

  const popularQueries = [
    {
      id: 1,
      title: currentLang === 'kz' ? 'Тәжірибесіз' : 'Без опыта работы',
      icon: User,
      count: 450,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      id: 2,
      title: currentLang === 'kz' ? 'Толық емес күн' : 'Неполный день',
      icon: Clock,
      count: 320,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 3,
      title: 'Кассир',
      icon: Target,
      count: 285,
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      id: 4,
      title: 'Менеджер',
      icon: Users,
      count: 195,
      color: 'from-orange-400 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      id: 5,
      title: currentLang === 'kz' ? 'Қашықтан жұмыс' : 'Удаленная работа',
      icon: Coffee,
      count: 380,
      color: 'from-pink-400 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700'
    },
    {
      id: 6,
      title: currentLang === 'kz' ? 'Тәжірибеден өту' : 'Стажировка',
      icon: Star,
      count: 165,
      color: 'from-teal-400 to-cyan-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700'
    },

  ];

  const handleQueryClick = (query) => {
    if (onSearchClick) {
      onSearchClick(query.title);
    } else {
      console.log('Search clicked:', query.title);
    }
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

        .popular-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .popular-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
        }

        .popular-icon {
          transition: all 0.3s ease;
        }

        .popular-card:hover .popular-icon {
          transform: rotate(5deg) scale(1.1);
        }

        @media (max-width: 640px) {
          .popular-card:hover {
            transform: translateY(-2px) scale(1.01);
          }
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-8">
        {/* Компактный Header */}
        <div className="text-center mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1 tilda-font flex items-center justify-center">
            <TrendingUp size={16} className="text-purple-600 mr-2" />
            {getTranslation('popular.title')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 tilda-font hidden sm:block">
            {getTranslation('popular.subtitle')}
          </p>
        </div>

        {/* Компактная сетка - 3 колонки на мобилке, 6 на десктопе */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {popularQueries.map((query) => {
            const IconComponent = query.icon;
            return (
              <div
                key={query.id}
                onClick={() => handleQueryClick(query)}
                className={`popular-card ${query.bgColor} rounded-lg p-2 sm:p-3 text-center border border-gray-100 hover:border-transparent cursor-pointer`}
              >
                {/* Компактная иконка */}
                <div className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r ${query.color} rounded-full mb-1 popular-icon`}>
                  <IconComponent size={10} className="text-white sm:w-3 sm:h-3" />
                </div>

                {/* Компактный заголовок */}
                <h3 className={`font-medium text-xs sm:text-sm mb-1 tilda-font ${query.textColor} leading-tight`}>
                  {query.title}
                </h3>

                {/* Маленький счетчик */}
                <span className={`text-xs font-medium ${query.textColor} bg-white/60 px-1 py-0.5 rounded-full block`}>
                  {query.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Компактная заметка - скрыта на мобилке */}
        <div className="mt-2 sm:mt-3 text-center hidden sm:block">
          <p className="text-xs text-gray-500 tilda-font">
            {getTranslation('popular.bottomNote')}
          </p>
        </div>
      </div>
    </>
  );
}