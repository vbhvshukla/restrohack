import mongoose from "mongoose";

const configSchema = new mongoose.Schema({
  timeInterval: {
    type: Number
  },
  version: {
    type: String,
    trim: true
  },
  weights: {
    bySenior: {
      type: Number
    },
    byJunior: {
      type: Number
    },
    byPeer: {
      type: Number
    },
    byCollaborator: {
      type: Number
    }
  }
}, {
  timestamps: true
});

export const Config = mongoose.model('Config', configSchema);
