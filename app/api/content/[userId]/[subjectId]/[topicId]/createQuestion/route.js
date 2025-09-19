import connectMongo from "@/libs/mongoose";
import Question from "@/models/Question";
import Topic from "@/models/Topic";
import SpacedRepetition from "@/models/SpacedRepetition";

export async function POST(req, { params }) {
  try {
    const { userId, subjectId, topicId } = params;
    const body = await req.json();

    await connectMongo();

    // Create the question with proper references
    const questionData = {
      ...body,
      user: userId,
      subject: subjectId,
      topic: topicId,
    };

    const question = await Question.create(questionData);

    // Update the topic with the new question
    await Topic.findByIdAndUpdate(
      topicId,
      { $push: { questions: question._id } },
      { new: true }
    );

    // Create spaced repetition entry for the new question
    await SpacedRepetition.create({
      user: userId,
      question: question._id,
      subject: subjectId,
      topic: topicId,
      nextReviewDate: new Date(), // Available for review immediately
      isNew: true,
    });

    return Response.json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    return Response.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
