// package-scripts/migrate-users.js
// Simple runner for the user migration script

import { migrateUsersLearningStats } from "../scripts/migrate-users-learning-stats.mjs";

console.log("Running User model migration for learning statistics fields...");

migrateUsersLearningStats()
  .then(() => {
    console.log("✅ Migration completed successfully!");
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
