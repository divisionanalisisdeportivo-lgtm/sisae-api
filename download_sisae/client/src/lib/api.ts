import { apiRequest } from "./queryClient";
import { InsertClubSanction, InsertPersonalSanction, ClubSanction, PersonalSanction } from "@shared/schema";

// Club sanctions API
export const clubSanctionsApi = {
  getAll: async (): Promise<ClubSanction[]> => {
    const response = await apiRequest("GET", "/api/club-sanctions");
    return response.json();
  },
  
  getById: async (id: string): Promise<ClubSanction> => {
    const response = await apiRequest("GET", `/api/club-sanctions/${id}`);
    return response.json();
  },
  
  create: async (data: InsertClubSanction): Promise<ClubSanction> => {
    const response = await apiRequest("POST", "/api/club-sanctions", data);
    return response.json();
  },
  
  update: async (id: string, data: Partial<InsertClubSanction>): Promise<ClubSanction> => {
    const response = await apiRequest("PUT", `/api/club-sanctions/${id}`, data);
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/club-sanctions/${id}`);
  },
};

// Personal sanctions API
export const personalSanctionsApi = {
  getAll: async (): Promise<PersonalSanction[]> => {
    const response = await apiRequest("GET", "/api/personal-sanctions");
    return response.json();
  },
  
  getById: async (id: string): Promise<PersonalSanction> => {
    const response = await apiRequest("GET", `/api/personal-sanctions/${id}`);
    return response.json();
  },
  
  create: async (data: InsertPersonalSanction): Promise<PersonalSanction> => {
    const response = await apiRequest("POST", "/api/personal-sanctions", data);
    return response.json();
  },
  
  update: async (id: string, data: Partial<InsertPersonalSanction>): Promise<PersonalSanction> => {
    const response = await apiRequest("PUT", `/api/personal-sanctions/${id}`, data);
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/personal-sanctions/${id}`);
  },
};
