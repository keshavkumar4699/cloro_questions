// models/Chain.js (Recommended: Rename file to Chain.js)
import mongoose from "mongoose";

const ChainSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  author: {
    // Optional: track who created the chain
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Consider adding other fields like description, views, followersCount
  views: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
});

// Ensure the model is compiled and exported correctly
export default mongoose.models.Chain || mongoose.model("Chain", ChainSchema);
