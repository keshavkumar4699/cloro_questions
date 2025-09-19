// scripts/migrate-questions-spaced-repetition.js
// Migration script to add spaced repetition fields to existing questions

import mongoose from "mongoose";
import { connectMongo } from "../libs/mongo.js";

const migrateQuestionsSpacedRepetition = async () => {
  try {
    console.log(
      "Starting migration: Adding spaced repetition fields to existing questions..."
    );

    // Connect to MongoDB
    await connectMongo();

    // Get the questions collection directly
    const questionsCollection = mongoose.connection.db.collection("questions");

    // Count existing questions without spaced repetition fields
    const questionsToMigrate = await questionsCollection.countDocuments({
      nextReviewDate: { $exists: false },
    });

    console.log(`Found ${questionsToMigrate} questions to migrate`);

    if (questionsToMigrate === 0) {
      console.log(
        "No questions need migration. All questions already have spaced repetition fields."
      );
      return;
    }

    // Update all questions that don't have spaced repetition fields
    const result = await questionsCollection.updateMany(
      {
        nextReviewDate: { $exists: false },
      },
      {
        $set: {
          nextReviewDate: new Date(),
          lastReviewDate: null,
          reviewCount: 0,
          interval: 1,
          easeFactor: 2.5,
          lastDifficulty: null,
          isNew: true,
        },
      }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Modified ${result.modifiedCount} questions`);
    console.log(`Matched ${result.matchedCount} questions`);

    // Verify the migration
    const verificationCount = await questionsCollection.countDocuments({
      nextReviewDate: { $exists: true },
      reviewCount: { $exists: true },
      easeFactor: { $exists: true },
    });

    console.log(
      `Verification: ${verificationCount} questions now have spaced repetition fields`
    );
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateQuestionsSpacedRepetition()
    .then(() => {
      console.log("Migration script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateQuestionsSpacedRepetition };
