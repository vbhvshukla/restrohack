import mongoose from "mongoose";

const positionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Position name is required"],
      trim: true,
      minlength: [2, "Position name must be at least 2 characters"],
      maxlength: [100, "Position name cannot exceed 100 characters"],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s-_]+$/.test(v);
        },
        message:
          "Position name can only contain letters, numbers, spaces, hyphens and underscores",
      },
    },
    level: {
      type: Number,
      required: [true, "Position level is required"],
      min: [1, "Level must be at least 1"],
      max: [10, "Level cannot exceed 10"],
      validate: {
        validator: Number.isInteger,
        message: "Level must be an integer",
      },
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: [true, "Parent position is required"],
      validate: {
        validator: async function (v) {
          if (this.isNew || this.isModified("parentId")) {
            const Position = mongoose.model("Position");
            const parent = await Position.findById(v);
            return !!parent;
          }
          return true;
        },
        message: "Parent position does not exist",
      },
    },
    childId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Position",
        validate: {
          validator: async function (v) {
            const Position = mongoose.model("Position");
            const child = await Position.findById(v);
            return !!child;
          },
          message: "Child position does not exist",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
positionSchema.index({ name: 1 });
positionSchema.index({ level: 1 });
positionSchema.index({ parentId: 1 });
positionSchema.index({ childId: 1 });

// Add compound indexes
positionSchema.index({ name: 1, level: 1 });

// Fix typo in model name from 'Postion' to 'Position'
const Position = mongoose.model("Position", positionSchema);
export { Position, positionSchema };
