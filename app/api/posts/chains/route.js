// app/api/posts/chains/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import Chain from "@/models/Chain";
import User from "@/models/User"; // Needed if you want to validate authorId against User model
import connectMongo from "@/libs/mongoose";

export async function POST(request) {
  try {
    await connectMongo();
    const { title, authorId } = await request.json(); // Expect title and optional authorId

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Valid title is required to create a chain." },
        { status: 400 }
      );
    }

    // Check if a chain with this title already exists (case-insensitive)
    const existingChain = await Chain.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, "i") },
    });
    if (existingChain) {
      return NextResponse.json(
        {
          error: "A chain with this title already exists.",
          chain: existingChain,
        },
        { status: 409 } // 409 Conflict
      );
    }

    const chainData = { title: title.trim() };
    if (authorId) {
      if (!mongoose.Types.ObjectId.isValid(authorId)) {
        return NextResponse.json(
          { error: "Invalid author ID provided." },
          { status: 400 }
        );
      }
      // Optional: You could also check if a user with this authorId actually exists
      // const authorExists = await User.findById(authorId);
      // if (!authorExists) {
      //   return NextResponse.json({ error: "Author not found." }, { status: 404 });
      // }
      chainData.author = authorId; // Assuming 'author' field in your Chain model schema
    }

    const newChain = new Chain(chainData);
    await newChain.save();
    return NextResponse.json(newChain, { status: 201 });
  } catch (error) {
    console.error("Failed to create chain:", error);
    if (error.code === 11000) {
      // Mongoose duplicate key error
      return NextResponse.json(
        {
          error:
            "A chain with this title already exists (database constraint).",
          details: error.message,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create chain", details: error.message },
      { status: 500 }
    );
  }
}

// --- GET function remains the same as you provided ---
export async function GET(request) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chainId");
    const searchTerm = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit"), 10) || 10; // Added limit for search

    if (chainId) {
      const chain = await Chain.findById(chainId)
        .select("title posts views followersCount createdAt description") // Added description
        .populate({
          path: "posts",
          select: "title content createdAt author imageUrl views category", // Added category
          options: { sort: { createdAt: -1 } }, // Default sort for posts in a chain
          populate: {
            path: "author",
            model: User,
            select: "name username image",
          },
        });

      if (!chain) {
        return NextResponse.json({ error: "Chain not found" }, { status: 404 });
      }
      return NextResponse.json(chain);
    }

    if (searchTerm) {
      const chains = await Chain.find({
        title: { $regex: searchTerm, $options: "i" },
      })
        .select("title _id posts") // Returning posts array count could be useful: postsCount
        .limit(limit); // Apply limit to search results

      // If you want to return post count instead of full posts array for search results:
      // const chainsWithPostCount = await Promise.all(chains.map(async (chain) => {
      //   return { ...chain.toObject(), postsCount: chain.posts.length };
      // }));
      // return NextResponse.json(chainsWithPostCount);

      return NextResponse.json(chains);
    }

    const allChains = await Chain.find()
      .select("title _id views followersCount createdAt") // Add createdAt for sorting possibilities
      .sort({ createdAt: -1 });
    return NextResponse.json(allChains);
  } catch (error) {
    console.error("Chain fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chains", details: error.message },
      { status: 500 }
    );
  }
}
