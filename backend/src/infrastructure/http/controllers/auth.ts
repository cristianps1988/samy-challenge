import { Request, Response } from 'express';
import { login } from '@application/use-cases/auth/login.js';
import { ApiResponse } from '@shared/utils/ApiResponse.js';
import { ResponseAdapter } from '../handlers/ResponseAdapter.js';

async function loginController(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const result = await login(email, password);
  res.json(ApiResponse.success(ResponseAdapter.adapt(result)));
}

export { loginController };
