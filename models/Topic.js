// models/Post.js
import mongoose from "mongoose";
import './Question'

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  questions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Topic || mongoose.model("Topic", TopicSchema);
