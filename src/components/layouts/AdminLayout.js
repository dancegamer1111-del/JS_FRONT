import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const AdminLayout = ({ children, title = 'Админ-панель курсов' }) => {
  const router = useRouter();

  // Проверка активной ссылки для стилизации
  const isActive = (path) => {
    return router.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Административная панель для управления курсами" />
      </Head>

      {/* Верхняя навигационная панель */}
      <header className="bg-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Управление курсами</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Администратор</span>
            <button
              className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded-md text-sm transition-colors"
              onClick={() => {
                localStorage.removeItem('accessToken');
                router.push('/ru/login');
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Боковое меню */}
        <aside className="w-64 bg-blue-900 text-white">
          <nav className="py-6">
            <ul className="space-y-1">
              <li>
                <Link href="/ru/admin/dashboard"
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive('/ru/admin/dashboard')}`}>
                  Панель управления
                </Link>
              </li>
              <li>
                <Link href="/ru/admin/courses"
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive('/ru/admin/courses')}`}>
                  Все курсы
                </Link>
              </li>
              <li>
                <Link href="/ru/admin/courses/create"
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive('/ru/admin/courses/create')}`}>
                  Создать курс
                </Link>
              </li>
              <li>
                <Link href="/ru/admin/categories"
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive('/ru/admin/categories')}`}>
                  Категории курсов
                </Link>
              </li>
              {/* Новый раздел для управления сертификатами */}
              <li>
                <div className="px-4 py-2 text-blue-300 text-sm font-semibold mt-4">СЕРТИФИКАТЫ</div>
              </li>
              <li>
                <Link href="/ru/admin/certificates"
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive('/ru/admin/certificates')}`}>
                  Все сертификаты
                </Link>
              </li>
              <li>

              </li>
              <li>
                <Link href="/ru/admin/certificates/create"
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive('/ru/admin/certificates/create')}`}>
                  Создать сертификат
                </Link>
              </li>

              <li>
                <div className="px-4 py-2 text-blue-300 text-sm font-semibold mt-4">МОДЕРАЦИЯ</div>
              </li>
              <li>
                <Link href="/ru/admin/moderation"
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive('/ru/admin/moderation')}`}>
                  Модерация курсов
                </Link>
              </li>
              <li>
                <Link href="/ru/admin/statistics"
                  className={`block px-4 py-2 hover:bg-blue-700 transition-colors ${isActive('/ru/admin/statistics')}`}>
                  Статистика
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Основное содержимое */}
        <main className="flex-1 bg-gray-100 p-6">
          {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;