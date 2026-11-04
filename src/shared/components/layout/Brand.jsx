import { bilingualLabel } from '@/shared/components/common/BilingualText';
import { Link } from 'react-router-dom';

export function Brand({ compact = false, collapsed = false, className = '', to = '/' }) {
  return (
    <Link
      to={to}
      className={`site-brand${compact ? ' site-brand--compact' : ''}${collapsed ? ' site-brand--collapsed' : ''}${className ? ` ${className}` : ''}`}
      aria-label={bilingualLabel("HolaVietnamese - Trang chủ", "HolaVietnamese - Home")}
    >
      <img
        className="site-brand__logo"
        src="/design/hola-vietnamese-logo.png"
        alt="Hola Vietnamese"
      />
      <img
        className="site-brand__icon"
        src="/design/hola-vietnamese-icon.png"
        alt="Hola Vietnamese"
      />
    </Link>
  );
}
