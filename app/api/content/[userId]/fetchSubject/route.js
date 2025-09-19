// app/api/content/[userId]/fetchSubjects/route.js
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

    const { userId } = params;

    // Verify that the user is the same as the session user
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if the user exists and populate with subjects
    const user = await User.findById(userId)
      .populate({
        path: 'subjects',
        options: { sort: { createdAt: -1 } }
      });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the populated subjects
    return NextResponse.json(user.subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}