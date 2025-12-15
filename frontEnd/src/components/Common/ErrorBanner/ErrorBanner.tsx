import React from 'react';

type ErrorBannerProps = {
  message: string;
  onClose?: () => void;
};

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start justify-between">
      <div className="flex items-start gap-3">
        <span className="text-red-600 text-xl">⚠️</span>
        <span className="text-red-800">{message}</span>
      </div>
      {onClose && (
        <button
          className="text-red-400 hover:text-red-600 text-xl leading-none ml-4"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
};
