import connectMongo from "@/libs/mongoose";
import Question from "@/models/Question";

export async function GET(req, { params }) {
  try {
    const { userId, subjectId, topicId } = params;

    await connectMongo();

    const currentDate = new Date();
    // Set current date to end of day to include questions due today
    const endOfToday = new Date(currentDate);
    endOfToday.setHours(23, 59, 59, 999);

    // Find questions that are either new or due for review
    // Hide future questions from main view
    const questions = await Question.find({
      topic: topicId,
      user: userId,
      $or: [
        { isNew: true }, // Show all new questions
        {
          isNew: false,
          nextReviewDate: { $lte: endOfToday }, // Show due questions (including today)
        },
      ],
    }).sort({
      // Sort by: new questions first, then by next review date (oldest due first)
      isNew: -1,
      nextReviewDate: 1,
    });

    return Response.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return Response.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
