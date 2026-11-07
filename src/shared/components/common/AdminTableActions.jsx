import { Check, Eye, Pencil, Power, RotateCcw, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_ICONS = {
  detail: Eye,
  edit: Power,
  delete: Trash2,
  approve: Check,
  submit: Send,
  warning: RotateCcw,
  restore: RotateCcw,
  neutral: Pencil,
};

export function AdminActionGroup({ children, className = '' }) {
  return <div className={`admin-row-actions ${className}`.trim()}>{children}</div>;
}

export function AdminActionButton({ tone = 'neutral', icon: Icon = DEFAULT_ICONS[tone], iconOnly = false,
  className = '', children, type = 'button', ...props }) {
  return <button
    type={type}
    className={`admin-row-action admin-row-action--${tone}${iconOnly ? ' admin-row-action--icon' : ''} ${className}`.trim()}
    {...props}
  >
    {Icon && <Icon size={13} strokeWidth={2.2} aria-hidden="true" />}
    {!iconOnly && <span>{children}</span>}
  </button>;
}

export function AdminActionLink({ tone = 'detail', icon: Icon = DEFAULT_ICONS[tone], iconOnly = false,
  className = '', children, ...props }) {
  return <Link
    className={`admin-row-action admin-row-action--${tone}${iconOnly ? ' admin-row-action--icon' : ''} ${className}`.trim()}
    {...props}
  >
    {Icon && <Icon size={13} strokeWidth={2.2} aria-hidden="true" />}
    {!iconOnly && <span>{children}</span>}
  </Link>;
}
