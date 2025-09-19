// app/api/migrate-users/route.js
// API route to run user migration for learning statistics

import mongoose from "mongoose";
import connectMongo from "../../../libs/mongoose.js";

export async function POST() {
  try {
    console.log(
      "Starting migration: Adding learning statistics fields to existing users..."
    );

    // Connect to MongoDB
    await connectMongo();

    // Get the users collection directly
    const usersCollection = mongoose.connection.db.collection("users");

    // Count existing users without learning statistics fields
    const usersToMigrate = await usersCollection.countDocuments({
      totalQuestionsAnswered: { $exists: false },
    });

    console.log(`Found ${usersToMigrate} users to migrate`);

    if (usersToMigrate === 0) {
      return Response.json({
        success: true,
        message:
          "No users need migration. All users already have learning statistics fields.",
        migratedCount: 0,
      });
    }

    // Update all users that don't have learning statistics fields
    const result = await usersCollection.updateMany(
      {
        totalQuestionsAnswered: { $exists: false },
      },
      {
        $set: {
          totalQuestionsAnswered: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          dailyActivity: [],
        },
      }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Modified ${result.modifiedCount} users`);
    console.log(`Matched ${result.matchedCount} users`);

    // Verify the migration
    const verificationCount = await usersCollection.countDocuments({
      totalQuestionsAnswered: { $exists: true },
      currentStreak: { $exists: true },
      longestStreak: { $exists: true },
      lastActivityDate: { $exists: true },
      dailyActivity: { $exists: true },
    });

    console.log(
      `Verification: ${verificationCount} users now have learning statistics fields`
    );

    return Response.json({
      success: true,
      message: "Migration completed successfully!",
      migratedCount: result.modifiedCount,
      verificationCount: verificationCount,
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
