import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import Subject from "@/models/Subject";
import User from "@/models/User";
import { authOptions } from "@/libs/next-auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, title, color, emoji } = await req.json();

    if (!name && !title) {
      return NextResponse.json(
        { error: "Name or title is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subject = new Subject({
      title: title || name,
      description,
      color,
      emoji,
      userId: user._id,
    });

    await subject.save();

    // Update the user's subjects array
    await User.findByIdAndUpdate(userId, {
      $push: { subjects: subject._id },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error("Error in subject creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
