"use client";
import { memo, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import StreakCard from "../StreakCard";

const RightSideBar = memo(() => {
  const { data: session } = useSession();
  const params = useParams();

  const [stats, setStats] = useState({
    totalQuestions: 0,
    dueQuestions: 0,
    newQuestions: 0,
    reviewQuestions: 0,
    retentionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    dailyAttempted: 0,
    context: {},
    loading: true,
  });

  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    dailyActivity: [],
  });

  // Determine current context based on URL
  const getCurrentContext = useCallback(() => {
    const context = {};

    // Check if we're on a topic page
    if (params?.topicId) {
      context.topicId = params.topicId;
    }
    // Check if we're on a subject page (but not a topic page)
    else if (params?.subjectId) {
      context.subjectId = params.subjectId;
    }
    // Otherwise we're on the home page (no context needed)

    return context;
  }, [params]);

  const getContextTitle = () => {
    if (params?.topicId) {
      return "Topic Statistics";
    } else if (params?.subjectId) {
      return "Subject Statistics";
    }
    return "Overall Statistics";
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return;

      try {
        const context = getCurrentContext();
        const searchParams = new URLSearchParams();

        if (context.topicId) {
          searchParams.append("topicId", context.topicId);
        } else if (context.subjectId) {
          searchParams.append("subjectId", context.subjectId);
        }

        const response = await fetch(
          `/api/spaced-repetition/${
            session.user.id
          }/stats?${searchParams.toString()}`
        );

        if (response.ok) {
          const data = await response.json();
          setStats({ ...data, loading: false });

          // Update streak data
          setStreakData({
            currentStreak: data.currentStreak || 0,
            longestStreak: data.longestStreak || 0,
            dailyActivity: data.dailyActivity || [],
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [session, params, getCurrentContext]);

  // Error boundary for stats
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      console.error("RightSideBar error:", error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="h-full flex flex-col">
        <aside className="flex-1 overflow-y-auto p-4">
          <div className="alert alert-error">
            <span className="text-sm">
              Unable to load statistics. Please refresh the page.
            </span>
          </div>
        </aside>
      </div>
    );
  }

  const StatCard = ({ icon, title, value, subtitle, color = "primary" }) => (
    <div className="bg-base-200/70 p-3 rounded-lg border border-base-300">
      <div className="flex items-center gap-2 mb-2">
        <div className={`text-${color}`}>{icon}</div>
        <span className="text-xs font-medium text-base-content/80">
          {title}
        </span>
      </div>
      <div className="text-lg font-bold text-base-content">{value}</div>
      {subtitle && (
        <div className="text-xs text-base-content/60">{subtitle}</div>
      )}
    </div>
  );

  const StatSkeleton = () => (
    <div className="bg-base-200/70 p-3 rounded-lg border border-base-300 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 bg-base-300 rounded"></div>
        <div className="h-3 bg-base-300 rounded w-16"></div>
      </div>
      <div className="h-6 bg-base-300 rounded w-12 mb-1"></div>
      <div className="h-3 bg-base-300 rounded w-20"></div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <aside className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-semibold mb-4 text-base-content/80 tracking-wider uppercase">
          {getContextTitle()}
        </h2>

        <div className="space-y-3 mb-6">
          {stats.loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon={<CalendarDaysIcon className="w-4 h-4" />}
                title="Due Questions"
                value={stats.dueQuestions}
                subtitle={`${stats.newQuestions} new, ${stats.reviewQuestions} review`}
                color="error"
              />

              <StatCard
                icon={
                  params?.topicId ? (
                    <BookOpenIcon className="w-4 h-4" />
                  ) : params?.subjectId ? (
                    <AcademicCapIcon className="w-4 h-4" />
                  ) : (
                    <ChartBarIcon className="w-4 h-4" />
                  )
                }
                title={
                  params?.topicId
                    ? "Topic Questions"
                    : params?.subjectId
                    ? "Subject Questions"
                    : "Total Questions"
                }
                value={stats.totalQuestions}
                subtitle={
                  params?.topicId
                    ? "In this topic"
                    : params?.subjectId
                    ? "In this subject"
                    : "All questions"
                }
                color="info"
              />

              <StatCard
                icon={<ChartBarIcon className="w-4 h-4" />}
                title="Retention Rate"
                value={`${stats.retentionRate}%`}
                subtitle="Last 30 days"
                color="success"
              />

              <StatCard
                icon={<ClockIcon className="w-4 h-4" />}
                title="Today's Progress"
                value={stats.dailyAttempted}
                subtitle="Questions attempted"
                color="warning"
              />
            </>
          )}
        </div>

        <div className="divider my-6"></div>

        {/* Streak Card */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold mb-3 text-base-content/80 tracking-wider uppercase">
            Learning Streak
          </h2>
          <StreakCard streakData={streakData} isLoading={stats.loading} />
        </div>

        <div className="divider my-6"></div>

        <div>
          <h2 className="text-xs font-semibold mb-3 text-base-content/80 tracking-wider uppercase">
            Study Settings
          </h2>
          <div className="form-control space-y-2">
            <label className="cursor-pointer label justify-start gap-2 hover:bg-base-200/50 rounded-lg px-2 transition-colors duration-150">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary transition-colors duration-150"
              />
              <span className="label-text text-xs">Show Important Only</span>
            </label>
            <label className="cursor-pointer label justify-start gap-2 hover:bg-base-200/50 rounded-lg px-2 transition-colors duration-150">
              <input
                type="checkbox"
                className="checkbox checkbox-sm transition-colors duration-150"
              />
              <span className="label-text text-xs">Auto-advance</span>
            </label>
          </div>
        </div>
      </aside>
    </div>
  );
});

RightSideBar.displayName = "RightSideBar";
export default RightSideBar;
