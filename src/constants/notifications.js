export const NOTIFICATION_TYPES = [
  'SYSTEM', 'WELCOME', 'COURSE', 'LESSON', 'QUIZ',
  'ACHIEVEMENT', 'STREAK', 'CONTENT_REVIEW', 'SECURITY',
];

export const NOTIFICATION_CATEGORIES = [
  { id: 'all', label: 'Tất cả', labelEn: 'All' },
  { id: 'unread', label: 'Chưa đọc', labelEn: 'Unread' },
];

export function formatRelativeTime(value, locale = 'vi') {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (!value || Number.isNaN(elapsed)) return locale === 'vi' ? 'Vừa xong' : 'Just now';
  const formatter = new Intl.RelativeTimeFormat(locale === 'vi' ? 'vi' : 'en', { numeric: 'auto' });
  const units = [
    ['year', 365 * 24 * 60 * 60 * 1000], ['month', 30 * 24 * 60 * 60 * 1000],
    ['week', 7 * 24 * 60 * 60 * 1000], ['day', 24 * 60 * 60 * 1000],
    ['hour', 60 * 60 * 1000], ['minute', 60 * 1000],
  ];
  const [unit, milliseconds] = units.find(([, duration]) => elapsed >= duration) || ['second', 1000];
  return formatter.format(-Math.max(0, Math.floor(elapsed / milliseconds)), unit);
}

export function normalizeNotification(item) {
  if (!item || item.id == null) return null;
  const rawType = String(item.type || 'SYSTEM').toUpperCase();
  const isRead = Boolean(item.isRead ?? item.read);
  const linkUrl = item.linkUrl || null;
  let targetType = item.targetType || null;
  let targetId = item.targetId || null;

  if (linkUrl) {
    const badgeMatch = linkUrl.match(/[?&]badgeId=([^&#]+)/);
    if (badgeMatch) {
      targetType = targetType || 'BADGE';
      targetId = targetId || badgeMatch[1];
    } else {
      const courseMatch = linkUrl.match(/\/courses\/([^/?&#]+)/);
      if (courseMatch) {
        targetType = targetType || 'COURSE';
        targetId = targetId || courseMatch[1];
      } else {
        const lessonMatch = linkUrl.match(/\/lessons\/([^/?&#]+)/);
        if (lessonMatch) {
          targetType = targetType || 'LESSON';
          targetId = targetId || lessonMatch[1];
        }
      }
    }
  }

  if (!targetType && rawType === 'ACHIEVEMENT') {
    targetType = 'BADGE';
  }

  return {
    id: item.id,
    title: item.title || 'Thông báo mới',
    message: item.message || '',
    type: NOTIFICATION_TYPES.includes(rawType) ? rawType : 'SYSTEM',
    linkUrl,
    targetType,
    targetId: targetId ? String(targetId) : null,
    isRead,
    read: isRead,
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

export function unwrapSseNotification(payload) {
  return normalizeNotification(payload?.result ?? payload?.notification ?? payload);
}
