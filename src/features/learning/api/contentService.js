import { httpClient } from '@/shared/api/httpClient';
import axiosClient from '@/shared/api/axiosClient';

// Reuse the project's existing JWT client and legacy session client as appropriate.
const request = (path, method = 'GET', body, signal) => localStorage.getItem('token')
  ? axiosClient.request({ url: `/api${path}`, method, data: body, signal })
  : httpClient(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }), ...(signal ? { signal } : {}) });

async function uploadSignedMedia(file, endpoint, expectedType) {
  const signed = await axiosClient.post(endpoint);
  const signature = signed?.result ?? signed;
  if (!signature?.uploadUrl || !signature?.apiKey || !signature?.timestamp || !signature?.signature || !signature?.folder || !signature?.publicId) {
    throw new Error('Không nhận được thông tin tải tệp từ máy chủ.');
  }
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);
  form.append('public_id', signature.publicId);
  const response = await fetch(signature.uploadUrl, { method: 'POST', body: form });
  const uploaded = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(uploaded?.error?.message || 'Tải tệp lên Cloudinary thất bại.');
  if (uploaded.resource_type !== expectedType || !uploaded.secure_url ||
      !uploaded.public_id?.startsWith(`${signature.folder}/`)) {
    throw new Error('Cloudinary không trả về tệp hợp lệ.');
  }
  return uploaded.secure_url;
}

export const contentService = {
  async courseWorkbookTemplate() { return axiosClient.get('/api/admin/courses/workbook/template', { responseType: 'blob' }); },
  async courseWorkbookValidate(file) { const form = new FormData(); form.append('file', file); return axiosClient.post('/api/admin/courses/workbook/validate', form); },
  async courseWorkbookImport(file) { const form = new FormData(); form.append('file', file); return axiosClient.post('/api/admin/courses/workbook/import', form); },
  uploadCourseCover(file) { return uploadSignedMedia(file, '/api/media/courses/cover/signature', 'image'); },
  uploadLessonMedia(file, type) {
    if (!['image', 'video', 'audio'].includes(type)) throw new Error('Loại tệp bài học không hợp lệ.');
    return uploadSignedMedia(file, type === 'audio' ? '/api/media/audio/signature?prefix=lesson' : `/api/media/lessons/signature?type=${type}`, type === 'audio' ? 'video' : type);
  },
  uploadQuestionMedia(file, type) {
    if (!['image', 'audio'].includes(type)) throw new Error('Loại tệp câu hỏi không hợp lệ.');
    return uploadSignedMedia(file, `/api/media/questions/signature?type=${type}`, type === 'audio' ? 'video' : 'image');
  },
  list(kind, filters = {}, signal) { const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '' && value != null)); return request(`/admin/${kind}?${query}`, 'GET', undefined, signal); },
  get(kind, id, signal) { return request(`/admin/${kind}/${id}`, 'GET', undefined, signal); },
  create(kind, body) { return request(`/admin/${kind}`, 'POST', body); },
  update(kind, id, body) { return request(`/admin/${kind}/${id}`, 'PUT', body); },
  status(kind, id, status) { return request(`/admin/${kind}/${id}/status`, 'PATCH', { status }); },
  submitCourse(id) { return request(`/admin/courses/${id}/submit`, 'POST'); },
  requestCourseEdit(id, reason) { return request(`/admin/courses/${id}/edit-request`, 'POST', { reason }); },
  reviewCourseEditRequest(id, decision, note) { return request(`/admin/courses/${id}/edit-request/review`, 'POST', { decision, note }); },
  courseReadiness(id, signal) { return request(`/admin/courses/${id}/readiness`, 'GET', undefined, signal); },
  setFinalAssessment(id, quizId) { return request(`/admin/courses/${id}/final-assessment`, 'PATCH', { quizId }); },
  reviewCourse(id, decision, note) { return request(`/admin/courses/${id}/review`, 'POST', { decision, note }); },
  deleteCourse(id) { return request(`/admin/courses/${id}`, 'DELETE'); },
  deleteQuiz(id) { return request(`/admin/quizzes/${id}`, 'DELETE'); },
  addModule(courseId, body) { return request(`/admin/courses/${courseId}/modules`, 'POST', body); },
  updateModule(id, body) { return request(`/admin/modules/${id}`, 'PUT', body); },
  addLesson(moduleId, body) { return request(`/admin/modules/${moduleId}/lessons`, 'POST', body); },
  addActivity(lessonId, body) { return request(`/admin/lessons/${lessonId}/activities`, 'POST', body); },
  updateActivity(id, body) { return request(`/admin/activities/${id}`, 'PUT', body); },
  reorder(path, ids) { return request(`/admin/${path}/reorder`, 'PUT', { ids }); },
  addQuestion(quizId, questionId, points) { return request(`/admin/quizzes/${quizId}/questions`, 'POST', { questionId, points }); },
  removeQuestion(quizId, questionId) { return request(`/admin/quizzes/${quizId}/questions/${questionId}`, 'DELETE'); },
  preview(kind, id, signal) { return request(`/admin/${kind}/${id}/preview`, 'GET', undefined, signal); },
  lesson(id, signal) { return request(`/lessons/${id}`, 'GET', undefined, signal); },
  completeActivity(id, answer) { return request(`/activities/${id}/complete`, 'POST', answer === undefined ? {} : { answer }); },
  quiz(id, signal) { return request(`/quizzes/${id}`, 'GET', undefined, signal); },
  startQuiz(id, restart = false) { return request(restart ? `/quizzes/${id}/restart` : `/quizzes/${id}/start`, 'POST'); },
  restartQuiz(id) { return request(`/quizzes/${id}/restart`, 'POST'); },
  restartAttempt(attemptId) { return request(`/quiz-attempts/${attemptId}/restart`, 'POST'); },
  attempt(id, signal) { return request(`/quiz-attempts/${id}`, 'GET', undefined, signal); },
  answer(attemptId, questionId, answer) { return request(`/quiz-attempts/${attemptId}/answers/${questionId}`, 'PUT', { answer }); },
  submit(id) { return request(`/quiz-attempts/${id}/submit`, 'POST'); },
  result(id, signal) { return request(`/quiz-attempts/${id}/result`, 'GET', undefined, signal); },
};
