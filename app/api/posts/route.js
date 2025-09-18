// app/api/posts/route.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // For ObjectId validation
import { authOptions } from "@/libs/next-auth";
import Post from "@/models/Post";
import Chain from "@/models/Chain"; // Import the Chain model
import User from "@/models/User"; // Import User model (optional, for author validation if needed beyond session)
import connectMongo from "@/libs/mongoose";

// --- Helper for Image Upload (Placeholder - Implement your actual upload logic) ---
async function uploadToStorage(file) {
  // This is a critical part you need to implement based on your chosen storage service.
  // Example for Cloudinary:
  /*
  if (!file || typeof file.arrayBuffer !== 'function') {
    console.log("No valid file provided to uploadToStorage");
    return null;
  }
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    const base64Data = fileBuffer.toString('base64');
    const fileUri = 'data:' + mimeType + ';base64,' + base64Data;

    const cloudinary = require('cloudinary').v2; // npm install cloudinary
    cloudinary.config({ 
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const result = await cloudinary.uploader.upload(fileUri, {
      folder: 'posts', // Optional: organize in a folder
      // public_id: `post_${Date.now()}`, // Optional: custom public_id
      // transformation: [{ width: 1000, height: 1000, crop: "limit" }] // Optional: transformations
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null; // Or throw the error to be caught by the main handler
  }
  */
  console.warn(
    "Using placeholder image upload. Implement actual storage solution."
  );
  if (file && typeof file.arrayBuffer === "function") {
    return `https://via.placeholder.com/800x600.png?text=Uploaded+${encodeURIComponent(
      file.name || "image"
    )}`;
  }
  return null;
}
// --- END Helper for Image Upload ---

// GET all posts
export async function GET() {
  await connectMongo();
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("author", "name email image username") // Added username
      .populate("chain", "_id title") // Populate chain _id and title
      .lean() // Use .lean() for faster queries if you don't need Mongoose documents
      .exec();

    // Ensure chainId is directly available on post object for frontend convenience
    const postsWithChainId = posts.map((post) => ({
      ...post,
      chainId: post.chain?._id?.toString() || null, // Make chainId easily accessible
    }));

    return NextResponse.json(postsWithChainId);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", details: error.message },
      { status: 500 }
    );
  }
}

// CREATE a new post
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    // Ensure session.user.id exists
    return NextResponse.json(
      { error: "Unauthorized. User session or ID not found." },
      { status: 401 }
    );
  }

  await connectMongo();

  try {
    const formData = await request.formData();

    const title = formData.get("title")?.toString().trim();
    const content = formData.get("content")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    const imageFile = formData.get("image"); // This is a File object

    // Chain related data (from PostModal.js state)
    let chainTitleFromForm = formData.get("chainTitle")?.toString().trim();
    let chainIdFromForm = formData.get("chainId")?.toString().trim();

    // --- Basic Validations ---
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required." },
        { status: 400 }
      );
    }
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Title cannot exceed 100 characters." },
        { status: 400 }
      );
    }

    // --- Image Upload ---
    let imageUrl = null;
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      imageUrl = await uploadToStorage(imageFile);
      if (!imageUrl) {
        // Decide if image upload failure should stop post creation or just proceed without image
        console.warn(
          "Image upload failed or returned null, proceeding without image."
        );
      }
    }

    // --- Chain Handling ---
    let associatedChainId = null;
    if (chainIdFromForm && mongoose.Types.ObjectId.isValid(chainIdFromForm)) {
      const existingChain = await Chain.findById(chainIdFromForm);
      if (!existingChain) {
        // This case might be rare if chainIdFromForm comes from a selection of existing chains
        // but chainTitleFromForm should be used to create one if ID is invalid/not found
        console.warn(
          `Chain with ID ${chainIdFromForm} not found. Attempting to use chainTitle.`
        );
        // Fall through to create/find by title if chainIdFromForm was invalid or not found
      } else {
        associatedChainId = existingChain._id;
      }
    }

    // If no valid chainIdFromForm was found or provided, try to use chainTitleFromForm
    if (!associatedChainId && chainTitleFromForm) {
      let chain = await Chain.findOne({
        title: { $regex: new RegExp(`^${chainTitleFromForm}$`, "i") },
      }); // Case-insensitive find
      if (chain) {
        associatedChainId = chain._id;
      } else {
        // Create new chain
        const newChain = new Chain({
          title: chainTitleFromForm,
          author: session.user.id, // Current user creates the chain
        });
        await newChain.save();
        associatedChainId = newChain._id;
      }
    }

    // --- Create and Save Post ---
    const newPostData = {
      title,
      content,
      category,
      author: session.user.id,
      imageUrl,
    };
    if (associatedChainId) {
      newPostData.chain = associatedChainId;
    }

    const newPost = new Post(newPostData);
    await newPost.save();

    // --- Update Chain with New Post (if associated) ---
    if (associatedChainId) {
      await Chain.findByIdAndUpdate(
        associatedChainId,
        { $addToSet: { posts: newPost._id } }, // Use $addToSet to prevent duplicates
        { new: true } // Optional: to get the updated chain doc
      );
    }

    // --- Populate and Return New Post ---
    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "name email image username")
      .populate("chain", "_id title")
      .lean(); // Use .lean() for plain JS object

    const responsePost = {
      ...populatedPost,
      chainId: populatedPost.chain?._id?.toString() || null,
    };

    return NextResponse.json(responsePost, { status: 201 });
  } catch (error) {
    console.error("Post creation error:", error);
    let errorMessage = "Failed to create post.";
    if (error.name === "ValidationError") {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: error.name === "ValidationError" ? 400 : 500 }
    );
  }
}
