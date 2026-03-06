import { z } from 'zod';

export const LoginDTO = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required').max(20, 'Password must be less than 20 characters'),
});

export type LoginDTOType = z.infer<typeof LoginDTO>;
