export type PopupType = 'confirm' | 'alert' | 'toast';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface BasePopupConfig {
  id: string;
  type: PopupType;
  title?: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

export interface ConfirmConfig extends BasePopupConfig {
  type: 'confirm';
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'default';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface AlertConfig extends BasePopupConfig {
  type: 'alert';
  okText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onOk?: () => void;
}

export interface ToastConfig extends BasePopupConfig {
  type: 'toast';
  toastType: ToastType;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  autoClose?: boolean;
  duration?: number;
}

export type PopupConfig = ConfirmConfig | AlertConfig | ToastConfig;

export interface PopupContextType {
  popups: PopupConfig[];
  showConfirm: (config: Omit<ConfirmConfig, 'id' | 'type'>) => Promise<boolean>;
  showAlert: (config: Omit<AlertConfig, 'id' | 'type'>) => Promise<void>;
  showToast: (config: Omit<ToastConfig, 'id' | 'type'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removePopup: (id: string) => void;
  clearAll: () => void;
}
