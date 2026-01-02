import { z } from 'zod';

export const joinRoomSchema = z.object({
  nickname: z
    .string()
    .min(1, 'Nickname is required')
    .max(12, 'Nickname must be less than 12 characters')
    .regex(/^[a-zA-Z]+$/, 'Nickname can only contain letters'),
});
