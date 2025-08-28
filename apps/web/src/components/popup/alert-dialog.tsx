'use client';

import React from 'react';
import { AlertConfig } from '@/types/popup.types';
import { AlertTriangleIcon, AlertCircleIcon, InfoCircleIcon, CheckCircleIcon } from '@/components/icons';

interface AlertDialogProps {
  config: AlertConfig;
  onClose: () => void;
}

const getVariantStyles = (variant: AlertConfig['variant']) => {
  switch (variant) {
    case 'danger':
      return {
        iconColor: 'text-red-600',
        okButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        borderColor: 'border-red-200',
        icon: AlertTriangleIcon,
      };
    case 'warning':
      return {
        iconColor: 'text-yellow-600',
        okButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        borderColor: 'border-yellow-200',
        icon: AlertTriangleIcon,
      };
    case 'success':
      return {
        iconColor: 'text-green-600',
        okButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        borderColor: 'border-green-200',
        icon: CheckCircleIcon,
      };
    case 'info':
    default:
      return {
        iconColor: 'text-blue-600',
        okButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        borderColor: 'border-blue-200',
        icon: InfoCircleIcon,
      };
  }
};

export const AlertDialog: React.FC<AlertDialogProps> = ({ config, onClose }) => {
  const { iconColor, okButton, borderColor, icon: IconComponent } = getVariantStyles(config.variant);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      config.onOk?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      config.onOk?.();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-200 scale-100 opacity-100 border-2 ${borderColor}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-description"
      >
        {/* Header */}
        <div className="flex items-start p-6 pb-4">
          <div className={`flex-shrink-0 ${iconColor} mr-4`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1">
            {config.title && (
              <h3 id="alert-title" className="text-lg font-semibold text-gray-900 mb-2">
                {config.title}
              </h3>
            )}
            <p id="alert-description" className="text-sm text-gray-600 leading-relaxed">
              {config.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <button
            type="button"
            className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${okButton}`}
            onClick={config.onOk}
            autoFocus
          >
            {config.okText}
          </button>
        </div>
      </div>
    </div>
  );
};
