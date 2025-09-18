import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";
import './Chain';

// USER SCHEMA
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
    image: {
      type: String,
    },
    chain: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chain'
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
