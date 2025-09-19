// app/api/content/[userId]/fetchAllQuestions/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Question from "@/models/Question";

export async function GET(request, { params }) {
  try {
    await connectMongo();

    const { userId } = params;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all questions for the user with populated subject and topic data
    const questions = await Question.find({ user: userId })
      .populate({
        path: "subject",
        select: "title emoji color",
      })
      .populate({
        path: "topic",
        select: "title",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching all questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
