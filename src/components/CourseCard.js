import React from 'react';
import Link from 'next/link';
import { Clock, Globe, Award, Star, Play } from 'lucide-react';

const CourseCard = ({ course, formatPrice, enrollment }) => {
  const getLevelText = (level) => {
    switch (level) {
      case 'beginner':
        return 'Начинающий';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      case 'expert':
        return 'Эксперт';
      default:
        return '';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'intermediate':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';
      case 'advanced':
        return 'bg-gradient-to-r from-purple-500 to-pink-600 text-white';
      case 'expert':
        return 'bg-gradient-to-r from-red-500 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTestsStatus = () => {
    if (!course.tests || !Array.isArray(course.tests)) {
      return { total: 0, completed: 0 };
    }

    const totalTests = course.tests.length;
    let completedTests = 0;

    if (enrollment && enrollment.completed_tests) {
      completedTests = course.tests.filter(test =>
        enrollment.completed_tests.includes(test.id)
      ).length;
    }

    return { total: totalTests, completed: completedTests };
  };

  const formatTestsStatus = () => {
    const { total, completed } = getTestsStatus();
    if (total === 0) return null;
    return `${completed}/${total} тестов`;
  };

  const imageUrl = course.cover_image
    ? `${process.env.NEXT_PUBLIC_API_URL}/${course.cover_image}`
    : null;

  const progress = enrollment?.progress || 0;

  const gradientColors = [
    'from-purple-500 to-pink-600',
    'from-blue-500 to-cyan-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600'
  ];
  const gradient = gradientColors[course.id % gradientColors.length];

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
      `}</style>

      <Link href={`/ru/course_detail/${course.id}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group h-full flex flex-col">
          {/* Обложка */}
          <div className="relative h-40">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={course.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const placeholder = e.target.nextElementSibling;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : (
              <div className={`h-full w-full flex items-center justify-center bg-gradient-to-r ${gradient} ${imageUrl ? 'hidden' : 'flex'}`}>
                <span className="text-white font-bold text-3xl tilda-font">
                  {course.title?.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            {imageUrl && (
              <div className={`absolute inset-0 h-full w-full hidden items-center justify-center bg-gradient-to-r ${gradient}`}>
                <span className="text-white font-bold text-3xl tilda-font">
                  {course.title?.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

            {/* Бейджи */}
            <div className="absolute top-3 left-3 flex gap-2">
              {course.is_free && (
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full tilda-font">
                  Бесплатно
                </span>
              )}
              {course.level && (
                <span className={`${getLevelColor(course.level)} text-xs font-semibold px-3 py-1 rounded-full tilda-font`}>
                  {getLevelText(course.level)}
                </span>
              )}
            </div>

            {formatTestsStatus() && (
              <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full tilda-font">
                {formatTestsStatus()}
              </div>
            )}

            {/* Кнопка Play при наведении */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Play size={24} className="text-purple-600 ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Цена и рейтинг */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                <span className="text-sm font-bold text-gray-800 tilda-font">
                  {formatPrice(course)}
                </span>
              </div>

              {course.average_rating > 0 && (
                <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm font-medium text-gray-800 tilda-font">
                    {course.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Контент */}
          <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors tilda-font">
              {course.title}
            </h3>

            {course.author?.user_name && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Award size={14} className="mr-1 text-gray-400" />
                <span className="tilda-font">{course.author.user_name}</span>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-4 line-clamp-2 tilda-font">
              {course.description}
            </p>

            {/* Прогресс */}
            {enrollment && progress > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1 tilda-font">
                  <span>Прогресс</span>
                  <span className="font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Метаданные */}
            <div className="flex flex-wrap gap-2 mb-3 mt-auto">
              {course.duration && (
                <div className="flex items-center bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs tilda-font">
                  <Clock size={12} className="mr-1" />
                  <span>{course.duration} ч.</span>
                </div>
              )}
              {course.language && (
                <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs tilda-font">
                  <Globe size={12} className="mr-1" />
                  <span>{course.language}</span>
                </div>
              )}
            </div>

            {/* Кнопка */}
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center group-hover:shadow-md tilda-font">
              {enrollment && progress > 0 ? 'Продолжить' : 'Начать обучение'}
            </button>
          </div>
        </div>
      </Link>
    </>
  );
};

export default CourseCard;