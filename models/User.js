import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";
import "./Subject";
import "./Question";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    password: {
      type: String,
    },
    subjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    }],
    questions:[{
      type: mongoose.Schema.Types.ObjectId,
      ref:'Question'
    }],
    image: {
      type: String,
    },
    retentionRate: { type: Number, default: 0 }, // Calculated field
    dailyStats: [
      {
        date: Date,
        attempted: Number
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
