import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={5000}
      gap={12}
      toastOptions={{
        className: 'hola-toast',
        actionButtonStyle: {
          background: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
          color: '#FFFFFF',
          borderRadius: '9px',
          fontWeight: '600',
          fontSize: '12.5px',
          padding: '6px 14px',
          border: 'none',
          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.28)',
        },
        cancelButtonStyle: {
          background: '#F8FAFC',
          color: '#64748B',
          borderRadius: '9px',
          border: '1px solid #E2E8F0',
          fontWeight: '600',
          fontSize: '12.5px',
          padding: '6px 12px',
        },
      }}
    />
  );
}
