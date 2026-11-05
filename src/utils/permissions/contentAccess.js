export const CONTENT_PERMISSIONS = Object.freeze({
  VOCABULARY_READ: 'VOCABULARY_READ',
  VOCABULARY_WRITE: 'VOCABULARY_WRITE',
  VOCABULARY_IMPORT: 'VOCABULARY_IMPORT',
  VOCABULARY_REVIEW: 'VOCABULARY_REVIEW',
  VOCABULARY_PUBLISH: 'VOCABULARY_PUBLISH',
  EXPLORE_READ: 'EXPLORE_READ',
  EXPLORE_WRITE: 'EXPLORE_WRITE',
  EXPLORE_LINK_WRITE: 'EXPLORE_LINK_WRITE',
  EXPLORE_REVIEW: 'EXPLORE_REVIEW',
  EXPLORE_PUBLISH: 'EXPLORE_PUBLISH',
});

const values = (items) => (Array.isArray(items) ? items : items ? [items] : [])
  .map((item) => typeof item === 'string' ? item : (item.name || item.authority))
  .filter(Boolean);

export const userPermissions = (user) => values(user?.permissions);
export const userRole = (user) => {
  const role = typeof user?.role === 'string' ? user.role : (user?.role?.name || user?.role?.authority || '');
  return role.replace(/^ROLE_/, '');
};
export const hasRole = (user, role) => userRole(user) === role.replace(/^ROLE_/, '');
export const hasPermission = (user, permission) => userPermissions(user).includes(permission);
export const isContentManager = (user) => hasRole(user, 'CONTENT');
export const isAdministrator = (user) => hasRole(user, 'ADMIN');

const hasAny = (user, permissions) => permissions.some((permission) => hasPermission(user, permission));

export const canReadVocabulary = (user) => isContentManager(user) || isAdministrator(user) || hasAny(user, [
  CONTENT_PERMISSIONS.VOCABULARY_READ,
  CONTENT_PERMISSIONS.VOCABULARY_WRITE,
  CONTENT_PERMISSIONS.VOCABULARY_REVIEW,
  CONTENT_PERMISSIONS.VOCABULARY_PUBLISH,
]);
export const canWriteVocabulary = (user) => isContentManager(user)
  || hasPermission(user, CONTENT_PERMISSIONS.VOCABULARY_WRITE);
export const canImportVocabulary = (user) => isContentManager(user)
  || hasPermission(user, CONTENT_PERMISSIONS.VOCABULARY_IMPORT);
export const canReviewVocabulary = (user) => isAdministrator(user) || hasAny(user, [
  CONTENT_PERMISSIONS.VOCABULARY_REVIEW,
  CONTENT_PERMISSIONS.VOCABULARY_PUBLISH,
]);
export const canPublishVocabulary = canReviewVocabulary;

export const canReadExplore = (user) => isContentManager(user) || isAdministrator(user) || hasAny(user, [
  CONTENT_PERMISSIONS.EXPLORE_READ,
  CONTENT_PERMISSIONS.EXPLORE_WRITE,
  CONTENT_PERMISSIONS.EXPLORE_LINK_WRITE,
  CONTENT_PERMISSIONS.EXPLORE_REVIEW,
  CONTENT_PERMISSIONS.EXPLORE_PUBLISH,
]);
export const canWriteExplore = (user) => isContentManager(user)
  || hasPermission(user, CONTENT_PERMISSIONS.EXPLORE_WRITE);
export const canManageExploreLinks = (user) => isContentManager(user)
  || hasPermission(user, CONTENT_PERMISSIONS.EXPLORE_LINK_WRITE);
export const canReviewExplore = (user) => isAdministrator(user) || hasAny(user, [
  CONTENT_PERMISSIONS.EXPLORE_REVIEW,
  CONTENT_PERMISSIONS.EXPLORE_PUBLISH,
]);
export const canPublishExplore = canReviewExplore;

export const canReadCulture = (user) => isContentManager(user) || isAdministrator(user);
export const canWriteCulture = (user) => isContentManager(user) || isAdministrator(user);
export const canReviewCulture = (user) => isAdministrator(user);
export const canPublishCulture = (user) => isAdministrator(user);
