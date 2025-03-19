import axios from 'axios';
import { Household } from '../../types/householdTypes';

export const fetchHouseholds = async (): Promise<Household[]> => {
  const response = await axios.get<{ households: Household[] }>('/api/households');
  return response.data.households;
};

export const addHousehold = async (household: Omit<Household, 'id'>): Promise<Household> => {
  const response = await axios.post<Household>('/api/households', household);
  return response.data;
};

export const deleteHousehold = async (id: string): Promise<void> => {
  await axios.delete(`/api/households/${id}`);
};
