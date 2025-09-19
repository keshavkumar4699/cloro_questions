// app/api/content/[subjectId]/fetchTopics/route.js
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import Subject from "@/models/Subject";
import User from "@/models/User";
import { authOptions } from "@/libs/next-auth";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = params;

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all topics for this subject
    const subject = await Subject.findById(subjectId).populate({
      path: "topics",
      options: { sort: { createdAt: -1 } },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject.topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
