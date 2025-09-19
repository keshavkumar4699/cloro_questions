// package-scripts/migrate-questions.js
// Simple runner for the question migration script

import { migrateQuestionsSpacedRepetition } from "../scripts/migrate-questions-spaced-repetition.js";

console.log("Running Question model migration for spaced repetition fields...");

migrateQuestionsSpacedRepetition()
  .then(() => {
    console.log("✅ Migration completed successfully!");
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
