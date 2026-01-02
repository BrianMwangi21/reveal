import mongoose, { Schema, Document } from 'mongoose';

export interface IGuest extends Document {
  roomCode: string;
  nickname: string;
  host: boolean;
  joinedAt: Date;
  lastActive: Date;
}

const GuestSchema = new Schema<IGuest>(
  {
    roomCode: {
      type: String,
      required: true,
      index: true,
    },
    nickname: {
      type: String,
      required: [true, 'Nickname is required'],
      trim: true,
      minlength: [1, 'Nickname must be at least 1 character'],
      maxlength: [30, 'Nickname must be less than 30 characters'],
    },
    host: {
      type: Boolean,
      default: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

GuestSchema.index({ roomCode: 1, nickname: 1 }, { unique: true });
GuestSchema.index({ roomCode: 1, host: 1 });

export default mongoose.models.Guest || mongoose.model<IGuest>('Guest', GuestSchema);
