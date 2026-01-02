import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name must be less than 100 characters'),
  revealTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).refine((val) => new Date(val) > new Date(), {
    message: 'Reveal time must be in the future',
  }),
  revealType: z.enum(['gender', 'baby', 'birthday', 'anniversary', 'custom']),
  revealContent: z.object({
    type: z.enum(['text', 'image', 'video']).default('text'),
    value: z.string().min(1, 'Reveal content value is required'),
    caption: z.string().max(500, 'Caption must be less than 500 characters').optional(),
  }),
  host: z.object({
    id: z.string().min(1, 'Host ID is required'),
    nickname: z.string().min(1, 'Host nickname is required').max(30, 'Host nickname must be less than 30 characters'),
  }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const getRoomSchema = z.object({
  code: z.string().length(6, 'Room code must be 6 characters'),
});
