'use client';

import { usePopup } from '@/contexts/popup-context';
import { ConfirmConfig, AlertConfig } from '@/types/popup.types';

export const useConfirm = () => {
  const { showConfirm, showAlert, showSuccess, showError, showWarning, showInfo } = usePopup();

  // Confirm with boolean result
  const confirm = (
    message: string,
    options?: Partial<Omit<ConfirmConfig, 'id' | 'type' | 'message'>>
  ): Promise<boolean> => {
    return showConfirm({
      message,
      title: 'Xác nhận',
      variant: 'default',
      confirmText: 'Xác nhận',
      cancelText: 'Hủy',
      ...options,
    });
  };

  // Danger confirm (for delete actions)
  const confirmDelete = (
    message: string = 'Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.',
    options?: Partial<Omit<ConfirmConfig, 'id' | 'type' | 'message' | 'variant'>>
  ): Promise<boolean> => {
    return showConfirm({
      message,
      title: 'Xác nhận xóa',
      variant: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      ...options,
    });
  };

  // Warning confirm
  const confirmWarning = (
    message: string,
    options?: Partial<Omit<ConfirmConfig, 'id' | 'type' | 'message' | 'variant'>>
  ): Promise<boolean> => {
    return showConfirm({
      message,
      title: 'Cảnh báo',
      variant: 'warning',
      confirmText: 'Tiếp tục',
      cancelText: 'Hủy',
      ...options,
    });
  };

  // Alert (just show info)
  const alert = (
    message: string,
    options?: Partial<Omit<AlertConfig, 'id' | 'type' | 'message'>>
  ): Promise<void> => {
    return showAlert({
      message,
      title: 'Thông báo',
      variant: 'info',
      okText: 'OK',
      ...options,
    });
  };

  // Success alert
  const alertSuccess = (
    message: string,
    options?: Partial<Omit<AlertConfig, 'id' | 'type' | 'message' | 'variant'>>
  ): Promise<void> => {
    return showAlert({
      message,
      title: 'Thành công',
      variant: 'success',
      okText: 'OK',
      ...options,
    });
  };

  // Error alert
  const alertError = (
    message: string,
    options?: Partial<Omit<AlertConfig, 'id' | 'type' | 'message' | 'variant'>>
  ): Promise<void> => {
    return showAlert({
      message,
      title: 'Lỗi',
      variant: 'danger',
      okText: 'OK',
      ...options,
    });
  };

  // Toast notifications (non-blocking)
  const toast = {
    success: (message: string, title?: string) => showSuccess(message, title),
    error: (message: string, title?: string) => showError(message, title),
    warning: (message: string, title?: string) => showWarning(message, title),
    info: (message: string, title?: string) => showInfo(message, title),
  };

  return {
    confirm,
    confirmDelete,
    confirmWarning,
    alert,
    alertSuccess,
    alertError,
    toast,
  };
};
