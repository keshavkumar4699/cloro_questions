// models/SpacedRepetition.js
import mongoose from "mongoose";

const SpacedRepetitionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["again", "hard", "medium", "easy"],
    default: "medium",
  },
  nextReviewDate: {
    type: Date,
    default: Date.now,
  },
  lastReviewDate: {
    type: Date,
    default: null,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  interval: {
    type: Number,
    default: 1, // days
  },
  easeFactor: {
    type: Number,
    default: 2.5,
  },
  isNew: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
SpacedRepetitionSchema.index({ user: 1, nextReviewDate: 1 });
SpacedRepetitionSchema.index({ user: 1, subject: 1, topic: 1 });

export default mongoose.models.SpacedRepetition ||
  mongoose.model("SpacedRepetition", SpacedRepetitionSchema);
