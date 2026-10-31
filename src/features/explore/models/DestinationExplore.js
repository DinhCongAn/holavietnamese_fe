// Resolve linked content from the owning modules' APIs. Explore stores only IDs.
import { cultureService } from '../../culture/api/cultureService.js';

export const exploreCultures = async options =>
  (await cultureService.listArticlesFromApi(options)).map(
    ({ id, title, titleVi, titleEn, summary, summaryVi, summaryEn, coverImage, destinationName }) =>
      ({ id, title, titleVi, titleEn, summary, summaryVi, summaryEn, coverImage, destinationName })
  );
export const resolveExploreCultures = async (ids, options) => {
  if (!ids?.length) return [];
  const articles = await exploreCultures(options);
  const byId = new Map(articles.map(article => [article.id, article]));
  return ids.map(id => byId.get(id)).filter(Boolean);
};
// The Backend owns scenario availability; an ACTIVE API record is directly openable.
export const openableExploreScenarios = rows => rows.filter(item => item.status === 'ACTIVE');
