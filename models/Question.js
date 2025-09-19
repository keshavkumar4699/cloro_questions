// models/Question.js
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  important: {
    type: Boolean,
    default: false,
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Spaced repetition fields
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
    min: 0,
  },
  interval: {
    type: Number,
    default: 1,
    min: 1,
  },
  easeFactor: {
    type: Number,
    default: 2.5,
    min: 1.3,
    max: 3.0,
  },
  lastDifficulty: {
    type: String,
    enum: ["no idea", "hard", "medium", "easy"],
    default: null,
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

// Add indexes for efficient spaced repetition queries
QuestionSchema.index({ user: 1, nextReviewDate: 1 });
QuestionSchema.index({ user: 1, topic: 1, nextReviewDate: 1 });
QuestionSchema.index({ user: 1, subject: 1, nextReviewDate: 1 });
QuestionSchema.index({ user: 1, isNew: 1 });

// Add validation for ease factor boundaries
QuestionSchema.pre("save", function (next) {
  // Ensure ease factor stays within bounds
  if (this.easeFactor < 1.3) {
    this.easeFactor = 1.3;
  } else if (this.easeFactor > 3.0) {
    this.easeFactor = 3.0;
  }

  // Ensure interval is at least 1
  if (this.interval < 1) {
    this.interval = 1;
  }

  // Ensure reviewCount is not negative
  if (this.reviewCount < 0) {
    this.reviewCount = 0;
  }

  next();
});

export default mongoose.models.Question ||
  mongoose.model("Question", QuestionSchema);
