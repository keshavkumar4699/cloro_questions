// app/dashboard/[userId]/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import QuestionList from "@/components/ReadQuestions/QuestionList";
import QuestionCardSkeleton from "@/components/Layout/QuestionCardSkeleton";
import {
  BookOpenIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

const DashboardPage = ({ params }) => {
  const { userId } = params;
  const { data: session } = useSession();
  const router = useRouter();
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalTopics: 0,
    totalQuestions: 0,
    dueQuestions: 0,
    newQuestions: 0,
    reviewQuestions: 0,
    retentionRate: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);

      // Fetch recent questions
      const questionsResponse = await fetch(
        `/api/content/${userId}/fetchAllQuestions`
      );
      if (questionsResponse.ok) {
        const questions = await questionsResponse.json();
        setRecentQuestions(questions.slice(0, 8)); // Show only recent 8 questions

        // Calculate basic stats
        const subjects = new Set(questions.map((q) => q.subject._id));
        const topics = new Set(questions.map((q) => q.topic._id));

        setStats((prev) => ({
          ...prev,
          totalSubjects: subjects.size,
          totalTopics: topics.size,
          totalQuestions: questions.length,
        }));
      }

      // Fetch comprehensive spaced repetition stats
      const statsResponse = await fetch(
        `/api/spaced-repetition/${userId}/stats`
      );
      if (statsResponse.ok) {
        const srStats = await statsResponse.json();
        setStats((prev) => ({
          ...prev,
          dueQuestions: srStats.dueQuestions,
          newQuestions: srStats.newQuestions,
          reviewQuestions: srStats.reviewQuestions,
          retentionRate: srStats.retentionRate,
          currentStreak: srStats.currentStreak,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [session, userId]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session, fetchDashboardData]);

  const handleToggleImportant = useCallback(
    async (questionId, important) => {
      try {
        const question = recentQuestions.find((q) => q._id === questionId);
        if (!question) return;

        const response = await fetch(
          `/api/content/${userId}/${question.subject._id}/${question.topic._id}/questions/${questionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ important }),
          }
        );

        if (response.ok) {
          setRecentQuestions((prev) =>
            prev.map((q) => (q._id === questionId ? { ...q, important } : q))
          );
        }
      } catch (error) {
        console.error("Error updating question importance:", error);
      }
    },
    [userId, recentQuestions]
  );

  const handleUpdateQuestion = useCallback((questionId) => {
    // TODO: Implement question update modal for dashboard
    console.log("Update question:", questionId);
  }, []);

  const handleDeleteQuestion = useCallback(
    async (questionId) => {
      if (!confirm("Are you sure you want to delete this question?")) return;

      try {
        const question = recentQuestions.find((q) => q._id === questionId);
        if (!question) return;

        const response = await fetch(
          `/api/content/${userId}/${question.subject._id}/${question.topic._id}/questions/${questionId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setRecentQuestions((prev) =>
            prev.filter((q) => q._id !== questionId)
          );
        }
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    },
    [userId, recentQuestions]
  );

  const handleDifficultySelect = useCallback(
    async (questionId, difficulty) => {
      try {
        const response = await fetch(
          `/api/spaced-repetition/${userId}/review`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questionId,
              difficulty,
            }),
          }
        );

        if (response.ok) {
          // Refresh dashboard data to show updated statistics
          await fetchDashboardData();
        } else {
          console.error("Failed to submit review");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    },
    [userId, fetchDashboardData]
  );

  const StatCard = ({ icon, title, value, description, onClick }) => (
    <div
      className={`card bg-base-100 shadow-lg border border-base-300 ${
        onClick ? "cursor-pointer hover:shadow-xl transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <div>
            <div className="text-2xl font-bold text-base-content">{value}</div>
            <div className="text-sm font-medium text-base-content/80">
              {title}
            </div>
            {description && (
              <div className="text-xs text-base-content/60">{description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-lg animate-pulse">
              <div className="card-body p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-base-300 rounded"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-base-300 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-base-300 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <QuestionCardSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-base-content mb-2">
          Welcome back, {session?.user?.name || "Student"}!
        </h1>
        <p className="text-base-content/70">
          Track your progress and continue your learning journey through your
          topics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<BookOpenIcon className="w-8 h-8" />}
          title="Subjects"
          value={stats.totalSubjects}
          description="Total subjects created"
        />
        <StatCard
          icon={<AcademicCapIcon className="w-8 h-8" />}
          title="Topics"
          value={stats.totalTopics}
          description="Across all subjects"
        />
        <StatCard
          icon={<QuestionMarkCircleIcon className="w-8 h-8" />}
          title="Questions"
          value={stats.totalQuestions}
          description="Total questions created"
        />
        <StatCard
          icon={<CalendarDaysIcon className="w-8 h-8" />}
          title="Due Questions"
          value={stats.dueQuestions}
          description="Ready for learning"
        />
      </div>

      {/* Additional Learning Stats */}
      {stats.dueQuestions > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<span className="text-2xl">🆕</span>}
            title="New Questions"
            value={stats.newQuestions}
            description="Never reviewed before"
          />
          <StatCard
            icon={<span className="text-2xl">🔄</span>}
            title="Review Questions"
            value={stats.reviewQuestions}
            description="Due for review"
          />
          <StatCard
            icon={<span className="text-2xl">🎯</span>}
            title="Retention Rate"
            value={`${stats.retentionRate}%`}
            description="Last 30 days success"
          />
        </div>
      )}

      {/* Streak Information */}
      {stats.currentStreak > 0 && (
        <div className="mb-8">
          <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔥</div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.currentStreak} Day Streak!
                  </div>
                  <div className="text-base-content/70">
                    Keep up the great work! You&apos;re building a strong
                    learning habit.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Navigation */}
      {stats.dueQuestions > 0 && (
        <div className="mb-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold mb-4">Ready to Learn</h3>
              <p className="text-base-content/70 mb-4">
                You have {stats.dueQuestions} questions ready for learning.
                Navigate to your topics to start studying!
              </p>
              <div className="flex gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() => router.push("/")}
                >
                  Browse Topics
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => router.push("/")}
                >
                  View All Subjects
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Questions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-base-content">
            Recent Questions
          </h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => router.push("/")}
          >
            View All
          </button>
        </div>

        {recentQuestions.length > 0 ? (
          <QuestionList
            questions={recentQuestions}
            showCreateCard={false}
            isHomePage={false}
            onToggleImportant={handleToggleImportant}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onDifficultySelect={handleDifficultySelect}
            showDifficultyButtons={true}
          />
        ) : (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium mb-2">
                Start Your Learning Journey
              </h3>
              <p className="text-base-content/70 mb-4">
                Create subjects and topics, then add questions to begin your
                spaced repetition learning experience!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/")}
              >
                Create Your First Topic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
