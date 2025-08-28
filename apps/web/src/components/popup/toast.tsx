'use client';

import React, { useEffect, useState } from 'react';
import { ToastConfig } from '@/types/popup.types';
import { CheckCircleIcon, AlertCircleIcon, AlertTriangleIcon, InfoCircleIcon, CloseIcon } from '@/components/icons';

interface ToastProps {
  config: ToastConfig;
  onClose: () => void;
}

const getToastStyles = (toastType: ToastConfig['toastType']) => {
  switch (toastType) {
    case 'success':
      return {
        bgColor: 'bg-green-50 border-green-200',
        iconColor: 'text-green-600',
        titleColor: 'text-green-800',
        messageColor: 'text-green-700',
        closeColor: 'text-green-500 hover:text-green-600',
        icon: CheckCircleIcon,
      };
    case 'error':
      return {
        bgColor: 'bg-red-50 border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-800',
        messageColor: 'text-red-700',
        closeColor: 'text-red-500 hover:text-red-600',
        icon: AlertCircleIcon,
      };
    case 'warning':
      return {
        bgColor: 'bg-yellow-50 border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-800',
        messageColor: 'text-yellow-700',
        closeColor: 'text-yellow-500 hover:text-yellow-600',
        icon: AlertTriangleIcon,
      };
    case 'info':
    default:
      return {
        bgColor: 'bg-blue-50 border-blue-200',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-800',
        messageColor: 'text-blue-700',
        closeColor: 'text-blue-500 hover:text-blue-600',
        icon: InfoCircleIcon,
      };
  }
};

const getPositionStyles = (position: ToastConfig['position']) => {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    case 'top-right':
    default:
      return 'top-4 right-4';
  }
};

export const Toast: React.FC<ToastProps> = ({ config, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const { bgColor, iconColor, titleColor, messageColor, closeColor, icon: IconComponent } = getToastStyles(config.toastType);
  const positionClasses = getPositionStyles(config.position);

  useEffect(() => {
    // Animation in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (config.autoClose && config.duration) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (config.duration! / 100));
          if (newProgress <= 0) {
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [config.autoClose, config.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for animation
  };

  return (
    <div
      className={`fixed z-[9999] max-w-sm w-full transition-all duration-200 ${positionClasses} ${
        isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
      }`}
    >
      <div className={`${bgColor} border rounded-lg shadow-lg overflow-hidden`}>
        {/* Progress bar */}
        {config.autoClose && (
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-current opacity-20 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${iconColor} mr-3`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              {config.title && (
                <p className={`text-sm font-medium ${titleColor} mb-1`}>
                  {config.title}
                </p>
              )}
              <p className={`text-sm ${messageColor} leading-relaxed`}>
                {config.message}
              </p>
            </div>
            <button
              type="button"
              className={`flex-shrink-0 ml-3 ${closeColor} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded-md p-1`}
              onClick={handleClose}
              aria-label="Đóng thông báo"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
