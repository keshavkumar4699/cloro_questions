// libs/statisticsUtils.js
// Utility functions for working with statistics in the frontend

/**
 * Build statistics API URL with context parameters
 * @param {string} userId - User ID
 * @param {Object} context - Context object containing subjectId, topicId, period
 * @returns {string} API URL with query parameters
 */
export function buildStatsApiUrl(userId, context = {}) {
  const baseUrl = `/api/spaced-repetition/${userId}/stats`;
  const params = new URLSearchParams();

  if (context.topicId) {
    params.append("topicId", context.topicId);
  } else if (context.subjectId) {
    params.append("subjectId", context.subjectId);
  }

  if (context.period) {
    params.append("period", context.period.toString());
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Fetch comprehensive statistics with context awareness
 * @param {string} userId - User ID
 * @param {Object} context - Context object containing subjectId, topicId, period
 * @returns {Promise<Object>} Statistics object
 */
export async function fetchComprehensiveStats(userId, context = {}) {
  try {
    const url = buildStatsApiUrl(userId, context);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching comprehensive statistics:", error);
    throw error;
  }
}

/**
 * Get context from current page/route
 * @param {string} pathname - Current page pathname
 * @param {Object} params - Route parameters
 * @returns {Object} Context object with subjectId, topicId if applicable
 */
export function getContextFromRoute(pathname, params = {}) {
  const context = {};

  // Extract context from pathname patterns
  if (pathname.includes("/topic/") && params.topicId) {
    context.topicId = params.topicId;
  } else if (pathname.includes("/subject/") && params.subjectId) {
    context.subjectId = params.subjectId;
  }

  return context;
}

/**
 * Format statistics for display
 * @param {Object} stats - Raw statistics object
 * @returns {Object} Formatted statistics for UI display
 */
export function formatStatsForDisplay(stats) {
  if (!stats) return null;

  return {
    totalQuestions: {
      value: stats.totalQuestions || 0,
      label: getContextLabel(stats.context, "Total Questions"),
      subtitle: getContextSubtitle(stats.context),
    },
    dueQuestions: {
      value: stats.dueQuestions || 0,
      label: "Due Questions",
      subtitle: `${stats.newQuestions || 0} new, ${
        stats.reviewQuestions || 0
      } review`,
    },
    retentionRate: {
      value: `${stats.retentionRate || 0}%`,
      label: "Retention Rate",
      subtitle: "Last 30 days success rate",
    },
    currentStreak: {
      value: stats.currentStreak || 0,
      label: "Current Streak",
      subtitle: `Longest: ${stats.longestStreak || 0} days`,
    },
    dailyAttempted: {
      value: stats.dailyAttempted || 0,
      label: "Today's Progress",
      subtitle: "Questions attempted",
    },
  };
}

/**
 * Get context-appropriate label for statistics
 * @param {Object} context - Context information from statistics
 * @param {string} baseLabel - Base label text
 * @returns {string} Context-appropriate label
 */
function getContextLabel(context, baseLabel) {
  if (!context) return baseLabel;

  if (context.isTopicSpecific) {
    return `${baseLabel} (Topic)`;
  } else if (context.isSubjectSpecific) {
    return `${baseLabel} (Subject)`;
  }

  return baseLabel;
}

/**
 * Get context-appropriate subtitle for statistics
 * @param {Object} context - Context information from statistics
 * @returns {string} Context-appropriate subtitle
 */
function getContextSubtitle(context) {
  if (!context) return "All questions";

  if (context.isTopicSpecific) {
    return "In this topic";
  } else if (context.isSubjectSpecific) {
    return "In this subject";
  }

  return "All questions";
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {Object} Change object with percentage and direction
 */
export function calculatePercentageChange(current, previous) {
  if (previous === 0) {
    return { percentage: current > 0 ? 100 : 0, direction: "up", isNew: true };
  }

  const change = ((current - previous) / previous) * 100;

  return {
    percentage: Math.abs(Math.round(change)),
    direction: change >= 0 ? "up" : "down",
    isNew: false,
  };
}

/**
 * Get statistics trend data for charts/visualizations
 * @param {Array} dailyActivity - Array of daily activity data
 * @param {number} days - Number of days to include (default: 7)
 * @returns {Array} Trend data for the specified period
 */
export function getStatsTrendData(dailyActivity = [], days = 7) {
  const today = new Date();
  const trendData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const activity = dailyActivity.find(
      (activity) =>
        new Date(activity.date).toDateString() === date.toDateString()
    );

    trendData.push({
      date: date.toISOString().split("T")[0], // YYYY-MM-DD format
      questionsAnswered: activity?.questionsAnswered || 0,
      dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }

  return trendData;
}

/**
 * Validate statistics data structure
 * @param {Object} stats - Statistics object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateStatsData(stats) {
  if (!stats || typeof stats !== "object") return false;

  const requiredFields = [
    "totalQuestions",
    "dueQuestions",
    "newQuestions",
    "reviewQuestions",
    "retentionRate",
  ];

  return requiredFields.every(
    (field) => typeof stats[field] === "number" && stats[field] >= 0
  );
}

/**
 * Get default/empty statistics object
 * @returns {Object} Default statistics object
 */
export function getDefaultStats() {
  return {
    totalQuestions: 0,
    dueQuestions: 0,
    newQuestions: 0,
    reviewQuestions: 0,
    retentionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    dailyAttempted: 0,
    context: {
      isGlobal: true,
      isSubjectSpecific: false,
      isTopicSpecific: false,
    },
  };
}
