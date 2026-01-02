import mongoose, { Schema, Document } from 'mongoose';

export type ReactionEmoji = '❤️' | '😂' | '🎉' | '🥳' | '👍' | '🙌' | '💯' | '😍';

export interface IMessage extends Document {
  activityId: string;
  roomCode: string;
  messages: Array<{
    id: string;
    guestId: string;
    nickname: string;
    content: string;
    reactions: Map<ReactionEmoji, string[]>;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
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
    messages: [{
      id: {
        type: String,
        required: true,
      },
      guestId: {
        type: String,
        required: true,
      },
      nickname: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [280, 'Message must be less than 280 characters'],
      },
      reactions: {
        type: Map,
        of: [String],
        default: new Map(),
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

MessageSchema.index({ roomCode: 1, activityId: 1 });
MessageSchema.index({ roomCode: 1, 'messages.timestamp': -1 });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
