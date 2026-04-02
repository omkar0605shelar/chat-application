import React from 'react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { X, Info, Bell } from 'lucide-react';

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message, { icon: <Info size={20} className="text-primary" /> }),
  notification: (title: string, message: string) => 
    toast(() => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 font-bold text-sm text-text-charcoal">
          <Bell size={16} className="text-primary" />
          {title}
        </div>
        <p className="text-xs text-text-charcoal/60 line-clamp-2">{message}</p>
      </div>
    )),
};

const Toast: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'glass !rounded-3xl !p-0 !shadow-2xl !border-white/40 !max-w-sm',
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-start gap-3 p-4 w-full">
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-sm font-medium text-text-charcoal">
                {message}
              </div>
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-text-charcoal/40 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default Toast;
