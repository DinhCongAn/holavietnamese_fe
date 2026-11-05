import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { CircleAlert, X } from 'lucide-react';
export function LayoutToast({ message, onClose }) {
  useTextLanguage();
  if (!message) return null;
  return <div className="layout-toast" role="alert" aria-live="polite"><span aria-hidden="true"><CircleAlert size={16}/></span><p><BilingualText>{message}</BilingualText></p><button type="button" onClick={onClose} aria-label={bilingualLabel("Đóng thông báo", "Close notification")}><X size={16}/></button></div>;
}
