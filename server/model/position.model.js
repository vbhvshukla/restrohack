import mongoose from "mongoose";

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Position = mongoose.model("Position", positionSchema);
export { Position, positionSchema };
