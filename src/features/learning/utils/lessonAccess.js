export function isLessonCompleted(lesson) {
  return lesson?.isCompleted === true || lesson?.learningStatus === 'COMPLETED';
}

export function applySequentialLessonLocks(lessons = []) {
  let allPreviousLessonsCompleted = true;

  return lessons.map((lesson) => {
    const completed = isLessonCompleted(lesson);
    const result = {
      ...lesson,
      isCompleted: completed,
      isLocked: !allPreviousLessonsCompleted,
    };

    allPreviousLessonsCompleted = allPreviousLessonsCompleted && completed;
    return result;
  });
}
