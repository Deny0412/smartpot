import axios from "axios";
import { Flowerpot } from "../../types/flowerpotTypes";

export const fetchFlowerpots = async (): Promise<Flowerpot[]> => {
  const response = await axios.get<Flowerpot[]>("/api/flowerpots");
  return response.data; 
};

export const addFlowerpot = async (flowerpot: Omit<Flowerpot, "id">): Promise<Flowerpot> => {
  const response = await axios.post<Flowerpot>("/api/flowerpots", flowerpot);
  return response.data;
};

export const deleteFlowerpot = async (id: string): Promise<void> => {
  await axios.delete(`/api/flowerpots/${id}`);
};
