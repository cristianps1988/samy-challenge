export interface User {
  id: number;
  externalId: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}
