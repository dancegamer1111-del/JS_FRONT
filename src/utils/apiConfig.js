// Базовый URL API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Пути API для экспертов
export const EXPERTS_API = {
  LIST: `${API_BASE_URL}/api/v2/experts`,
  SEARCH: `${API_BASE_URL}/api/v2/experts/search`,
  DETAIL: (id) => `${API_BASE_URL}/api/v2/experts/${id}`,
  COLLABORATE: (id) => `${API_BASE_URL}/api/v2/experts/${id}/collaborate`,
  CREATE: `${API_BASE_URL}/api/v2/experts/`
};

// Эндпоинты API для вакансий
export const VACANCIES_API = {
  LIST: `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/`,
  SEARCH: `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/search`,
  DETAILS: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/${id}`,
  CREATE: `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/`,
  UPDATE: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/${id}`,
  DELETE: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/${id}`,
  APPLY: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/${id}/apply`,
  // Add new endpoint for applications
  APPLICATIONS: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/${id}/applications`,
  APPLICATION_DETAIL: (vacancyId, applicationId) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/${vacancyId}/applications/${applicationId}`,
  DOWNLOAD_RESUME: (vacancyId, applicationId) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/vacancies/${vacancyId}/applications/${applicationId}/resume`
};


const API_BASE = "http://159.89.232.147:8000";

// Эндпоинты API для мероприятий
export const EVENTS_API = {
  LIST: `${process.env.NEXT_PUBLIC_API_URL}/api/v2/events/`,
  SEARCH: `${process.env.NEXT_PUBLIC_API_URL}/api/v2/events/search`,
  DETAILS: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/events/${id}`,
  CREATE: `${process.env.NEXT_PUBLIC_API_URL}/api/v2/events/`,
  UPDATE: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/events/${id}`,
  DELETE: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/events/${id}`,
  PARTICIPATE: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/events/${id}/participate`,
  PARTICIPANTS: (id) => `${process.env.NEXT_PUBLIC_API_URL}/api/v2/events/${id}/participants`,

};





// Новая конфигурация для проектов
export const PROJECTS_API = {
  BASE: `${API_BASE}/api/v2/projects`,
  LIST: `${API_BASE}/api/v2/projects/`,
  DETAILS: (id) => `${API_BASE}/api/v2/projects/${id}`,
  VOTE: (id) => `${API_BASE}/api/v2/projects/${id}/vote`,
  APPLY: (id) => `${API_BASE}/api/v2/projects/${id}/applications`,
  STATS: (id) => `${API_BASE}/api/v2/projects/${id}/stats`,
  ACTIVE_VOTING: `${API_BASE}/api/v2/projects/active/voting`,
  ACTIVE_APPLICATIONS: `${API_BASE}/api/v2/projects/active/applications`,
  MY_VOTES: `${API_BASE}/api/v2/projects/my-votes`,
  MY_APPLICATIONS: `${API_BASE}/api/v2/projects/my-applications`,
  UPLOAD_PHOTO: (id) => `${API_BASE}/api/v2/projects/${id}/upload-photo`,
  UPLOAD_GALLERY: (id) => `${API_BASE}/api/v2/projects/${id}/upload-gallery`
};



// Функция для добавления параметров запроса
export const appendQueryParams = (url, params) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};