// models/Post.js
import mongoose from "mongoose";
import "./Topic";

const SubjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  topics: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
  ],
  color: {
    type: String,
    default: "#000000",
  },
  emoji: {
    type: String,
    default: "📚",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
