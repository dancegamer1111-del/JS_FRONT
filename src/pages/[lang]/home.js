import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Briefcase,
  Award,
  Calendar,
  BookOpen,
  Users,
  Vote,
  ChevronRight,
  Star,
  TrendingUp,
  Heart,
  Globe,
  X,
  AlertCircle
} from 'react-feather';

// Импортируем переводы из локалей
import { translations } from '../../locales/translations';

const Home = () => {
  const router = useRouter();
  const { lang } = router.query;

  // Инициализируем язык
  const [currentLang, setCurrentLang] = useState(
    typeof lang === 'string' && ['kz', 'ru', 'en'].includes(lang)
      ? lang
      : 'kz'
  );

  // Инициализируем переводы
  const [t, setT] = useState(translations[currentLang] || {});

  // Состояние модалки
  const [showDevelopmentModal, setShowDevelopmentModal] = useState(false);

  useEffect(() => {
    if (typeof lang === 'string' && lang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(lang) ? lang : 'kz';
      setCurrentLang(validLang);
      setT(translations[validLang] || {});
    }
  }, [lang, currentLang]);

  const langPrefix = `/${currentLang}`;

  // Контент на казахском и русском
  const content = {
    kz: {
      title: "Болашағыңызды бірге құрайық",
      subtitle: "SARYARQA JASTARY",
      description: "Жастарға арналған платформа - жұмыс табу, білім алу, жобаларға дауыс беру және дамыту мүмкіндіктері",
      heroButtons: {
        courses: "Курстарды бастау",
        projects: "Жобаларды көру"
      },
      services: {
        title: "Мүмкіндіктеріміз",
        subtitle: "Жастардың дамуы үшін барлық қажетті құралдар бір жерде",
        cards: [
          {
            title: "Жұмыс табу",
            description: "Жастарға арналған вакансиялар мен мансаптық мүмкіндіктер",
            color: "bg-gray-50 hover:bg-purple-50",
            buttonColor: "text-purple-600 hover:bg-purple-600 hover:text-white"
          },
          {
            title: "Іс-шаралар",
            description: "Қызықты іс-шаралар, семинарлар және мастер-класстар",
            color: "bg-gray-50 hover:bg-blue-50",
            buttonColor: "text-blue-600 hover:bg-blue-600 hover:text-white"
          },
          {
            title: "Жобаларға дауыс",
            description: "Ең жақсы жас жобаларына дауыс беріп қолдау көрсетіңіз",
            color: "bg-gray-50 hover:bg-green-50",
            buttonColor: "text-green-600 hover:bg-green-600 hover:text-white"
          },
          {
            title: "Оқу және сертификация",
            description: "Онлайн курстар мен кәсіби сертификаттар алу",
            color: "bg-gray-50 hover:bg-orange-50",
            buttonColor: "text-orange-600 hover:bg-orange-600 hover:text-white"
          }
        ]
      },
      about: {
        title: "Біздің миссия",
        subtitle: "SARYARQA JASTARY туралы",
        description1: "SARYARQA JASTARY - бұл жастардың дамуына бағытталған инновациялық платформа. Біз әр жас адамның өз әлеуетін ашуына көмектесеміз.",
        description2: "Платформамыз жұмыс табу, білім алу, жобаларға қатысу және кәсіби дамуға қажетті барлық мүмкіндіктерді ұсынады.",
        link: "Біз туралы толығырақ"
      },
      cta: {
        title: "Бастауға дайынсыз ба?",
        description: "Біздің қоғамдастыққа қосылып, дамуға және табысқа жету үшін жаңа мүмкіндіктерді ашыңыз.",
        buttons: {
          register: "Тіркелу",
          contact: "Байланысу"
        }
      },
      modal: {
        title: "Функционал әзірленуде",
        description: "Бұл мүмкіндік қазіргі уақытта әзірленуде. Жақын арада қолжетімді болады!",
        button: "Түсіндім"
      }
    },
    ru: {
      title: "Создаем будущее вместе",
      subtitle: "SARYARQA JASTARY",
      description: "Платформа для молодежи - поиск работы, образование, голосование за проекты и возможности развития",
      heroButtons: {
        courses: "Начать обучение",
        projects: "Посмотреть проекты"
      },
      services: {
        title: "Наши возможности",
        subtitle: "Все необходимые инструменты для развития молодежи в одном месте",
        cards: [
          {
            title: "Поиск работы",
            description: "Вакансии и карьерные возможности специально для молодежи",
            color: "bg-gray-50 hover:bg-purple-50",
            buttonColor: "text-purple-600 hover:bg-purple-600 hover:text-white"
          },
          {
            title: "Мероприятия",
            description: "Интересные события, семинары и мастер-классы",
            color: "bg-gray-50 hover:bg-blue-50",
            buttonColor: "text-blue-600 hover:bg-blue-600 hover:text-white"
          },
          {
            title: "Голосование за проекты",
            description: "Поддержите лучшие молодежные проекты своим голосом",
            color: "bg-gray-50 hover:bg-green-50",
            buttonColor: "text-green-600 hover:bg-green-600 hover:text-white"
          },
          {
            title: "Обучение и сертификация",
            description: "Онлайн-курсы и получение профессиональных сертификатов",
            color: "bg-gray-50 hover:bg-orange-50",
            buttonColor: "text-orange-600 hover:bg-orange-600 hover:text-white"
          }
        ]
      },
      about: {
        title: "Наша миссия",
        subtitle: "О SARYARQA JASTARY",
        description1: "SARYARQA JASTARY - это инновационная платформа для развития молодежи. Мы помогаем каждому молодому человеку раскрыть свой потенциал.",
        description2: "Наша платформа предоставляет все возможности для поиска работы, получения образования, участия в проектах и профессионального развития.",
        link: "Узнать больше о нас"
      },
      cta: {
        title: "Готовы начать?",
        description: "Присоединяйтесь к нашему сообществу и откройте новые возможности для развития и достижения успеха.",
        buttons: {
          register: "Зарегистрироваться",
          contact: "Связаться с нами"
        }
      },
      modal: {
        title: "Функционал в разработке",
        description: "Данная возможность находится в разработке. Скоро станет доступна!",
        button: "Понятно"
      }
    }
  };

  const currentContent = content[currentLang] || content.ru;

  // Функция для показа модалки
  const showModal = (e) => {
    e.preventDefault();
    setShowDevelopmentModal(true);
  };

  // Карточки услуг с иконками
  const serviceCards = [
    {
      title: currentContent.services.cards[0].title,
      description: currentContent.services.cards[0].description,
      icon: <Briefcase size={24} className="text-purple-600" />,
      onClick: showModal, // Показываем модалку
      color: currentContent.services.cards[0].color,
      buttonColor: currentContent.services.cards[0].buttonColor
    },
    {
      title: currentContent.services.cards[1].title,
      description: currentContent.services.cards[1].description,
      icon: <Calendar size={24} className="text-blue-600" />,
      onClick: showModal, // Показываем модалку
      color: currentContent.services.cards[1].color,
      buttonColor: currentContent.services.cards[1].buttonColor
    },
    {
      title: currentContent.services.cards[2].title,
      description: currentContent.services.cards[2].description,
      icon: <Award size={24} className="text-green-600" />,
      link: `${langPrefix}/projects`, // Рабочая ссылка
      color: currentContent.services.cards[2].color,
      buttonColor: currentContent.services.cards[2].buttonColor
    },
    {
      title: currentContent.services.cards[3].title,
      description: currentContent.services.cards[3].description,
      icon: <BookOpen size={24} className="text-orange-600" />,
      onClick: showModal, // Показываем модалку
      color: currentContent.services.cards[3].color,
      buttonColor: currentContent.services.cards[3].buttonColor
    }
  ];

  // Статистика
  const stats = [
    {
      number: "500+",
      label: currentLang === 'kz' ? "Белсенді мүше" : "Активных участников",
      icon: <Users size={16} className="text-purple-600" />
    },
    {
      number: "120+",
      label: currentLang === 'kz' ? "Жаңа вакансия" : "Новых вакансий",
      icon: <Briefcase size={16} className="text-blue-600" />
    },
    {
      number: "50+",
      label: currentLang === 'kz' ? "Аяқталған жоба" : "Завершенных проектов",
      icon: <Star size={16} className="text-green-600" />
    },
    {
      number: "98%",
      label: currentLang === 'kz' ? "Қанағаттандыру" : "Удовлетворенности",
      icon: <Heart size={16} className="text-pink-600" />
    }
  ];

  return (
    <>
      <Head>
        <title>
          {currentLang === 'kz'
            ? 'SARYARQA JASTARY - Жастар үшін мүмкіндіктер'
            : 'SARYARQA JASTARY - Возможности для молодежи'
          }
        </title>
        <meta
          name="description"
          content={currentLang === 'kz'
            ? 'Жастарға арналған платформа. Жұмыс, білім, жобалар және дамыту мүмкіндіктері.'
            : 'Платформа для молодежи. Работа, образование, проекты и возможности развития.'
          }
        />
      </Head>

      {/* Стили для шрифтов */}
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

        .card-hover {
          transition: all 0.2s ease;
        }

        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      {/* Компактный главный баннер */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
              ✨ {currentLang === 'kz' ? 'Жаңа мүмкіндіктер' : 'Новые возможности'}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3 tilda-font">
              {currentContent.title}
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-blue-200 mb-4 tilda-font">
              {currentContent.subtitle}
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto tilda-font">
              {currentContent.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={showModal}
                className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
              >
                {currentContent.heroButtons.courses}
              </button>
              <Link href={`${langPrefix}/projects`} legacyBehavior>
                <a className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 tilda-font">
                  {currentContent.heroButtons.projects}
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Компактная статистика */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1 tilda-font">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm tilda-font">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Яркая секция услуг */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text tilda-font">
              {currentContent.services.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto tilda-font">
              {currentContent.services.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCards.map((card, index) => (
              <div
                key={index}
                className={`rounded-3xl p-8 transition-all duration-300 card-hover border border-white/50 ${card.color} group cursor-pointer shadow-lg hover:shadow-2xl`}
                onClick={card.onClick}
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    {card.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 tilda-font">
                  {card.title}
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed tilda-font">
                  {card.description}
                </p>
                {card.link ? (
                  <Link href={card.link} legacyBehavior>
                    <a className={`inline-flex items-center font-semibold rounded-xl px-6 py-3 transition-all duration-300 border-2 border-current ${card.buttonColor} tilda-font group-hover:shadow-lg`}>
                      {currentLang === 'kz' ? 'Толығырақ' : 'Подробнее'}
                      <ChevronRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </a>
                  </Link>
                ) : (
                  <button className={`inline-flex items-center font-semibold rounded-xl px-6 py-3 transition-all duration-300 border-2 border-current ${card.buttonColor} tilda-font group-hover:shadow-lg`}>
                    {currentLang === 'kz' ? 'Толығырақ' : 'Подробнее'}
                    <ChevronRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Компактная секция о нас */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-purple-600 font-semibold text-lg tilda-font">
              {currentContent.about.subtitle}
            </span>
            <h2 className="text-3xl font-bold mt-3 mb-6 text-gray-800 tilda-font">
              {currentContent.about.title}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed tilda-font">
              <p className="text-lg">
                {currentContent.about.description1}
              </p>
              <p className="text-lg">
                {currentContent.about.description2}
              </p>
            </div>
            <button
              onClick={showModal}
              className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 text-lg transition-colors duration-300 tilda-font group mt-6"
            >
              {currentContent.about.link}
              <ChevronRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Блок призыва к действию */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 tilda-font">
            {currentContent.cta.title}
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8 tilda-font">
            {currentContent.cta.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`${langPrefix}/login`} legacyBehavior>
              <a className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font">
                {currentContent.cta.buttons.register}
              </a>
            </Link>
            <button
              onClick={showModal}
              className="px-8 py-3 bg-transparent border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 tilda-font"
            >
              {currentContent.cta.buttons.contact}
            </button>
          </div>
        </div>
      </section>

      {/* Модалка "Функционал в разработке" */}
      {showDevelopmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex">
                <AlertCircle size={24} className="text-orange-500 mr-3 mt-0.5" />
                <h3 className="text-lg font-semibold text-gray-900 tilda-font">
                  {currentContent.modal.title}
                </h3>
              </div>
              <button
                onClick={() => setShowDevelopmentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6 tilda-font">
              {currentContent.modal.description}
            </p>
            <button
              onClick={() => setShowDevelopmentModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors tilda-font"
            >
              {currentContent.modal.button}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;