// libs/statisticsService.js
import Question from "@/models/Question";
import User from "@/models/User";
import mongoose from "mongoose";

/**
 * Comprehensive statistics calculation service for spaced repetition
 * Provides context-aware statistics based on current page (home vs topic)
 */
export class StatisticsService {
  constructor(userId) {
    this.userId = userId;
  }

  /**
   * Get comprehensive statistics with context awareness
   * @param {Object} context - Context object containing subjectId, topicId
   * @returns {Object} Statistics object
   */
  async getComprehensiveStats(context = {}) {
    const { subjectId, topicId } = context;

    try {
      // Build base query for user's questions
      const baseQuery = { user: this.userId };

      // Add context-specific filters
      if (topicId) {
        baseQuery.topic = topicId;
      } else if (subjectId) {
        baseQuery.subject = subjectId;
      }

      // Get current date for due calculations
      const now = new Date();

      // Use MongoDB aggregation for optimized statistics calculation
      const [statsResult, user] = await Promise.all([
        this.getOptimizedStats(baseQuery, now),
        User.findById(this.userId)
          .select("currentStreak longestStreak dailyActivity")
          .lean(),
      ]);

      // Get streak information from user
      const currentStreak = user?.currentStreak || 0;
      const longestStreak = user?.longestStreak || 0;

      return {
        ...statsResult,
        currentStreak,
        longestStreak,
        context: {
          isTopicSpecific: !!topicId,
          isSubjectSpecific: !!subjectId && !topicId,
          isGlobal: !subjectId && !topicId,
        },
      };
    } catch (error) {
      console.error("Error calculating comprehensive stats:", error);
      throw new Error("Failed to calculate statistics");
    }
  }

