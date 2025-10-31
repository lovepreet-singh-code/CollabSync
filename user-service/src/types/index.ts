export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationInput {
  name: string;
  email: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
}