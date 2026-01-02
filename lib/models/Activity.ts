import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType = 'bet' | 'closestGuess' | 'message';

export interface IActivity extends Document {
  activityId: string;
  roomCode: string;
  type: ActivityType;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
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
    type: {
      type: String,
      required: true,
      enum: ['bet', 'closestGuess', 'message'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Title must be less than 100 characters'],
    },
  },
  {
    timestamps: true,
  }
);

ActivitySchema.index({ roomCode: 1, type: 1 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
