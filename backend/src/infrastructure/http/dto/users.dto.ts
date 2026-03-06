import { z } from 'zod';

export const ImportUserParamsDTO = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

export type ImportUserParamsDTOType = z.infer<typeof ImportUserParamsDTO>;

export const UserIdParamsDTO = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

export type UserIdParamsDTOType = z.infer<typeof UserIdParamsDTO>;
