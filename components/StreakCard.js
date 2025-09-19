"use client";

import { memo } from "react";
import { FireIcon } from "@heroicons/react/24/outline";
import { FireIcon as FireIconSolid } from "@heroicons/react/24/solid";

const StreakCard = memo(
  ({ streakData = {}, className = "", isLoading = false }) => {
    const {
      currentStreak = 0,
      longestStreak = 0,
      dailyActivity = [],
    } = streakData;

    // Generate last 7 days
    const getLast7Days = () => {
      const days = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        days.push(date);
      }

      return days;
    };

    // Get activity for a specific date
    const getActivityForDate = (date) => {
      const dateStr = date.toISOString().split("T")[0];
      return dailyActivity.find((activity) => {
        const activityDate = new Date(activity.date)
          .toISOString()
          .split("T")[0];
        return activityDate === dateStr;
      });
    };

    // Get day abbreviation
    const getDayAbbr = (date) => {
      return date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0);
    };

    // Get activity level for styling
    const getActivityLevel = (questionsAnswered) => {
      if (!questionsAnswered || questionsAnswered === 0) return "none";
      if (questionsAnswered >= 20) return "high";
      if (questionsAnswered >= 10) return "medium";
      if (questionsAnswered >= 1) return "low";
      return "none";
    };

    // Get activity color classes
    const getActivityColorClass = (level) => {
      switch (level) {
        case "high":
          return "bg-success text-success-content";
        case "medium":
          return "bg-success/70 text-success-content";
        case "low":
          return "bg-success/40 text-success-content";
        case "none":
        default:
          return "bg-base-300 text-base-content/40";
      }
    };

    const last7Days = getLast7Days();

    if (isLoading) {
      return (
        <div
          className={`bg-base-200/70 p-4 rounded-lg border border-base-300 animate-pulse ${className}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-base-300 rounded"></div>
              <div>
                <div className="h-4 bg-base-300 rounded w-20 mb-1"></div>
                <div className="h-3 bg-base-300 rounded w-16"></div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-base-300 rounded w-12 mb-2"></div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="h-3 bg-base-300 rounded w-2"></div>
                  <div className="w-8 h-8 bg-base-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-base-200/70 p-4 rounded-lg border border-base-300 ${className}`}
      >
        {/* Header with streak info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="text-warning">
              {currentStreak > 0 ? (
                <FireIconSolid className="w-5 h-5" />
              ) : (
                <FireIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-base-content">
                {currentStreak} Day Streak
              </div>
              <div className="text-xs text-base-content/60">
                Best: {longestStreak} days
              </div>
            </div>
          </div>
        </div>

        {/* 7-day activity grid */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-base-content/80 mb-2">
            Activity
          </div>

          <div className="grid grid-cols-7 gap-1">
            {last7Days.map((date, index) => {
              const activity = getActivityForDate(date);
              const questionsAnswered = activity?.questionsAnswered || 0;
              const activityLevel = getActivityLevel(questionsAnswered);
              const colorClass = getActivityColorClass(activityLevel);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  {/* Day label */}
                  <div className="text-xs text-base-content/60 font-medium">
                    {getDayAbbr(date)}
                  </div>

                  {/* Activity indicator */}
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                    transition-all duration-200 hover:scale-110
                    ${colorClass}
                    ${
                      isToday
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-base-100"
                        : ""
                    }
                  `}
                    title={`${date.toLocaleDateString()}: ${questionsAnswered} questions`}
                  >
                    {questionsAnswered > 0 ? questionsAnswered : ""}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity legend */}
          <div className="flex items-center justify-between text-xs text-base-content/60 mt-3 pt-2 border-t border-base-300">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-base-300"></div>
              <div className="w-3 h-3 rounded bg-success/40"></div>
              <div className="w-3 h-3 rounded bg-success/70"></div>
              <div className="w-3 h-3 rounded bg-success"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Motivational message */}
        {currentStreak > 0 && (
          <div className="mt-3 p-2 bg-success/10 rounded-lg border border-success/20">
            <div className="text-xs text-success font-medium">
              {currentStreak === 1
                ? "Great start! Keep it going!"
                : currentStreak < 7
                ? `${currentStreak} days strong! 🔥`
                : `Amazing ${currentStreak}-day streak! 🚀`}
            </div>
          </div>
        )}

        {currentStreak === 0 && (
          <div className="mt-3 p-2 bg-warning/10 rounded-lg border border-warning/20">
            <div className="text-xs text-warning font-medium">
              Start your learning streak today! 💪
            </div>
          </div>
        )}
      </div>
    );
  }
);

StreakCard.displayName = "StreakCard";

export default StreakCard;
