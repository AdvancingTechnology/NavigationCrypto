"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Course, CourseLesson, UserProgress } from "@/lib/supabase/types";

interface CourseWithProgress {
  course: Course;
  lessons: (CourseLesson & { progress?: UserProgress })[];
  completedCount: number;
  totalLessons: number;
  percentage: number;
}

export default function ProgressPage() {
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), []);
  const [coursesInProgress, setCoursesInProgress] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallStats, setOverallStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    overallPercentage: 0,
  });

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get all user progress
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: progressData, error: progressError } = await (supabase.from('user_progress') as any)
          .select('*')
          .eq('user_id', user.id);

        if (progressError) {
          setError('Failed to load progress data. Please try refreshing the page.');
          setLoading(false);
          return;
        }

        if (!progressData || progressData.length === 0) {
          setLoading(false);
          return;
        }

        // Get unique course IDs
        const courseIds = [...new Set<string>(progressData.map((p: { course_id: string }) => p.course_id))];

        // Fetch courses
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: coursesData } = await (supabase.from('courses') as any)
          .select('*')
          .in('id', courseIds);

        if (!coursesData) {
          setLoading(false);
          return;
        }

        // Fetch lessons for all courses
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: lessonsData } = await (supabase.from('course_lessons') as any)
          .select('*')
          .in('course_id', courseIds)
          .order('order_index');

        if (!lessonsData) {
          setLoading(false);
          return;
        }

        // Build course progress data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coursesWithProgress: CourseWithProgress[] = coursesData.map((course: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const courseLessons = lessonsData.filter((l: any) => l.course_id === course.id);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lessonsWithProgress = courseLessons.map((lesson: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const progress = progressData.find((p: any) =>
              p.lesson_id === lesson.id && p.course_id === course.id
            );
            return { ...lesson, progress };
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const completedCount = lessonsWithProgress.filter((l: any) => l.progress?.completed).length;
          const totalLessons = lessonsWithProgress.length;
          const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          return {
            course,
            lessons: lessonsWithProgress,
            completedCount,
            totalLessons,
            percentage,
          };
        });

        // Sort by percentage (in progress courses first)
        coursesWithProgress.sort((a, b) => {
          if (a.percentage === 100 && b.percentage !== 100) return 1;
          if (a.percentage !== 100 && b.percentage === 100) return -1;
          return b.percentage - a.percentage;
        });

        setCoursesInProgress(coursesWithProgress);

        // Calculate overall stats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalCompleted = progressData.filter((p: any) => p.completed).length;
        const totalAll = progressData.length;
        const overallPct = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0;

        setOverallStats({
          totalCourses: courseIds.length,
          completedLessons: totalCompleted,
          totalLessons: totalAll,
          overallPercentage: overallPct,
        });
      } catch (err) {
        console.error('Error loading progress:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [supabase]);

  const toggleLessonComplete = async (
    courseId: string,
    lessonId: string,
    currentStatus: boolean
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('user_progress') as any)
        .update({
          completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('lesson_id', lessonId);

      if (!error) {
        // Update local state instead of reloading
        setCoursesInProgress(prevCourses => {
          return prevCourses.map(courseWithProgress => {
            if (courseWithProgress.course.id === courseId) {
              // Update lesson completion status
              const updatedLessons = courseWithProgress.lessons.map(lesson => {
                if (lesson.id === lessonId) {
                  return {
                    ...lesson,
                    progress: {
                      ...lesson.progress!,
                      completed: !currentStatus,
                      completed_at: !currentStatus ? new Date().toISOString() : null,
                    }
                  };
                }
                return lesson;
              });

              // Recalculate progress stats
              const completedCount = updatedLessons.filter(l => l.progress?.completed).length;
              const totalLessons = updatedLessons.length;
              const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

              return {
                ...courseWithProgress,
                lessons: updatedLessons,
                completedCount,
                percentage,
              };
            }
            return courseWithProgress;
          });
        });

        // Update overall stats
        setOverallStats(prev => {
          const newCompleted = !currentStatus ? prev.completedLessons + 1 : prev.completedLessons - 1;
          const overallPct = prev.totalLessons > 0 ? Math.round((newCompleted / prev.totalLessons) * 100) : 0;
          return {
            ...prev,
            completedLessons: newCompleted,
            overallPercentage: overallPct,
          };
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Progress</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Learning Progress</h2>
        <p className="text-gray-500">Track your learning journey and achievements</p>
      </div>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{overallStats.totalCourses}</div>
          <div className="text-gray-500 text-sm">Courses Enrolled</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {overallStats.completedLessons}/{overallStats.totalLessons}
          </div>
          <div className="text-gray-500 text-sm">Lessons Completed</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{overallStats.overallPercentage}%</div>
          <div className="text-gray-500 text-sm">Overall Completion</div>
        </div>
      </div>

      {/* Courses in Progress */}
      {coursesInProgress.length > 0 ? (
        <div className="space-y-6">
          {coursesInProgress.map(({ course, lessons, completedCount, totalLessons, percentage }) => (
            <div
              key={course.id}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
            >
              {/* Course Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-500 text-sm">
                      {course.description || 'Continue your learning journey'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{percentage}%</div>
                    <div className="text-gray-500 text-xs">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentage === 100 ? 'bg-green-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-gray-500 text-xs">
                  {completedCount} of {totalLessons} lessons completed
                </div>
              </div>

              {/* Lessons List */}
              <div className="p-6">
                <h4 className="text-white font-semibold mb-4">Lessons</h4>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isCompleted = lesson.progress?.completed || false;
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition ${
                          isCompleted
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        <button
                          onClick={() => toggleLessonComplete(course.id, lesson.id, isCompleted)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                            isCompleted
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-600 hover:border-cyan-500'
                          }`}
                        >
                          {isCompleted && <span className="text-white text-xs">✓</span>}
                        </button>
                        <div className="flex-1">
                          <div className={`font-medium ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                            {index + 1}. {lesson.title}
                          </div>
                          {lesson.description && (
                            <div className="text-gray-500 text-xs mt-1 line-clamp-1">
                              {lesson.description}
                            </div>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{lesson.duration_minutes} min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-white mb-2">No Progress Yet</h3>
          <p className="text-gray-500 mb-4">
            Enroll in courses to start your learning journey!
          </p>
          <a
            href="/dashboard/courses"
            className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-semibold"
          >
            Browse Courses
          </a>
        </div>
      )}

      {/* Achievements Section */}
      {overallStats.completedLessons > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🏆</div>
            <div>
              <h3 className="text-white font-semibold mb-2">Keep Up the Great Work!</h3>
              <p className="text-gray-400 text-sm">
                You&apos;ve completed {overallStats.completedLessons} lesson{overallStats.completedLessons !== 1 ? 's' : ''}!
                {overallStats.overallPercentage >= 50 && ' You&apos;re over halfway through your learning journey.'}
                {overallStats.overallPercentage === 100 && ' Congratulations on completing all your courses!'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
