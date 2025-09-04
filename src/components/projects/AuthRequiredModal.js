import { useRouter } from 'next/router';
import { X, Lock, LogIn } from 'lucide-react';

export default function AuthRequiredModal({ onClose, lang = 'ru' }) {
  const router = useRouter();

  const getTranslation = (key) => {
    const translations = {
      'ru': {
        'auth.required.title': 'Требуется авторизация',
        'auth.required.message': 'Для голосования необходимо войти в систему',
        'auth.required.login': 'Авторизация',
        'auth.required.close': 'Закрыть'
      },
      'kz': {
        'auth.required.title': 'Авторизация қажет',
        'auth.required.message': 'Дауыс беру үшін жүйеге кіру қажет',
        'auth.required.login': 'Авторизация',
        'auth.required.close': 'Жабу'
      },
      'en': {
        'auth.required.title': 'Authorization Required',
        'auth.required.message': 'You need to log in to vote',
        'auth.required.login': 'Login',
        'auth.required.close': 'Close'
      }
    };

    return translations[lang]?.[key] || translations['ru']?.[key] || key;
  };

  const handleLogin = () => {
    router.push(`http://localhost:3000/${lang}/login`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <Lock size={20} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 tilda-font">
                {getTranslation('auth.required.title')}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-600 tilda-font text-center mb-6">
              {getTranslation('auth.required.message')}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                {getTranslation('auth.required.login')}
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 tilda-font"
              >
                {getTranslation('auth.required.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}