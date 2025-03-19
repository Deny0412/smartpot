import axios from 'axios';
import { User } from '../../types/userTypes';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get<{ users: User[] }>('/api/users');
  return response.data.users;
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const response = await axios.post<User>('/api/users', user);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(`/api/users/${id}`);
};