  /**
   * Get optimized statistics using MongoDB aggregation
   * @param {Object} baseQuery - Base MongoDB query
   * @param {Date} now - Current date
   * @returns {Object} Optimized statistics object
   */
  async getOptimizedStats(baseQuery, now) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pipeline = [
      { $match: baseQuery },
      {
        $facet: {
          totalQuestions: [{ $count: "count" }],
          dueQuestions: [
            { $match: { nextReviewDate: { $lte: now } } },
            { $count: "count" },
          ],
          newQuestions: [
            { $match: { isNew: true, nextReviewDate: { $lte: now } } },
            { $count: "count" },
          ],
          reviewQuestions: [
            { $match: { isNew: false, nextReviewDate: { $lte: now } } },
            { $count: "count" },
          ],
          retentionStats: [
            {
              $match: {
                lastReviewDate: { $gte: thirtyDaysAgo },
                reviewCount: { $gt: 0 },
              },
            },
            {
              $group: {
                _id: null,
                totalAttempts: { $sum: 1 },
                successfulAttempts: {
                  $sum: {
                    $cond: [
                      { $in: ["$lastDifficulty", ["medium", "easy"]] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ];

    const [result] = await Question.aggregate(pipeline);

    const totalQuestions = result.totalQuestions[0]?.count || 0;
    const dueQuestions = result.dueQuestions[0]?.count || 0;
    const newQuestions = result.newQuestions[0]?.count || 0;
    const reviewQuestions = result.reviewQuestions[0]?.count || 0;

    const retentionData = result.retentionStats[0];
    const retentionRate =
      retentionData?.totalAttempts > 0
        ? Math.round(
            (retentionData.successfulAttempts / retentionData.totalAttempts) *
              100
          )
        : 0;

    return {
      totalQuestions,
      dueQuestions,
      newQuestions,
      reviewQuestions,
      retentionRate: Math.max(0, Math.min(100, retentionRate)),
    };
  }

  /**
   * Get total questions count based on context
   * @param {Object} baseQuery - Base MongoDB query
   * @returns {number} Total questions count
   */
  async getTotalQuestions(baseQuery) {
    return await Question.countDocuments(baseQuery);
  }

  /**
   * Get due questions count (new + review questions that are due)
   * @param {Object} baseQuery - Base MongoDB query
   * @param {Date} now - Current date
   * @returns {number} Due questions count
   */
  async getDueQuestions(baseQuery, now) {
    const dueQuery = {
      ...baseQuery,
      nextReviewDate: { $lte: now },
    };

    return await Question.countDocuments(dueQuery);
  }

  /**
   * Get new questions count (questions that have never been reviewed and are due)
   * @param {Object} baseQuery - Base MongoDB query
   * @param {Date} now - Current date
   * @returns {number} New questions count
   */
  async getNewQuestions(baseQuery, now) {
    const newQuery = {
      ...baseQuery,
      isNew: true,
      nextReviewDate: { $lte: now },
    };

    return await Question.countDocuments(newQuery);
  }

  /**
   * Get review questions count (questions that have been reviewed before and are due)
   * @param {Object} baseQuery - Base MongoDB query
   * @param {Date} now - Current date
   * @returns {number} Review questions count
   */
  async getReviewQuestions(baseQuery, now) {
    const reviewQuery = {
      ...baseQuery,
      isNew: false,
      nextReviewDate: { $lte: now },
    };

    return await Question.countDocuments(reviewQuery);
  }

  /**
   * Calculate retention rate based on last 30 days of attempts
   * @param {Object} baseQuery - Base MongoDB query
   * @returns {number} Retention rate percentage (0-100)
   */
  async calculateRetentionRate(baseQuery) {
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Query for questions reviewed in the last 30 days
      const recentReviewsQuery = {
        ...baseQuery,
        lastReviewDate: { $gte: thirtyDaysAgo },
        reviewCount: { $gt: 0 },
      };

      // Get total attempts in last 30 days
      const totalAttempts = await Question.countDocuments(recentReviewsQuery);

      if (totalAttempts === 0) {
        return 0;
      }

      // Get successful attempts (medium and easy ratings)
      const successfulAttemptsQuery = {
        ...recentReviewsQuery,
        lastDifficulty: { $in: ["medium", "easy"] },
      };

      const successfulAttempts = await Question.countDocuments(
        successfulAttemptsQuery
      );

      // Calculate retention rate as percentage
      const retentionRate = Math.round(
        (successfulAttempts / totalAttempts) * 100
      );

      return Math.max(0, Math.min(100, retentionRate)); // Ensure 0-100 range
    } catch (error) {
      console.error("Error calculating retention rate:", error);
      return 0;
    }
  }

  /**
   * Update statistics in real-time after a question review
   * @param {string} questionId - ID of the reviewed question
   * @param {string} difficulty - Difficulty rating
   * @param {Object} context - Context object containing subjectId, topicId
   * @returns {Object} Updated statistics
   */
  async updateStatsAfterReview(questionId, difficulty, context = {}) {
    try {
      // Update user statistics
      await this.updateUserLearningStats(difficulty);

      // Return updated comprehensive stats
      return await this.getComprehensiveStats(context);
    } catch (error) {
      console.error("Error updating stats after review:", error);
      throw new Error("Failed to update statistics after review");
    }
  }

  /**
   * Update user learning statistics after a question review
   * @param {string} difficulty - Difficulty rating of the review
   */
  async updateUserLearningStats(difficulty) {
    try {
      const user = await User.findById(this.userId).select(
        "totalQuestionsAnswered currentStreak longestStreak lastActivityDate dailyActivity"
      );

      if (!user) {
        throw new Error("User not found");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Update total questions answered
      user.totalQuestionsAnswered = (user.totalQuestionsAnswered || 0) + 1;

      // Update daily activity
      this.updateDailyActivity(user, today);

      // Update streak information
      this.updateUserStreak(user, today);

      // Save user with updated statistics
      await user.save();
    } catch (error) {
      console.error("Error updating user learning stats:", error);
      throw error;
    }
  }

  /**
   * Update daily activity for the user
   * @param {Object} user - User document
   * @param {Date} today - Today's date
   */
  updateDailyActivity(user, today) {
    // Initialize dailyActivity if it doesn't exist
    if (!user.dailyActivity) {
      user.dailyActivity = [];
    }

    // Find existing activity for today
    const existingActivityIndex = user.dailyActivity.findIndex(
      (activity) => activity.date.toDateString() === today.toDateString()
    );

    if (existingActivityIndex >= 0) {
      // Update existing activity
      user.dailyActivity[existingActivityIndex].questionsAnswered += 1;
    } else {
      // Add new activity for today
      user.dailyActivity.push({
        date: today,
        questionsAnswered: 1,
      });

      // Keep only last 30 days of activity to prevent unlimited growth
      if (user.dailyActivity.length > 30) {
        user.dailyActivity = user.dailyActivity
          .sort((a, b) => b.date - a.date)
          .slice(0, 30);
      }
    }
  }

  /**
   * Update user streak information
   * @param {Object} user - User document
   * @param {Date} today - Today's date
   */
  updateUserStreak(user, today) {
    const lastActivityDate = user.lastActivityDate;

    if (!lastActivityDate) {
      // First activity ever
      user.currentStreak = 1;
      user.longestStreak = Math.max(user.longestStreak || 0, 1);
    } else {
      const lastActivity = new Date(lastActivityDate);
      lastActivity.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActivity.getTime() === yesterday.getTime()) {
        // Consecutive day - increment streak
        user.currentStreak = (user.currentStreak || 0) + 1;
        user.longestStreak = Math.max(
          user.longestStreak || 0,
          user.currentStreak
        );
      } else if (lastActivity.getTime() !== today.getTime()) {
        // Gap in activity - reset streak
        user.currentStreak = 1;
      }
      // If lastActivity is today, don't change streak (same day multiple reviews)
    }

    user.lastActivityDate = today;
  }

  /**
   * Get statistics for a specific time period
   * @param {Object} context - Context object containing subjectId, topicId
   * @param {number} days - Number of days to look back
   * @returns {Object} Time-period specific statistics
   */
  async getStatsForPeriod(context = {}, days = 7) {
    const { subjectId, topicId } = context;

    try {
      const baseQuery = { user: this.userId };

      if (topicId) {
        baseQuery.topic = topicId;
      } else if (subjectId) {
        baseQuery.subject = subjectId;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const periodQuery = {
        ...baseQuery,
        lastReviewDate: { $gte: startDate },
        reviewCount: { $gt: 0 },
      };

      const [totalReviewed, successfulReviews] = await Promise.all([
        Question.countDocuments(periodQuery),
        Question.countDocuments({
          ...periodQuery,
          lastDifficulty: { $in: ["medium", "easy"] },
        }),
      ]);

      const periodRetentionRate =
        totalReviewed > 0
          ? Math.round((successfulReviews / totalReviewed) * 100)
          : 0;

      return {
        period: `${days} days`,
        totalReviewed,
        successfulReviews,
        retentionRate: periodRetentionRate,
      };
    } catch (error) {
      console.error(`Error getting stats for ${days} day period:`, error);
      throw new Error(`Failed to get statistics for ${days} day period`);
    }
  }
}

/**
 * Factory function to create a statistics service instance
 * @param {string} userId - User ID
 * @returns {StatisticsService} Statistics service instance
 */
export function createStatisticsService(userId) {
  return new StatisticsService(userId);
}

/**
 * Helper function to get comprehensive statistics (backward compatibility)
 * @param {string} userId - User ID
 * @param {Object} context - Context object containing subjectId, topicId
 * @returns {Object} Statistics object
 */
export async function getComprehensiveStatistics(userId, context = {}) {
  const service = createStatisticsService(userId);
  return await service.getComprehensiveStats(context);
}

/**
 * Helper function to update statistics after review (backward compatibility)
 * @param {string} userId - User ID
 * @param {string} questionId - Question ID
 * @param {string} difficulty - Difficulty rating
 * @param {Object} context - Context object containing subjectId, topicId
 * @returns {Object} Updated statistics
 */
export async function updateStatisticsAfterReview(
  userId,
  questionId,
  difficulty,
  context = {}
) {
  const service = createStatisticsService(userId);
  return await service.updateStatsAfterReview(questionId, difficulty, context);
}

// StatisticsService class is already exported at the top of the file
