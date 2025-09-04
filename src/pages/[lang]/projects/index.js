import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import ProjectsList from '../../../components/projects/ProjectsList';

export default function ProjectsPage() {
  const router = useRouter();
  const { lang } = router.query;
  const [currentLang, setCurrentLang] = useState('ru');

  useEffect(() => {
    if (lang && ['kz', 'ru', 'en'].includes(lang)) {
      setCurrentLang(lang);
    }
  }, [lang]);

  const getTranslation = (key) => {
    const translations = {
      'ru': {
        'projects.title': 'Проекты',
        'projects.description': 'Участвуйте в голосованиях и подавайте заявки на проекты',
        'projects.backToHome': 'На главную',
        'projects.availableProjects': 'Доступные проекты',
        'projects.noProjects': 'Проекты не найдены',
        'projects.loading': 'Загрузка...',
        'projects.loadMore': 'Загрузить еще',
        'projects.fetchError': 'Ошибка при загрузке проектов',
        'projects.searchPlaceholder': 'Поиск проектов...',
        'projects.moreDetails': 'Подробнее →',
        'projects.voting': 'Голосование',
        'projects.application': 'Прием заявок',
        'projects.active': 'Активный',
        'projects.completed': 'Завершенный',
        'projects.draft': 'Черновик',
        'projects.cancelled': 'Отмененный',
        'projects.participantsCount': 'участников',
        'projects.votesCount': 'голосов',
        'projects.applicationsCount': 'заявок',
        'projects.endDate': 'Завершается',
        'projects.startDate': 'Начинается'
      },
      'kz': {
        'projects.title': 'Жобалар',
        'projects.description': 'Дауыс беруге қатысып, жобаларға өтінім беріңіз',
        'projects.backToHome': 'Басты бетке',
        'projects.availableProjects': 'Қолжетімді жобалар',
        'projects.noProjects': 'Жобалар табылмады',
        'projects.loading': 'Жүктелуде...',
        'projects.loadMore': 'Көбірек жүктеу',
        'projects.fetchError': 'Жобаларды жүктеу кезінде қате',
        'projects.searchPlaceholder': 'Жобаларды іздеу...',
        'projects.moreDetails': 'Толығырақ →',
        'projects.voting': 'Дауыс беру',
        'projects.application': 'Өтінімдерді қабылдау',
        'projects.active': 'Белсенді',
        'projects.completed': 'Аяқталған',
        'projects.draft': 'Жоба',
        'projects.cancelled': 'Болдырылған',
        'projects.participantsCount': 'қатысушы',
        'projects.votesCount': 'дауыс',
        'projects.applicationsCount': 'өтінім',
        'projects.endDate': 'Аяқталады',
        'projects.startDate': 'Басталады'
      }
    };

    return translations[currentLang]?.[key] || translations['ru']?.[key] || key;
  };

  return (
    <Layout>
      <Head>
        <title>{getTranslation('projects.title')} | Экспертная платформа</title>
        <meta name="description" content={getTranslation('projects.description')} />
      </Head>

      <div className="min-h-screen bg-gray-50">


        <ProjectsList
          getTranslation={getTranslation}
          currentLang={currentLang}
        />
      </div>
    </Layout>
  );
}