import { useCallback } from 'react'
import { courseService } from '@/features/learning/api/courseService'
import { learningService } from '@/features/learning/api/learningService'
import { useAsyncResource } from '@/shared/hooks/useAsyncResource'
import { applySequentialLessonLocks, isLessonCompleted } from '@/features/learning/utils/lessonAccess'
export function useLessons(courseId) { return useAsyncResource(useCallback(() => learningService.lessons(courseId), [courseId])) }
export function useLearning(courseId, lessonId) {
  return useAsyncResource(useCallback(async signal => {
    const [course, lessons] = await Promise.all([courseService.detail(courseId), learningService.lessons(courseId)])
    const sequencedLessons = applySequentialLessonLocks(lessons)
    const lessonIndex = sequencedLessons.findIndex(l => String(l.id) === String(lessonId))
    if (lessonIndex < 0) throw new Error('This lesson is not part of this course.')
    signal.throwIfAborted()

    const requestedLesson = sequencedLessons[lessonIndex]
    if (requestedLesson.isLocked) {
      const requiredLesson = sequencedLessons
        .slice(0, lessonIndex)
        .find(lesson => !isLessonCompleted(lesson))
      const progress = await learningService.progress(courseId)
      return {
        course,
        lesson: requestedLesson,
        lessons: sequencedLessons,
        progress,
        locked: true,
        requiredLesson,
      }
    }

    const lesson = await learningService.start(lessonId)
    const progress = await learningService.progress(courseId)
    return {
      course,
      lesson,
      lessons: sequencedLessons.map(l => String(l.id) === String(lesson.id)
        ? { ...lesson, isCompleted: lesson.isCompleted, isLocked: false }
        : l),
      progress,
      locked: false,
      requiredLesson: null,
    }
  }, [courseId, lessonId]))
}
export function useResumeCourse(courseId) {
  return useAsyncResource(useCallback(async () => {
    const [courses, lessons] = await Promise.all([courseService.myCourses(), learningService.lessons(courseId)])
    const course = courses.find(c => String(c.courseId) === String(courseId))
    let target = lessons.find(l => String(l.id) === String(course?.lastAccessedLessonId))
    if (target && isLessonCompleted(target)) {
      const idx = lessons.findIndex(l => String(l.id) === String(target.id))
      target = lessons.slice(idx + 1).find(l => !isLessonCompleted(l)) || lessons.find(l => !isLessonCompleted(l)) || target
    } else if (!target) {
      target = lessons.find(l => !isLessonCompleted(l)) || lessons[0]
    }
    return target?.id || null
  }, [courseId]))
}
