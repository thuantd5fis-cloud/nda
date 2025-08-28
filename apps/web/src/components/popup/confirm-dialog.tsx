'use client';

import React from 'react';
import { ConfirmConfig } from '@/types/popup.types';
import { AlertTriangleIcon, AlertCircleIcon, InfoCircleIcon, CheckCircleIcon } from '@/components/icons';

interface ConfirmDialogProps {
  config: ConfirmConfig;
  onClose: () => void;
}

const getVariantStyles = (variant: ConfirmConfig['variant']) => {
  switch (variant) {
    case 'danger':
      return {
        iconColor: 'text-red-600',
        confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
        icon: AlertTriangleIcon,
      };
    case 'warning':
      return {
        iconColor: 'text-yellow-600',
        confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
        icon: AlertTriangleIcon,
      };
    case 'info':
      return {
        iconColor: 'text-blue-600',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
        icon: InfoCircleIcon,
      };
    default:
      return {
        iconColor: 'text-gray-600',
        confirmButton: 'bg-primary hover:bg-primary-dark focus:ring-primary',
        cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
        icon: AlertCircleIcon,
      };
  }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ config, onClose }) => {
  const { iconColor, confirmButton, cancelButton, icon: IconComponent } = getVariantStyles(config.variant);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      config.onCancel?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      config.onCancel?.();
    } else if (e.key === 'Enter') {
      config.onConfirm?.();
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
        className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-200 scale-100 opacity-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
      >
        {/* Header */}
        <div className="flex items-start p-6 pb-4">
          <div className={`flex-shrink-0 ${iconColor} mr-4`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1">
            {config.title && (
              <h3 id="confirm-title" className="text-lg font-semibold text-gray-900 mb-2">
                {config.title}
              </h3>
            )}
            <p id="confirm-description" className="text-sm text-gray-600 leading-relaxed">
              {config.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6">
          <button
            type="button"
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButton}`}
            onClick={config.onConfirm}
            autoFocus
          >
            {config.confirmText}
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${cancelButton}`}
            onClick={config.onCancel}
          >
            {config.cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
