import mongoose, { Schema, Document } from 'mongoose';

export interface IBet extends Document {
  activityId: string;
  roomCode: string;
  options: string[];
  bets: Array<{
    guestId: string;
    nickname: string;
    option: string;
    points: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BetSchema = new Schema<IBet>(
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
    options: {
      type: [String],
      required: true,
    },
    bets: [{
      guestId: {
        type: String,
        required: true,
      },
      nickname: {
        type: String,
        required: true,
      },
      option: {
        type: String,
        required: true,
      },
      points: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

BetSchema.index({ roomCode: 1, activityId: 1 });

export default mongoose.models.Bet || mongoose.model<IBet>('Bet', BetSchema);
