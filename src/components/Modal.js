// components/Modal.js

import React from 'react';

const Modal = ({ show, onClose, title, message }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white animate-fade-in">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c.552 0 1.055-.276 1.34-1.025l6.928-12.002C23.99 7.425 23.497 7 23 7H1c-.497 0-.99.425-1.282.973l6.928 12.002c.285.749.788 1.025 1.34 1.025z"></path>
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">
            {title}
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">
              {message}
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-yellow-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;