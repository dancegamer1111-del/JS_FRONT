import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../../../../../components/Layout';
import HeaderBack from '../../../../../components/HeaderBack';
import Tests from '../../../../../components/Tests';
import { CoursesAPI } from '../../../../../api/coursesAPI';
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Play,
  FileText,
  AlertTriangle
} from 'lucide-react';

const LearningPage = () => {
  const router = useRouter();
  const { id, lessonId } = router.query;

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [completedTests, setCompletedTests] = useState([]);
  const [activeTab, setActiveTab] = useState('video');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const courseResponse = await CoursesAPI.getCourseDetails(id);
        setCourse(courseResponse.data);

        try {
          const progressResponse = await CoursesAPI.getCourseProgress(id);
          setProgress(progressResponse.data);

          if (lessonId && progressResponse.data && progressResponse.data.completed_lessons) {
            const lessonIdInt = parseInt(lessonId);
            const isCompleted = progressResponse.data.completed_lessons.some(
              id => parseInt(id) === lessonIdInt
            );
            setIsLessonCompleted(isCompleted);
          }

          if (progressResponse.data && progressResponse.data.completed_tests) {
            setCompletedTests(progressResponse.data.completed_tests);
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            router.push(`/${router.query.lang}/course_detail/${id}`);
            return;
          }
        }

        if (!lessonId && courseResponse.data.chapters.length > 0 &&
            courseResponse.data.chapters[0].lessons.length > 0) {
          const firstLesson = courseResponse.data.chapters[0].lessons[0];
          router.push(`/${router.query.lang}/course_detail/${id}/learn/${firstLesson.id}`);
          return;
        }

        if (lessonId) {
          let foundLesson = null;
          for (const chapter of courseResponse.data.chapters) {
            const lesson = chapter.lessons.find(l => l.id.toString() === lessonId.toString());
            if (lesson) {
              foundLesson = { ...lesson, chapter_id: chapter.id, chapter_title: chapter.title };
              break;
            }
          }

          if (foundLesson) {
            setCurrentLesson(foundLesson);
          } else {
            setError('Урок не найден');
          }
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.message || 'Не удалось загрузить курс');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, lessonId, router]);

  const markLessonCompleted = async () => {
    try {
      const response = await CoursesAPI.completeLesson(id, currentLesson.id);
      setProgress(response.data);
      setIsLessonCompleted(true);

      if (response.data && response.data.completed_tests) {
        setCompletedTests(response.data.completed_tests);
      }

      if (response.data && response.data.completed_lessons) {
        const isCompleted = response.data.completed_lessons.includes(parseInt(currentLesson.id));
        setIsLessonCompleted(isCompleted);
      }
    } catch (err) {
      console.error('Ошибка при отметке урока:', err);
      alert('Не удалось отметить урок как завершенный');
    }
  };

  const handleTestComplete = (testId, passed) => {
    if (passed && !isLessonCompleted) {
      markLessonCompleted();
    }

    if (passed && !completedTests.includes(testId)) {
      setCompletedTests([...completedTests, testId]);
    }
  };

  const isTestCompleted = (testId) => {
    return completedTests.includes(parseInt(testId));
  };

  const areAllTestsCompleted = (lesson) => {
    if (!lesson.tests || lesson.tests.length === 0) return false;
    return lesson.tests.every(test => isTestCompleted(test.id));
  };

  const hasTests = (lesson) => {
    return lesson.tests && lesson.tests.length > 0;
  };

  const getNextLesson = () => {
    if (!course || !currentLesson) return null;

    let foundCurrentChapter = false;
    let foundCurrentLesson = false;

    for (const chapter of course.chapters) {
      if (foundCurrentLesson) break;

      if (chapter.id === currentLesson.chapter_id) {
        foundCurrentChapter = true;

        for (let i = 0; i < chapter.lessons.length; i++) {
          if (foundCurrentLesson && i < chapter.lessons.length) {
            return chapter.lessons[i];
          }

          if (chapter.lessons[i].id === currentLesson.id) {
            foundCurrentLesson = true;
            if (i + 1 < chapter.lessons.length) {
              return chapter.lessons[i + 1];
            }
          }
        }
      } else if (foundCurrentChapter) {
        if (chapter.lessons.length > 0) {
          return chapter.lessons[0];
        }
      }
    }

    return null;
  };

  function getYouTubeEmbedUrl(url) {
    let videoId = url.match(/v=([^&]*)/);
    if (!videoId) {
      videoId = url.match(/youtu\.be\/([^?]*)/);
    }
    if (videoId && videoId[1]) {
      return `https://www.youtube.com/embed/${videoId[1]}`;
    }
    return url;
  }

  function getVKEmbedUrl(url) {
    const videoMatch = url.match(/vk\.com\/video(-?\d+_\d+)/);
    if (videoMatch && videoMatch[1]) {
      return `https://vk.com/video_ext.php?oid=${videoMatch[1].split('_')[0]}&id=${videoMatch[1].split('_')[1]}&hd=1`;
    }
    return url;
  }

  const calculateProgress = () => {
    if (progress && progress.enrollment && typeof progress.enrollment.progress === 'number') {
      return Math.round(progress.enrollment.progress);
    }
    if (progress && progress.completed_lessons && Array.isArray(progress.completed_lessons)) {
      const totalLessons = getTotalLessonsCount(course.chapters);
      if (totalLessons === 0) return 0;
      return Math.round((progress.completed_lessons.length / totalLessons) * 100);
    }
    return 0;
  };

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
          <HeaderBack title="Обучение" onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4">
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
                <p className="text-lg text-gray-600 tilda-font">Загрузка урока...</p>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <Layout>
          <Head><title>Ошибка</title></Head>
          <HeaderBack title="Обучение" onBack={() => router.back()} />
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center text-red-700">
                  <AlertTriangle size={20} className="mr-2" />
                  <p className="font-semibold tilda-font">{error}</p>
                </div>
              </div>
              <Link href={`/${router.query.lang}/course_detail/${id}`} className="text-purple-600 hover:text-purple-700 tilda-font">
                Вернуться к курсу
              </Link>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (!course || !currentLesson) return null;

  const nextLesson = getNextLesson();
  const progressPercentage = calculateProgress();

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
        <Head>
          <title>{currentLesson.title} - {course.title}</title>
        </Head>

        <HeaderBack
          title={course.title}
          onBack={() => router.push(`/${router.query.lang}/course_detail/${id}`)}
        />

        {/* Прогресс-бар */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-purple-600 tilda-font min-w-[60px] text-right">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Сайдбар с содержанием */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                <h2 className="text-base font-bold mb-4 tilda-font">Содержание</h2>
                <div className="space-y-3">
                  {course.chapters.map((chapter, index) => (
                    <div key={chapter.id}>
                      <div className="text-xs font-semibold text-gray-500 mb-2 tilda-font">
                        Глава {index + 1}
                      </div>
                      <div className="space-y-1">
                        {chapter.lessons.map((lesson) => {
                          const isActive = currentLesson.id === lesson.id;
                          const isCompleted = progress && progress.completed_lessons &&
                                            progress.completed_lessons.some(id => parseInt(id) === parseInt(lesson.id));
                          const hasLessonTests = hasTests(lesson);
                          const allTestsCompleted = areAllTestsCompleted(lesson);

                          return (
                            <Link
                              key={lesson.id}
                              href={`/${router.query.lang}/course_detail/${id}/learn/${lesson.id}`}
                              className={`block p-2 rounded-lg text-sm transition-all duration-200 tilda-font ${
                                isActive
                                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                  isCompleted
                                    ? 'bg-green-500 text-white'
                                    : isActive
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                }`}>
                                  {isCompleted ? <CheckCircle size={12} /> : chapter.lessons.indexOf(lesson) + 1}
                                </div>
                                <span className="flex-1 truncate">{lesson.title}</span>
                              </div>
                              {hasLessonTests && (
                                <div className="mt-1 ml-7">
                                  {allTestsCompleted ? (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      ✓ Тесты
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                      Тесты
                                    </span>
                                  )}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Основной контент */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Заголовок урока */}
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 tilda-font">{currentLesson.title}</h2>
                  <p className="text-sm text-gray-600 mt-1 tilda-font">{currentLesson.chapter_title}</p>
                </div>

                {/* Табы */}
                <div className="border-b border-gray-100">
                  <div className="flex">
                    <button
                      className={`px-4 py-3 font-medium text-sm flex items-center gap-2 tilda-font ${
                        activeTab === 'video'
                          ? 'border-b-2 border-purple-600 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('video')}
                    >
                      <Play size={16} />
                      Видеоурок
                    </button>
                    {currentLesson.tests && currentLesson.tests.length > 0 && (
                      <button
                        className={`px-4 py-3 font-medium text-sm flex items-center gap-2 tilda-font ${
                          activeTab === 'tests'
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('tests')}
                      >
                        <FileText size={16} />
                        Тесты ({currentLesson.tests.length})
                        {currentLesson.tests.every(test => isTestCompleted(test.id)) && (
                          <CheckCircle size={14} className="text-green-600" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Контент */}
                <div className="p-4">
                  {activeTab === 'video' ? (
                    <div>
                      {/* Видео */}
                      <div className="aspect-video bg-black mb-4 rounded-lg overflow-hidden">
                        {currentLesson.video_url && (
                          currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be') ? (
                            <iframe
                              className="w-full h-full"
                              src={getYouTubeEmbedUrl(currentLesson.video_url)}
                              title={currentLesson.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          ) : currentLesson.video_url.includes('vk.com') ? (
                            <iframe
                              className="w-full h-full"
                              src={getVKEmbedUrl(currentLesson.video_url)}
                              title={currentLesson.title}
                              allow="autoplay; encrypted-media; fullscreen"
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <video
                              className="w-full h-full"
                              src={currentLesson.video_url}
                              controls
                              onEnded={() => !isLessonCompleted && markLessonCompleted()}
                            />
                          )
                        )}
                      </div>

                      {/* Описание */}
                      {currentLesson.description && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                          <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center tilda-font">
                            <BookOpen size={18} className="mr-2 text-purple-500" />
                            Описание
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed tilda-font">{currentLesson.description}</p>
                        </div>
                      )}

                      {/* Навигация */}
                      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-100">
                        {!isLessonCompleted ? (
                          <button
                            onClick={markLessonCompleted}
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 tilda-font"
                          >
                            <CheckCircle size={18} className="mr-2" />
                            Отметить как выполненный
                          </button>
                        ) : (
                          <div className="inline-flex items-center px-5 py-2.5 bg-green-100 text-green-700 font-medium rounded-lg tilda-font">
                            <CheckCircle size={18} className="mr-2" />
                            Урок завершён
                          </div>
                        )}
                        {nextLesson && (
                          <Link
                            href={`/${router.query.lang}/course_detail/${id}/learn/${nextLesson.id}`}
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 tilda-font"
                          >
                            Следующий урок
                            <ChevronRight size={18} className="ml-2" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Tests
                      courseId={id}
                      lessonId={currentLesson.id}
                      tests={currentLesson.tests}
                      completedTests={completedTests}
                      onComplete={handleTestComplete}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

const getTotalLessonsCount = (chapters) => {
  if (!chapters) return 0;
  return chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
};

export default LearningPage;