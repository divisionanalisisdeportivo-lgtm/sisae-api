export type { ClubSanction, PersonalSanction, InsertClubSanction, InsertPersonalSanction } from "@shared/schema";

export interface SanctionFilters {
  search: string;
  sport: string;
  status: string;
}

export type SanctionStatus = 'activa' | 'vencida';

export interface DashboardStats {
  totalClubSanctions: number;
  totalPersonalSanctions: number;
  activeSanctions: number;
  expiredSanctions: number;
}
