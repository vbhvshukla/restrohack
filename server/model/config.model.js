import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  timeInterval: {
    type: Number,
    required: [true, 'Time interval is required'],
    min: [1000, 'Time interval must be at least 1000 milliseconds (1 second)']
  },
  version: {
    type: String,
    required: [true, 'Version is required'],
    trim: true
  },
  weights: {
    bySenior: {
      type: Number,
      required: [true, 'Senior weight is required'],
      min: [0, 'Weight cannot be negative']
    },
    byJunior: {
      type: Number,
      required: [true, 'Junior weight is required'],
      min: [0, 'Weight cannot be negative']
    },
    byPeer: {
      type: Number,
      required: [true, 'Peer weight is required'],
      min: [0, 'Weight cannot be negative']
    },
    byCollaborator: {
      type: Number,
      required: [true, 'Collaborator weight is required'],
      min: [0, 'Weight cannot be negative']
    }
  }
}, {
  timestamps: true
});

export const Config = mongoose.model('Config', configSchema);
