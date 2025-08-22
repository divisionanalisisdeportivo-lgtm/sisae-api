import { type ClubSanction, type PersonalSanction, type InsertClubSanction, type InsertPersonalSanction } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Club sanctions
  getClubSanctions(): Promise<ClubSanction[]>;
  getClubSanction(id: string): Promise<ClubSanction | undefined>;
  createClubSanction(sanction: InsertClubSanction): Promise<ClubSanction>;
  updateClubSanction(id: string, sanction: Partial<InsertClubSanction>): Promise<ClubSanction | undefined>;
  deleteClubSanction(id: string): Promise<boolean>;
  
  // Personal sanctions
  getPersonalSanctions(): Promise<PersonalSanction[]>;
  getPersonalSanction(id: string): Promise<PersonalSanction | undefined>;
  createPersonalSanction(sanction: InsertPersonalSanction): Promise<PersonalSanction>;
  updatePersonalSanction(id: string, sanction: Partial<InsertPersonalSanction>): Promise<PersonalSanction | undefined>;
  deletePersonalSanction(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private clubSanctions: Map<string, ClubSanction>;
  private personalSanctions: Map<string, PersonalSanction>;
  private nextLoadNumber: number;

  constructor() {
    this.clubSanctions = new Map();
    this.personalSanctions = new Map();
    this.nextLoadNumber = 1;
  }

  private getNextLoadNumber(): number {
    return this.nextLoadNumber++;
  }

  // Club sanctions methods
  async getClubSanctions(): Promise<ClubSanction[]> {
    return Array.from(this.clubSanctions.values());
  }

  async getClubSanction(id: string): Promise<ClubSanction | undefined> {
    return this.clubSanctions.get(id);
  }

  async createClubSanction(insertSanction: InsertClubSanction): Promise<ClubSanction> {
    const id = randomUUID();
    const numeroCarga = this.getNextLoadNumber();
    const sanction: ClubSanction = {
      ...insertSanction,
      id,
      numeroCarga,
      fechaCreacion: new Date(),
      observaciones: insertSanction.observaciones || null,
      actaPdf: insertSanction.actaPdf || null,
    };
    this.clubSanctions.set(id, sanction);
    return sanction;
  }

  async updateClubSanction(id: string, updateData: Partial<InsertClubSanction>): Promise<ClubSanction | undefined> {
    const existing = this.clubSanctions.get(id);
    if (!existing) return undefined;
    
    const updated: ClubSanction = { ...existing, ...updateData };
    this.clubSanctions.set(id, updated);
    return updated;
  }

  async deleteClubSanction(id: string): Promise<boolean> {
    return this.clubSanctions.delete(id);
  }

  // Personal sanctions methods
  async getPersonalSanctions(): Promise<PersonalSanction[]> {
    return Array.from(this.personalSanctions.values());
  }

  async getPersonalSanction(id: string): Promise<PersonalSanction | undefined> {
    return this.personalSanctions.get(id);
  }

  async createPersonalSanction(insertSanction: InsertPersonalSanction): Promise<PersonalSanction> {
    const id = randomUUID();
    const numeroCarga = this.getNextLoadNumber();
    const sanction: PersonalSanction = {
      ...insertSanction,
      id,
      numeroCarga,
      fechaCreacion: new Date(),
      observaciones: insertSanction.observaciones || null,
      actaPdf: insertSanction.actaPdf || null,
    };
    this.personalSanctions.set(id, sanction);
    return sanction;
  }

  async updatePersonalSanction(id: string, updateData: Partial<InsertPersonalSanction>): Promise<PersonalSanction | undefined> {
    const existing = this.personalSanctions.get(id);
    if (!existing) return undefined;
    
    const updated: PersonalSanction = { ...existing, ...updateData };
    this.personalSanctions.set(id, updated);
    return updated;
  }

  async deletePersonalSanction(id: string): Promise<boolean> {
    return this.personalSanctions.delete(id);
  }
}

export const storage = new MemStorage();
