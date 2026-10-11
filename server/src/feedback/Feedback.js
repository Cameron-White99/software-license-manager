
import mongoose from 'mongoose';

// Feedback database schema
const feedbackSchema = new mongoose.Schema({
  version: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'software_version',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  comments: {
    type: String,
    required: true,
    trim: true,
    maxlength: [
      1000,
      'Feedback comments cannot exceed 1000 characters.'
    ]
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate feedback for the same user and version
feedbackSchema.index(
  { user: 1, version: 1 },
  { unique: true }
);

export default mongoose.model('feedback', feedbackSchema);
