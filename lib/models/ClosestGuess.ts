import mongoose, { Schema, Document } from 'mongoose';

export interface IClosestGuess extends Document {
  activityId: string;
  roomCode: string;
  question: string;
  unit: string;
  guesses: Array<{
    guestId: string;
    nickname: string;
    value: number;
    timestamp: Date;
  }>;
  revealedValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ClosestGuessSchema = new Schema<IClosestGuess>(
  {
    activityId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Question must be less than 200 characters'],
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    guesses: [{
      guestId: {
        type: String,
        required: true,
      },
      nickname: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
    revealedValue: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

ClosestGuessSchema.index({ roomCode: 1, activityId: 1 });

export default mongoose.models.ClosestGuess || mongoose.model<IClosestGuess>('ClosestGuess', ClosestGuessSchema);
