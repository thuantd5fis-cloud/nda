'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { PopupConfig, PopupContextType, ConfirmConfig, AlertConfig, ToastConfig } from '@/types/popup.types';

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

interface PopupProviderProps {
  children: React.ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [popups, setPopups] = useState<PopupConfig[]>([]);

  const generateId = useCallback(() => {
    return `popup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removePopup = useCallback((id: string) => {
    setPopups(prev => prev.filter(popup => popup.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setPopups([]);
  }, []);

  const showConfirm = useCallback((config: Omit<ConfirmConfig, 'id' | 'type'>): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = generateId();
      const confirmConfig: ConfirmConfig = {
        ...config,
        id,
        type: 'confirm',
        confirmText: config.confirmText || 'Xác nhận',
        cancelText: config.cancelText || 'Hủy',
        variant: config.variant || 'default',
        onConfirm: async () => {
          if (config.onConfirm) {
            await config.onConfirm();
          }
          removePopup(id);
          resolve(true);
        },
        onCancel: () => {
          if (config.onCancel) {
            config.onCancel();
          }
          removePopup(id);
          resolve(false);
        },
      };

      setPopups(prev => [...prev, confirmConfig]);
    });
  }, [generateId, removePopup]);

  const showAlert = useCallback((config: Omit<AlertConfig, 'id' | 'type'>): Promise<void> => {
    return new Promise((resolve) => {
      const id = generateId();
      const alertConfig: AlertConfig = {
        ...config,
        id,
        type: 'alert',
        okText: config.okText || 'OK',
        variant: config.variant || 'info',
        onOk: () => {
          if (config.onOk) {
            config.onOk();
          }
          removePopup(id);
          resolve();
        },
      };

      setPopups(prev => [...prev, alertConfig]);
    });
  }, [generateId, removePopup]);

  const showToast = useCallback((config: Omit<ToastConfig, 'id' | 'type'>) => {
    const id = generateId();
    const toastConfig: ToastConfig = {
      ...config,
      id,
      type: 'toast',
      position: config.position || 'top-right',
      autoClose: config.autoClose !== false,
      duration: config.duration || 5000,
    };

    setPopups(prev => [...prev, toastConfig]);

    if (toastConfig.autoClose) {
      setTimeout(() => {
        removePopup(id);
      }, toastConfig.duration);
    }
  }, [generateId, removePopup]);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({
      message,
      title: title || 'Thành công',
      toastType: 'success',
    });
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast({
      message,
      title: title || 'Lỗi',
      toastType: 'error',
    });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast({
      message,
      title: title || 'Cảnh báo',
      toastType: 'warning',
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({
      message,
      title: title || 'Thông tin',
      toastType: 'info',
    });
  }, [showToast]);

  const value: PopupContextType = {
    popups,
    showConfirm,
    showAlert,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removePopup,
    clearAll,
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
    </PopupContext.Provider>
  );
};
