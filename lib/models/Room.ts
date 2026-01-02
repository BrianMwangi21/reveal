import mongoose, { Schema, Document } from 'mongoose';

export type RevealType = 'gender' | 'baby' | 'birthday' | 'anniversary' | 'custom';

export type RevealStatus = 'upcoming' | 'active' | 'revealed' | 'archived';

export interface RevealContent {
  type: 'text' | 'image' | 'video';
  value: string;
  caption?: string;
}

export interface Host {
  id: string;
  nickname: string;
}

export interface IRoom extends Document {
  name: string;
  code: string;
  revealTime: Date;
  revealType: RevealType;
  revealContent: RevealContent;
  host: Host;
  status: RevealStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      minlength: [1, 'Room name must be at least 1 character'],
      maxlength: [100, 'Room name must be less than 100 characters'],
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: false,
      trim: true,
    },
    revealTime: {
      type: Date,
      required: [true, 'Reveal time is required'],
    },
    revealType: {
      type: String,
      required: true,
      enum: ['gender', 'baby', 'birthday', 'anniversary', 'custom'],
    },
    revealContent: {
      type: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text',
      },
      value: {
        type: String,
        required: true,
      },
      caption: {
        type: String,
        trim: true,
        maxlength: [500, 'Caption must be less than 500 characters'],
      },
    },
    host: {
      id: {
        type: String,
        required: true,
      },
      nickname: {
        type: String,
        required: true,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'revealed', 'archived'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ host: 1 });
RoomSchema.index({ revealTime: 1 });

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
