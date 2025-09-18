// models/Post.js
import mongoose from "mongoose";
import "./User";
import "./Chain"

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["technology", "lifestyle", "education"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  chain:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chain"
  },
  imageUrl: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
