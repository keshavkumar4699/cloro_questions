import connectMongo from "@/libs/mongoose";
import Question from "@/models/Question";
import User from "@/models/User";
import {
  processQuestionReview,
  isValidDifficulty,
} from "@/libs/spacedRepetition";

export async function POST(req, { params }) {
  try {
    const { userId } = params;
    const { questionId, difficulty } = await req.json();

    // Validate input
    if (!questionId || !difficulty) {
      return Response.json(
        { error: "Question ID and difficulty are required" },
        { status: 400 }
      );
    }

    if (!isValidDifficulty(difficulty)) {
      return Response.json(
        {
          error:
            "Invalid difficulty. Must be one of: no idea, hard, medium, easy",
        },
        { status: 400 }
      );
    }

    await connectMongo();

    // Find the question and verify ownership
    const question = await Question.findOne({
      _id: questionId,
      user: userId,
    });

    if (!question) {
      return Response.json(
        { error: "Question not found or access denied" },
        { status: 404 }
      );
    }

    // Process the review using spaced repetition logic
    const updatedData = processQuestionReview(question, difficulty);

    // Update the question with new spaced repetition data
    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      updatedData,
      { new: true }
    );

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
      $inc: { totalQuestionsAnswered: 1 },
      lastActivityDate: new Date(),
    });

    return Response.json({
      success: true,
      question: updatedQuestion,
      message: "Question reviewed successfully",
    });
  } catch (error) {
    console.error("Error processing question review:", error);
    return Response.json(
      { error: "Failed to process question review" },
      { status: 500 }
    );
  }
}
