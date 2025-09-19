import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import Topic from "@/models/Topic";
import Subject from "@/models/Subject";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { subjectId } = params;
    const { title } = await request.json();

    // Check if subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 }
      );
    }

    // Create new topic
    const newTopic = new Topic({
      title,
      subject: subjectId,
    });

    // Save the topic
    await newTopic.save();

    // Update the subject's topics array
    await Subject.findByIdAndUpdate(
      subjectId,
      { $push: { topics: newTopic._id } }
    );

    return NextResponse.json({message: "topic created"}, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { message: "Failed to create topic" },
      { status: 500 }
    );
  }
}