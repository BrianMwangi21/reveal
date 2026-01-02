import mongoose, { Schema, Document } from 'mongoose';

export interface IGuest extends Document {
  guestId: string;
  roomCode: string;
  nickname: string;
  host: boolean;
  joinedAt: Date;
  lastActive: Date;
}

const GuestSchema = new Schema<IGuest>(
  {
    guestId: {
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
    nickname: {
      type: String,
      required: [true, 'Nickname is required'],
      trim: true,
      maxlength: [12, 'Nickname must be less than 12 characters'],
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
GuestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 172800 });

export default mongoose.models.Guest || mongoose.model<IGuest>('Guest', GuestSchema);
