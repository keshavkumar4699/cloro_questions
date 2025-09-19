import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import Topic from "@/models/Topic";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { subjectId } = params;
    const { title } = await request.json();

    const newTopic = new Topic({
      title,
      subject: subjectId,
      // questions will be an empty array by default due to the schema
    });

    await newTopic.save();
    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { message: "Failed to create topic" },
      { status: 500 }
    );
  }
}
