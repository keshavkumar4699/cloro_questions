// Simple test script to verify ease factor calculations
import {
  calculateEaseFactor,
  calculateNextInterval,
  calculateNextReviewDate,
  processQuestionReview,
  isValidEaseFactor,
  isValidDifficulty,
  getDefaultSpacedRepetitionData,
} from "./libs/spacedRepetition.js";

console.log("Testing Ease Factor Calculation Service...\n");

// Test 1: Ease factor calculations
console.log("=== Test 1: Ease Factor Calculations ===");
const testEaseFactor = 2.5;

console.log(`Starting ease factor: ${testEaseFactor}`);
console.log(
  `"no idea" adjustment: ${calculateEaseFactor(
    testEaseFactor,
    "no idea"
  )} (should be 2.3)`
);
console.log(
  `"hard" adjustment: ${calculateEaseFactor(
    testEaseFactor,
    "hard"
  )} (should be 2.35)`
);
console.log(
  `"medium" adjustment: ${calculateEaseFactor(
    testEaseFactor,
    "medium"
  )} (should be 2.5)`
);
console.log(
  `"easy" adjustment: ${calculateEaseFactor(
    testEaseFactor,
    "easy"
  )} (should be 2.65)`
);

// Test boundary conditions
console.log(
  `\nBoundary test - very low ease factor (1.3) with "no idea": ${calculateEaseFactor(
    1.3,
    "no idea"
  )} (should be 1.3)`
);
console.log(
  `Boundary test - very high ease factor (3.0) with "easy": ${calculateEaseFactor(
    3.0,
    "easy"
  )} (should be 3.0)`
);

// Test 2: Interval calculations
console.log("\n=== Test 2: Interval Calculations ===");
console.log(
  `First review "no idea": ${calculateNextInterval(
    1,
    2.5,
    "no idea",
    true
  )} days (should be 1)`
);
console.log(
  `First review "hard": ${calculateNextInterval(
    1,
    2.5,
    "hard",
    true
  )} days (should be 2)`
);
console.log(
  `First review "medium": ${calculateNextInterval(
    1,
    2.5,
    "medium",
    true
  )} days (should be 5)`
);
console.log(
  `First review "easy": ${calculateNextInterval(
    1,
    2.5,
    "easy",
    true
  )} days (should be 10)`
);

console.log(
  `\nSecond review "easy" (interval 10, ease 2.65): ${calculateNextInterval(
    10,
    2.65,
    "easy",
    false
  )} days (should be ~27)`
);
console.log(
  `Second review "hard" (interval 2, ease 2.35): ${calculateNextInterval(
    2,
    2.35,
    "hard",
    false
  )} days (should be ~5)`
);

// Test 3: Complete question review processing
console.log("\n=== Test 3: Complete Question Review Processing ===");
const mockQuestion = {
  easeFactor: 2.5,
  interval: 1,
  reviewCount: 0,
  isNew: true,
};

console.log('Processing first review with "medium" difficulty:');
const result = processQuestionReview(mockQuestion, "medium");
console.log(`New ease factor: ${result.easeFactor} (should be 2.5)`);
console.log(`New interval: ${result.interval} (should be 5)`);
console.log(`Review count: ${result.reviewCount} (should be 1)`);
console.log(`Is new: ${result.isNew} (should be false)`);
console.log(`Next review date: ${result.nextReviewDate.toDateString()}`);

// Test 4: Validation functions
console.log("\n=== Test 4: Validation Functions ===");
console.log(
  `Valid ease factor 2.5: ${isValidEaseFactor(2.5)} (should be true)`
);
console.log(
  `Invalid ease factor 0.5: ${isValidEaseFactor(0.5)} (should be false)`
);
console.log(
  `Valid difficulty "easy": ${isValidDifficulty("easy")} (should be true)`
);
console.log(
  `Invalid difficulty "super easy": ${isValidDifficulty(
    "super easy"
  )} (should be false)`
);

// Test 5: Default data
console.log("\n=== Test 5: Default Spaced Repetition Data ===");
const defaultData = getDefaultSpacedRepetitionData();
console.log("Default data:", defaultData);

console.log("\n✅ All tests completed successfully!");
