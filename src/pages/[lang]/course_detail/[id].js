import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import HeaderBack from '../../../components/HeaderBack';
import { CoursesAPI } from '../../../api/coursesAPI';
import {
  Clock,
  User,
  Globe,
  TrendingUp,
  Eye,
  Play,
  CheckCircle,
  BookOpen,
  Award,
  Star,
  AlertTriangle
} from 'lucide-react';

const CourseDetailPage = () => {
  const router = useRouter();
  const { id, lang } = router.query;

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await CoursesAPI.getCourseDetails(id);
        setCourse(response.data);

        if (isAuthenticated) {
          try {
            const enrollmentResponse = await CoursesAPI.getCourseProgress(id);
            setEnrollment(enrollmentResponse.data);
          } catch (err) {
            if (err.response && err.response.status !== 404) {
              console.error('Ошибка при получении информации о записи:', err);
            }
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных курса:', err);
        setError(err.message || 'Не удалось загрузить данные курса');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/ru/auth/login?redirect=' + encodeURIComponent(`/ru/courses/${id}`));
      return;
    }

    setEnrollmentLoading(true);
    try {
      const response = await CoursesAPI.enrollInCourse(id);
      setEnrollment(response.data);
      alert('Вы успешно записались на курс!');
    } catch (err) {
      console.error('Ошибка при записи на курс:', err);
      alert(err.response?.data?.detail || 'Не удалось записаться на курс');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const formatPrice = (course) => {
    if (course.is_free) return 'Бесплатно';
    return `${course.price} ${course.currency}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ч ${mins > 0 ? mins + ' мин' : ''}`;
    }
    return `${mins} мин`;
  };

  const getTotalLessonsCount = (chapters) => {
    if (!chapters) return 0;
    return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  };

  const getCompletedLessonsCount = (chapters, enrollment) => {
    if (!chapters || !enrollment) return 0;

    let completedLessons = [];
    if (Array.isArray(enrollment.completed_lessons)) {
      completedLessons = enrollment.completed_lessons;
    } else if (enrollment.enrollment && Array.isArray(enrollment.enrollment.completed_lessons)) {
      completedLessons = enrollment.enrollment.completed_lessons;
    } else if (enrollment.completed_lessons) {
      completedLessons = enrollment.completed_lessons;
    }

    let count = 0;
    chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        if (completedLessons.includes(lesson.id)) {
          count++;
        }
      });
    });
    return count;
  };

  const getProgress = () => {
    if (enrollment && enrollment.enrollment && typeof enrollment.enrollment.progress === 'number') {
      return Math.round(enrollment.enrollment.progress);
    }
    if (enrollment && typeof enrollment.progress === 'number') {
      return Math.round(enrollment.progress);
    }
    if (enrollment && typeof enrollment === 'object') {
      if (enrollment.progress) {
        return Math.round(enrollment.progress);
      }
      if (enrollment.enrollment && enrollment.enrollment.progress) {
        return Math.round(enrollment.enrollment.progress);
      }
    }
    return 0;
  };

  const gradientColors = [
    'from-purple-500 to-pink-600',
    'from-blue-500 to-cyan-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600'
  ];
  const gradient = course ? gradientColors[course.id % gradientColors.length] : gradientColors[0];

  if (loading) {
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

        <Layout>
          <Head><title>Загрузка...</title></Head>
          <HeaderBack title="Детали курса" onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
                <p className="text-lg text-gray-600 tilda-font">Загрузка курса...</p>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <Layout>
          <Head><title>Ошибка</title></Head>
          <HeaderBack title="Детали курса" onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 tilda-font">{error || 'Курс не найден'}</h2>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
                >
                  Назад
                </button>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  const totalLessons = getTotalLessonsCount(course.chapters);
  const completedLessons = enrollment ? getCompletedLessonsCount(course.chapters, enrollment) : 0;
  const progressPercentage = getProgress();

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

      <Layout>
        <Head>
          <title>{course.title}</title>
          <meta name="description" content={course.description?.substring(0, 160) || course.title} />
        </Head>

        <HeaderBack title="Детали курса" onBack={() => router.back()} />

        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto p-4 space-y-4">

            {/* Компактный заголовок с обложкой */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
              <div className={`relative h-48 bg-gradient-to-r ${gradient} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-black/20"></div>
                <span className="text-white font-bold text-4xl z-10 tilda-font">
                  {course.title?.substring(0, 2).toUpperCase()}
                </span>

                {enrollment && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-semibold rounded-full shadow-lg tilda-font">
                    {progressPercentage === 100 ? 'Завершено' : 'В процессе'}
                  </div>
                )}

                {course.is_free && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 text-sm font-semibold rounded-full shadow-lg tilda-font">
                    Бесплатно
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tilda-font leading-tight">
                  {course.title}
                </h1>

                {course.author && (
                  <div className="flex items-center text-sm text-gray-600 mb-4 tilda-font">
                    <User size={16} className="mr-2 text-purple-500" />
                    <span>{course.author.name}</span>
                  </div>
                )}

                <p className="text-gray-700 mb-4 leading-relaxed tilda-font text-sm">
                  {course.description}
                </p>

                {/* Метаданные */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs tilda-font">
                    <Clock size={12} className="mr-1" />
                    {formatDuration(course.duration)}
                  </div>
                  <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs tilda-font">
                    <Globe size={12} className="mr-1" />
                    {course.language}
                  </div>
                  <div className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs tilda-font">
                    <Award size={12} className="mr-1" />
                    {course.level || 'Любой уровень'}
                  </div>
                  {course.views > 0 && (
                    <div className="flex items-center bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs tilda-font">
                      <Eye size={12} className="mr-1" />
                      {course.views}
                    </div>
                  )}
                  {course.average_rating > 0 && (
                    <div className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs tilda-font">
                      <Star size={12} className="mr-1 fill-current" />
                      {course.average_rating.toFixed(1)}
                    </div>
                  )}
                </div>

                {/* Категории */}
                {course.categories && course.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.categories.map(category => (
                      <Link
                        href={`/${router.query.lang || 'ru'}/courses/search?category_id=${category.id}`}
                        key={category.id}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs transition-colors tilda-font"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Навыки */}
                {course.skills && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-2 flex items-center tilda-font">
                      <TrendingUp size={16} className="mr-2 text-purple-600" />
                      Навыки:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.split(',').map((skill, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs tilda-font">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Карточка записи */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover-lift">
              <div className="text-2xl font-bold text-gray-900 mb-4 tilda-font">
                {formatPrice(course)}
              </div>

              {enrollment ? (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1 tilda-font">
                      <span className="text-sm font-medium text-gray-700">Прогресс</span>
                      <span className="text-sm font-semibold text-purple-600">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 tilda-font">
                      {completedLessons} из {totalLessons} уроков пройдено
                    </div>
                  </div>
                  <Link
                    href={`/${router.query.lang || 'ru'}/course_detail/${id}/learn`}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-medium text-center block transition-all duration-200 shadow-sm hover:shadow-md tilda-font"
                  >
                    {progressPercentage === 0 ? 'Начать обучение' : 'Продолжить обучение'}
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrollmentLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md tilda-font ${
                    enrollmentLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white`}
                >
                  {enrollmentLoading ? 'Записываем...' : 'Записаться на курс'}
                </button>
              )}

              {course.video_preview && (
                <div className="mt-3">
                  <button
                    onClick={() => window.open(course.video_preview, '_blank')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors shadow-sm tilda-font"
                  >
                    <Play size={16} className="mr-2 text-purple-600" />
                    Смотреть превью
                  </button>
                </div>
              )}
            </div>

            {/* Содержание курса */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover-lift">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-gray-900 tilda-font flex items-center">
                    <BookOpen size={20} className="mr-2 text-purple-500" />
                    Содержание курса
                  </h2>
                  {enrollment && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold tilda-font text-purple-600">{progressPercentage}%</span>
                    </div>
                  )}
                </div>
              </div>

              {course.chapters && course.chapters.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {course.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="p-4">
                      <h3 className="text-base font-bold mb-2 tilda-font text-gray-900">
                        Глава {index + 1}: {chapter.title}
                      </h3>
                      {chapter.description && (
                        <p className="text-sm text-gray-600 mb-3 tilda-font">{chapter.description}</p>
                      )}

                      {chapter.lessons && chapter.lessons.length > 0 && (
                        <div className="space-y-2">
                          {chapter.lessons.map((lesson, lessonIndex) => {
                            let completedLessonIds = [];
                            if (enrollment) {
                              if (Array.isArray(enrollment.completed_lessons)) {
                                completedLessonIds = enrollment.completed_lessons;
                              } else if (enrollment.enrollment && Array.isArray(enrollment.enrollment.completed_lessons)) {
                                completedLessonIds = enrollment.enrollment.completed_lessons;
                              }
                            }
                            const isCompleted = completedLessonIds.includes(lesson.id);

                            return (
                              <div
                                key={lesson.id}
                                className={`p-3 rounded-lg border transition-all duration-200 ${
                                  isCompleted
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-gray-50 border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle size={14} className="text-white" />
                                    ) : (
                                      <span className="text-xs font-bold text-white tilda-font">{lessonIndex + 1}</span>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 tilda-font flex items-center">
                                      {lesson.title}
                                      {isCompleted && (
                                        <span className="ml-2 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full tilda-font">
                                          ✓
                                        </span>
                                      )}
                                    </h4>
                                    {lesson.description && (
                                      <p className="text-xs text-gray-600 mt-1 tilda-font line-clamp-1">{lesson.description}</p>
                                    )}
                                  </div>

                                  {enrollment ? (
                                    <Link
                                      href={`/${router.query.lang || 'ru'}/course_detail/${id}/learn/${lesson.id}`}
                                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 tilda-font ${
                                        isCompleted
                                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                                      }`}
                                    >
                                      {isCompleted ? 'Повторить' : 'Начать'}
                                    </Link>
                                  ) : (
                                    <span className="text-xs text-gray-500 tilda-font">🔒</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 tilda-font">Содержание курса еще не добавлено</p>
                </div>
              )}
            </div>

            {/* Кнопка назад */}
            <div className="flex justify-end">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
              >
                Назад к курсам
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CourseDetailPage;