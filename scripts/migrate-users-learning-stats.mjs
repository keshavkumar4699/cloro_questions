// scripts/migrate-users-learning-stats.mjs
// Migration script to add learning statistics fields to existing users

import mongoose from "mongoose";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local
const envPath = join(process.cwd(), ".env.local");
try {
  const envFile = readFileSync(envPath, "utf8");
  const envVars = envFile
    .split("\n")
    .filter((line) => line.includes("=") && !line.startsWith("#"));
  envVars.forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    const value = valueParts.join("=").trim();
    if (key && value) {
      process.env[key.trim()] = value;
    }
  });
} catch (error) {
  console.warn("Could not load .env.local file:", error.message);
}

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }
  return mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((e) => console.error("Mongoose Client Error: " + e.message));
};

const migrateUsersLearningStats = async () => {
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
      console.log(
        "No users need migration. All users already have learning statistics fields."
      );
      return;
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
console.log("Starting migration script...");
migrateUsersLearningStats()
  .then(() => {
    console.log("Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });

export { migrateUsersLearningStats };
