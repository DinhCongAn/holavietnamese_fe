import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ResourceState({ resource, children, skeletonRows = 3 }) {
  useTextLanguage();
  const location = useLocation();

  if (resource.loading && !resource.data) {
    return (
      <div className="resource-skeleton" role="status" aria-label={bilingualLabel("Đang tải nội dung", "Loading content")}>
        <div className="skeleton skeleton--title" />
        {Array.from({ length: skeletonRows }, (_, index) => (
          <div className="skeleton skeleton--row" key={index} />
        ))}
      </div>
    );
  }

  if (resource.error && !resource.data) {
    return (
      <div className="state resource-error" role="alert">
        <span className="state-symbol" aria-hidden="true">
          <AlertCircle size={28} />
        </span>
        <h2>
          <BilingualText>{"Không thể tải nội dung"}</BilingualText>
        </h2>
        <p>
          <BilingualText>{resource.error.message}</BilingualText>
        </p>
        {resource.error.status === 401 ? (
          <Link
            className="button"
            to="/login"
            state={{ from: location.pathname + location.search }}
          >
            <BilingualText>{"Đăng nhập"}</BilingualText>
          </Link>
        ) : (
          resource.reload && (
            <button onClick={resource.reload}>
              <RefreshCw size={16} />
              <BilingualText>{"Thử lại"}</BilingualText>
            </button>
          )
        )}
      </div>
    );
  }

  if (!resource.data) return null;
  return children(resource.data);
}
export default ResourceState;
