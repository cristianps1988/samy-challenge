import { Request, Response } from 'express';
import { importUser, getSavedUsers, getSavedUser, deleteSavedUser, fetchExternalUsers, fetchExternalUser } from '@application/use-cases/users/index.js';
import { ApiResponse } from '@shared/utils/ApiResponse.js';
import { ResponseAdapter } from '../handlers/ResponseAdapter.js';

async function importUserController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const user = await importUser(Number(id));
  res.status(201).json(ApiResponse.success(ResponseAdapter.adapt(user)));
}

async function fetchExternalUsersController(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? Number(req.query.page) : 1;
  const result = await fetchExternalUsers(page);
  res.json(ApiResponse.success(result));
}

async function fetchExternalUserController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const user = await fetchExternalUser(Number(id));
  res.json(ApiResponse.success(user));
}

async function getSavedUsersController(_req: Request, res: Response): Promise<void> {
  const users = await getSavedUsers();
  res.json(ApiResponse.success(ResponseAdapter.adapt(users)));
}

async function getSavedUserController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const user = await getSavedUser(Number(id));
  res.json(ApiResponse.success(ResponseAdapter.adapt(user)));
}

async function deleteSavedUserController(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await deleteSavedUser(Number(id));
  res.status(204).send();
}

export {
  importUserController,
  fetchExternalUsersController,
  fetchExternalUserController,
  getSavedUsersController,
  getSavedUserController,
  deleteSavedUserController,
};
