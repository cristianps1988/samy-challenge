import { z } from 'zod';

export const reqresUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  avatar: z.string(),
});

export const reqresUsersResponseSchema = z.object({
  data: z.array(reqresUserSchema),
  total: z.number(),
  total_pages: z.number(),
});

export const reqresUserResponseSchema = z.object({
  data: reqresUserSchema.nullable(),
});

export const reqresLoginResponseSchema = z.object({
  token: z.string(),
});

export type ReqResUser = z.infer<typeof reqresUserSchema>;
export type ReqResUsersResponse = z.infer<typeof reqresUsersResponseSchema>;
export type ReqResUserResponse = z.infer<typeof reqresUserResponseSchema>;
export type ReqResLoginResponse = z.infer<typeof reqresLoginResponseSchema>;
