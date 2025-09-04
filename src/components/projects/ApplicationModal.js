import { useState } from 'react';
import { X, FileText, Upload, Check, User, Mail, Phone } from 'lucide-react';
import { PROJECTS_API } from '../../utils/apiConfig';

export default function ApplicationModal({ projectId, projectTitle, onClose, getTranslation }) {
  const [formData, setFormData] = useState({
    phone_number: '',
    applicant_name: '',
    email: '',
    description: ''
  });
  const [document, setDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const safeGetTranslation = (key) => {
    if (typeof getTranslation === 'function') {
      return getTranslation(key);
    }

    const translations = {
      'application.title': 'Подача заявки на проект',
      'application.projectTitle': 'Проект',
      'application.phoneNumber': 'Номер телефона',
      'application.phoneRequired': 'Обязательное поле',
      'application.applicantName': 'ФИО',
      'application.email': 'Email',
      'application.description': 'Описание заявки',
      'application.descriptionRequired': 'Обязательное поле (минимум 10 символов)',
      'application.document': 'Документ (необязательно)',
      'application.documentHint': 'PDF, Word, изображения до 10MB',
      'application.chooseFile': 'Выбрать файл',
      'application.cancel': 'Отмена',
      'application.submit': 'Подать заявку',
      'application.submitting': 'Отправка...',
      'application.success': 'Заявка отправлена!',
      'application.thankYou': 'Ваша заявка успешно отправлена. Мы рассмотрим её и свяжемся с вами.',
      'application.close': 'Закрыть',
      'application.fillRequired': 'Заполните все обязательные поля',
      'application.invalidPhone': 'Неверный формат номера телефона',
      'application.descriptionTooShort': 'Описание должно содержать минимум 10 символов',
      'application.fileTooLarge': 'Файл слишком большой (максимум 10MB)',
      'application.invalidFileType': 'Неподдерживаемый тип файла'
    };
    return translations[key] || key;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Проверка размера файла (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(safeGetTranslation('application.fileTooLarge'));
      return;
    }

    // Проверка типа файла
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(safeGetTranslation('application.invalidFileType'));
      return;
    }

    setDocument(file);
    setError('');
  };

  const validateForm = () => {
    if (!formData.phone_number.trim()) {
      setError(safeGetTranslation('application.fillRequired'));
      return false;
    }

    // Простая валидация телефона (казахстанские номера)
    const phoneRegex = /^(\+7|8)\d{10}$/;
    if (!phoneRegex.test(formData.phone_number.replace(/\s/g, ''))) {
      setError(safeGetTranslation('application.invalidPhone'));
      return false;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError(safeGetTranslation('application.descriptionTooShort'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('project_id', projectId);
      submitData.append('phone_number', formData.phone_number);
      submitData.append('description', formData.description);

      if (formData.applicant_name) {
        submitData.append('applicant_name', formData.applicant_name);
      }

      if (formData.email) {
        submitData.append('email', formData.email);
      }

      if (document) {
        submitData.append('document', document);
      }

      const response = await fetch(`${PROJECTS_API.BASE}/${projectId}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Если требуется авторизация
        },
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Ошибка при отправке заявки');
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        {/* Стили для шрифтов */}
        <style jsx global>{`
          .tilda-font {
            font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        `}</style>

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 tilda-font">
                {safeGetTranslation('application.success')}
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed tilda-font">
                {safeGetTranslation('application.thankYou')}
              </p>

              <button
                onClick={onClose}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 tilda-font"
              >
                {safeGetTranslation('application.close')}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Стили для шрифтов */}
      <style jsx global>{`
        .tilda-font {
          font-family: 'TildaSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 tilda-font">
              {safeGetTranslation('application.title')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          {/* Название проекта */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600 mb-1 tilda-font">{safeGetTranslation('application.projectTitle')}:</p>
            <p className="font-semibold text-gray-900 tilda-font">{projectTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Номер телефона */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-800 mb-2 tilda-font">
                {safeGetTranslation('application.phoneNumber')} *
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+7 (XXX) XXX-XX-XX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font"
                  required
                />
              </div>
            </div>

            {/* ФИО */}
            <div>
              <label htmlFor="applicant_name" className="block text-sm font-semibold text-gray-800 mb-2 tilda-font">
                {safeGetTranslation('application.applicantName')}
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="applicant_name"
                  name="applicant_name"
                  value={formData.applicant_name}
                  onChange={handleInputChange}
                  placeholder="Ваше полное имя"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2 tilda-font">
                {safeGetTranslation('application.email')}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font"
                />
              </div>
            </div>

            {/* Описание заявки */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2 tilda-font">
                {safeGetTranslation('application.description')} *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Опишите, почему вы хотите участвовать в этом проекте..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tilda-font resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1 tilda-font">
                {safeGetTranslation('application.descriptionRequired')}
              </p>
            </div>

            {/* Загрузка документа */}
            <div>
              <label htmlFor="document" className="block text-sm font-semibold text-gray-800 mb-2 tilda-font">
                {safeGetTranslation('application.document')}
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="document"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('document').click()}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-gray-50 transition-colors duration-300"
                >
                  <Upload size={18} className="mr-3 text-gray-400" />
                  <span className="text-gray-600 tilda-font">
                    {document ? document.name : safeGetTranslation('application.chooseFile')}
                  </span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 tilda-font">
                {safeGetTranslation('application.documentHint')}
              </p>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-1 tilda-font">Ошибка:</p>
                <p className="text-sm text-red-700 tilda-font">{error}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors duration-300 disabled:opacity-50 tilda-font"
              >
                {safeGetTranslation('application.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-300 disabled:opacity-50 flex items-center justify-center tilda-font"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    {safeGetTranslation('application.submitting')}
                  </>
                ) : (
                  <>
                    <FileText size={18} className="mr-2" />
                    {safeGetTranslation('application.submit')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}