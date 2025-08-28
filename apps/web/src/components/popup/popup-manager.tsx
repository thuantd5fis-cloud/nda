'use client';

import React from 'react';
import { usePopup } from '@/contexts/popup-context';
import { ConfirmDialog } from './confirm-dialog';
import { AlertDialog } from './alert-dialog';
import { Toast } from './toast';

export const PopupManager: React.FC = () => {
  const { popups, removePopup } = usePopup();

  // Separate popups by type for better rendering
  const dialogs = popups.filter(popup => popup.type === 'confirm' || popup.type === 'alert');
  const toasts = popups.filter(popup => popup.type === 'toast');

  return (
    <>
      {/* Dialogs (confirm & alert) - Only show the latest one */}
      {dialogs.length > 0 && (() => {
        const latestDialog = dialogs[dialogs.length - 1];
        
        if (latestDialog.type === 'confirm') {
          return (
            <ConfirmDialog
              key={latestDialog.id}
              config={latestDialog}
              onClose={() => removePopup(latestDialog.id)}
            />
          );
        }
        
        if (latestDialog.type === 'alert') {
          return (
            <AlertDialog
              key={latestDialog.id}
              config={latestDialog}
              onClose={() => removePopup(latestDialog.id)}
            />
          );
        }
        
        return null;
      })()}

      {/* Toasts - Show all active toasts */}
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            zIndex: 9999 + index,
            transform: `translateY(${index * 80}px)`,
          }}
        >
          <Toast
            config={toast}
            onClose={() => removePopup(toast.id)}
          />
        </div>
      ))}
    </>
  );
};
