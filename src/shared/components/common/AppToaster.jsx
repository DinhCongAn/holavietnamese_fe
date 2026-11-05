import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      gap={10}
      toastOptions={{
        className: 'hola-toast',
      }}
    />
  );
}
