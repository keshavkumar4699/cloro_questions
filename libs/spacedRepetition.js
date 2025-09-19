// libs/spacedRepetition.js
/**
 * Utility functions for spaced repetition logic
 */

/**
 * Check if a question is due for review
 * @param {Object} question - The question object
 * @returns {boolean} - True if the question is due for review
 */
export const isQuestionDue = (question) => {
  if (!question.nextReviewDate) return true;

  const now = new Date();
  const reviewDate = new Date(question.nextReviewDate);

  return reviewDate <= now;
};

/**
 * Check if a question is new (never reviewed)
 * @param {Object} question - The question object
 * @returns {boolean} - True if the question is new
 */
export const isQuestionNew = (question) => {
  return question.isNew === true || question.reviewCount === 0;
};

/**
 * Get questions that should be displayed (new or due)
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Filtered array of questions that should be displayed
 */
export const getDisplayableQuestions = (questions) => {
  return questions.filter(
    (question) => isQuestionNew(question) || isQuestionDue(question)
  );
};

/**
 * Calculate ease factor adjustment based on difficulty
 * @param {number} currentEase - Current ease factor (default: 2.5)
 * @param {string} difficulty - Difficulty rating ("no idea", "hard", "medium", "easy")
 * @returns {number} - New ease factor within bounds (1.3 - 3.0)
 */
export const calculateEaseFactor = (currentEase = 2.5, difficulty) => {
  // Validate input parameters
  if (
    typeof currentEase !== "number" ||
    currentEase < 1.3 ||
    currentEase > 3.0
  ) {
    currentEase = 2.5; // Reset to default if invalid
  }

  const validDifficulties = ["no idea", "hard", "medium", "easy"];
  if (!validDifficulties.includes(difficulty)) {
    throw new Error(
      `Invalid difficulty: ${difficulty}. Must be one of: ${validDifficulties.join(
        ", "
      )}`
    );
  }

  const adjustments = {
    "no idea": -0.2,
    hard: -0.15,
    medium: 0,
    easy: 0.15,
  };

  let newEase = currentEase + adjustments[difficulty];

  // Keep ease factor within bounds (1.3 - 3.0) as per requirement 4.5
  return Math.max(1.3, Math.min(3.0, newEase));
};

/**
 * Calculate next review interval based on difficulty and ease factor
 * @param {number} currentInterval - Current interval in days (default: 1)
 * @param {number} easeFactor - Current ease factor (default: 2.5)
 * @param {string} difficulty - Difficulty rating ("no idea", "hard", "medium", "easy")
 * @param {boolean} isFirstReview - Whether this is the first review of the question
 * @returns {number} - Next interval in days
 */
export const calculateNextInterval = (
  currentInterval = 1,
  easeFactor = 2.5,
  difficulty,
  isFirstReview = false
) => {
  // Validate input parameters
  const validDifficulties = ["no idea", "hard", "medium", "easy"];
  if (!validDifficulties.includes(difficulty)) {
    throw new Error(
      `Invalid difficulty: ${difficulty}. Must be one of: ${validDifficulties.join(
        ", "
      )}`
    );
  }

  if (typeof currentInterval !== "number" || currentInterval < 1) {
    currentInterval = 1;
  }

  if (typeof easeFactor !== "number" || easeFactor < 1.3 || easeFactor > 3.0) {
    easeFactor = 2.5;
  }

  // Base intervals as per requirements 3.1-3.4
  const baseIntervals = {
    "no idea": 1,
    hard: 2,
    medium: 5,
    easy: 10,
  };

  // For "no idea", always return 1 day regardless of ease factor (requirement 3.1)
  if (difficulty === "no idea") {
    return baseIntervals[difficulty];
  }

  // For first review or when current interval is 1, use base intervals
  if (isFirstReview || currentInterval <= 1) {
    return baseIntervals[difficulty];
  }

  // For subsequent reviews, apply ease factor (requirements 4.6, 4.7)
  // Easy questions use higher ease factors for longer intervals
  // Difficult questions use lower ease factors for shorter intervals
  const adjustedInterval = Math.round(currentInterval * easeFactor);

  // Ensure minimum intervals based on difficulty
  return Math.max(baseIntervals[difficulty], adjustedInterval);
};

/**
 * Calculate next review date based on interval
 * @param {number} intervalDays - Interval in days
 * @param {Date} fromDate - Base date to calculate from (default: current date)
 * @returns {Date} - Next review date
 */
export const calculateNextReviewDate = (
  intervalDays,
  fromDate = new Date()
) => {
  // Validate input parameters
  if (typeof intervalDays !== "number" || intervalDays < 1) {
    intervalDays = 1;
  }

  if (!(fromDate instanceof Date) || isNaN(fromDate.getTime())) {
    fromDate = new Date();
  }

  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate;
};

/**
 * Process a question review and calculate all updated values
 * @param {Object} question - The question object with current spaced repetition data
 * @param {string} difficulty - Difficulty rating ("no idea", "hard", "medium", "easy")
 * @returns {Object} - Updated spaced repetition data
 */
export const processQuestionReview = (question, difficulty) => {
  // Validate input
  const validDifficulties = ["no idea", "hard", "medium", "easy"];
  if (!validDifficulties.includes(difficulty)) {
    throw new Error(
      `Invalid difficulty: ${difficulty}. Must be one of: ${validDifficulties.join(
        ", "
      )}`
    );
  }

  // Get current values with defaults
  const currentEaseFactor = question.easeFactor || 2.5;
  const currentInterval = question.interval || 1;
  const reviewCount = (question.reviewCount || 0) + 1;
  const isFirstReview = reviewCount === 1;

  // Calculate new ease factor
  const newEaseFactor = calculateEaseFactor(currentEaseFactor, difficulty);

  // Calculate new interval
  const newInterval = calculateNextInterval(
    currentInterval,
    newEaseFactor,
    difficulty,
    isFirstReview
  );

  // Calculate next review date
  const nextReviewDate = calculateNextReviewDate(newInterval);

  // Return updated spaced repetition data
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate,
    lastReviewDate: new Date(),
    reviewCount,
    lastDifficulty: difficulty,
    isNew: false, // Question is no longer new after first review
  };
};
/**
 * Validate ease factor value
 * @param {number} easeFactor - Ease factor to validate
 * @returns {boolean} - True if valid
 */
export const isValidEaseFactor = (easeFactor) => {
  return (
    typeof easeFactor === "number" && easeFactor >= 1.3 && easeFactor <= 3.0
  );
};

/**
 * Validate difficulty rating
 * @param {string} difficulty - Difficulty rating to validate
 * @returns {boolean} - True if valid
 */
export const isValidDifficulty = (difficulty) => {
  const validDifficulties = ["no idea", "hard", "medium", "easy"];
  return validDifficulties.includes(difficulty);
};

/**
 * Get default spaced repetition data for a new question
 * @returns {Object} - Default spaced repetition data
 */
export const getDefaultSpacedRepetitionData = () => {
  return {
    nextReviewDate: new Date(), // Available immediately for new questions
    lastReviewDate: null,
    reviewCount: 0,
    interval: 1,
    easeFactor: 2.5,
    lastDifficulty: null,
    isNew: true,
  };
};

/**
 * Check if a question should be shown based on its review status
 * @param {Object} question - The question object
 * @returns {boolean} - True if question should be displayed
 */
export const shouldShowQuestion = (question) => {
  // Show new questions
  if (isQuestionNew(question)) {
    return true;
  }

  // Show due questions
  if (isQuestionDue(question)) {
    return true;
  }

  // Hide future questions
  return false;
};
