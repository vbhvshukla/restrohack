import mongoose from "mongoose";

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: Number,
    required: true
  },
}, {
  timestamps: true
});

// Add index for better query performance
positionSchema.index({ parentId: 1 });

const Position = mongoose.model("Position", positionSchema);
export { Position, positionSchema };
