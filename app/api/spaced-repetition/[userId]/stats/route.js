// app/api/spaced-repetition/[userId]/stats/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { createStatisticsService } from "@/libs/statisticsService";

export async function GET(request, { params }) {
  try {
    await connectMongo();

    const { userId } = params;
    const { searchParams } = new URL(request.url);

    // Get context parameters for context-aware statistics
    const subjectId = searchParams.get("subjectId");
    const topicId = searchParams.get("topicId");
    const period = searchParams.get("period"); // Optional: for period-specific stats

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create statistics service instance
    const statsService = createStatisticsService(userId);

    // Build context object
    const context = {};
    if (topicId) context.topicId = topicId;
    else if (subjectId) context.subjectId = subjectId;

    // Get comprehensive statistics
    const stats = await statsService.getComprehensiveStats(context);

    // Get today's attempted questions from user's daily activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivity = user.dailyActivity?.find(
      (activity) => activity.date.toDateString() === today.toDateString()
    );
    const dailyAttempted = todayActivity?.questionsAnswered || 0;

    // If period-specific stats are requested, get them as well
    let periodStats = null;
    if (period) {
      const days = parseInt(period) || 7;
      periodStats = await statsService.getStatsForPeriod(context, days);
    }

    // Return comprehensive statistics with backward compatibility
    const response = {
      // New comprehensive stats
      totalQuestions: stats.totalQuestions,
      dueQuestions: stats.dueQuestions,
      newQuestions: stats.newQuestions,
      reviewQuestions: stats.reviewQuestions,
      retentionRate: stats.retentionRate,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,

      // Legacy compatibility fields
      dueToday: stats.dueQuestions, // Alias for backward compatibility
      dailyAttempted,

      // Streak data for StreakCard component
      dailyActivity: user.dailyActivity || [],

      // Context information
      context: stats.context,

      // Period-specific stats if requested
      ...(periodStats && { periodStats }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Error fetching comprehensive spaced repetition stats:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
