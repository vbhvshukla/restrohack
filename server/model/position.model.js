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

// Add index for better query performance
positionSchema.index({ level: 1 });
positionSchema.index({ name: 1 });

const Position = mongoose.model("Position", positionSchema);
export { Position, positionSchema };
