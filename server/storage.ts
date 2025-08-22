import { type ClubSanction, type PersonalSanction, type InsertClubSanction, type InsertPersonalSanction, clubSanctions, personalSanctions } from "@shared/schema";
import { db } from "./db";
import { eq, and, lt, max } from "drizzle-orm";
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
  
  // Report methods
  getExpiredUnreportedPersonalSanctions(): Promise<PersonalSanction[]>;
  markPersonalSanctionsAsReported(sanctionIds: string[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private clubSanctions: Map<string, ClubSanction>;
  private personalSanctions: Map<string, PersonalSanction>;
  private clubAvailableNumbers: number[];
  private personalAvailableNumbers: number[];
  private clubNextNumber: number;
  private personalNextNumber: number;

  constructor() {
    this.clubSanctions = new Map();
    this.personalSanctions = new Map();
    this.clubAvailableNumbers = [];
    this.personalAvailableNumbers = [];
    this.clubNextNumber = 1;
    this.personalNextNumber = 1;
  }

  private getNextClubNumber(): number {
    if (this.clubAvailableNumbers.length > 0) {
      return this.clubAvailableNumbers.shift()!;
    }
    return this.clubNextNumber++;
  }

  private getNextPersonalNumber(): number {
    if (this.personalAvailableNumbers.length > 0) {
      return this.personalAvailableNumbers.shift()!;
    }
    return this.personalNextNumber++;
  }

  private returnClubNumber(number: number): void {
    this.clubAvailableNumbers.push(number);
    this.clubAvailableNumbers.sort((a, b) => a - b);
  }

  private returnPersonalNumber(number: number): void {
    this.personalAvailableNumbers.push(number);
    this.personalAvailableNumbers.sort((a, b) => a - b);
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
    const numeroCarga = this.getNextClubNumber();
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
    const sanction = this.clubSanctions.get(id);
    if (sanction) {
      this.returnClubNumber(sanction.numeroCarga);
      return this.clubSanctions.delete(id);
    }
    return false;
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
    const numeroCarga = this.getNextPersonalNumber();
    const sanction: PersonalSanction = {
      ...insertSanction,
      id,
      numeroCarga,
      reportadaEnPdf: false,
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
    const sanction = this.personalSanctions.get(id);
    if (sanction) {
      this.returnPersonalNumber(sanction.numeroCarga);
      return this.personalSanctions.delete(id);
    }
    return false;
  }

  // Report methods
  async getExpiredUnreportedPersonalSanctions(): Promise<PersonalSanction[]> {
    const today = new Date();
    return Array.from(this.personalSanctions.values()).filter(sanction => {
      const endDate = new Date(sanction.fechaFin);
      return endDate < today && !sanction.reportadaEnPdf;
    });
  }

  async markPersonalSanctionsAsReported(sanctionIds: string[]): Promise<void> {
    for (const id of sanctionIds) {
      const sanction = this.personalSanctions.get(id);
      if (sanction) {
        const updated: PersonalSanction = { ...sanction, reportadaEnPdf: true };
        this.personalSanctions.set(id, updated);
      }
    }
  }
}

export class DatabaseStorage implements IStorage {
  // Helper methods for getting next available numbers
  private async getNextClubNumber(): Promise<number> {
    const result = await db.select({ maxNumber: max(clubSanctions.numeroCarga) })
      .from(clubSanctions);
    return (result[0]?.maxNumber || 0) + 1;
  }

  private async getNextPersonalNumber(): Promise<number> {
    const result = await db.select({ maxNumber: max(personalSanctions.numeroCarga) })
      .from(personalSanctions);
    return (result[0]?.maxNumber || 0) + 1;
  }

  // Club sanctions methods
  async getClubSanctions(): Promise<ClubSanction[]> {
    return await db.select().from(clubSanctions).orderBy(clubSanctions.fechaCreacion);
  }

  async getClubSanction(id: string): Promise<ClubSanction | undefined> {
    const [sanction] = await db.select().from(clubSanctions).where(eq(clubSanctions.id, id));
    return sanction || undefined;
  }

  async createClubSanction(insertSanction: InsertClubSanction): Promise<ClubSanction> {
    const numeroCarga = await this.getNextClubNumber();
    const [sanction] = await db
      .insert(clubSanctions)
      .values({
        ...insertSanction,
        numeroCarga,
      })
      .returning();
    return sanction;
  }

  async updateClubSanction(id: string, updateData: Partial<InsertClubSanction>): Promise<ClubSanction | undefined> {
    const [sanction] = await db
      .update(clubSanctions)
      .set(updateData)
      .where(eq(clubSanctions.id, id))
      .returning();
    return sanction || undefined;
  }

  async deleteClubSanction(id: string): Promise<boolean> {
    const result = await db.delete(clubSanctions).where(eq(clubSanctions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Personal sanctions methods
  async getPersonalSanctions(): Promise<PersonalSanction[]> {
    return await db.select().from(personalSanctions).orderBy(personalSanctions.fechaCreacion);
  }

  async getPersonalSanction(id: string): Promise<PersonalSanction | undefined> {
    const [sanction] = await db.select().from(personalSanctions).where(eq(personalSanctions.id, id));
    return sanction || undefined;
  }

  async createPersonalSanction(insertSanction: InsertPersonalSanction): Promise<PersonalSanction> {
    const numeroCarga = await this.getNextPersonalNumber();
    const [sanction] = await db
      .insert(personalSanctions)
      .values({
        ...insertSanction,
        numeroCarga,
        reportadaEnPdf: false,
      })
      .returning();
    return sanction;
  }

  async updatePersonalSanction(id: string, updateData: Partial<InsertPersonalSanction>): Promise<PersonalSanction | undefined> {
    const [sanction] = await db
      .update(personalSanctions)
      .set(updateData)
      .where(eq(personalSanctions.id, id))
      .returning();
    return sanction || undefined;
  }

  async deletePersonalSanction(id: string): Promise<boolean> {
    const result = await db.delete(personalSanctions).where(eq(personalSanctions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Report methods
  async getExpiredUnreportedPersonalSanctions(): Promise<PersonalSanction[]> {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return await db
      .select()
      .from(personalSanctions)
      .where(
        and(
          lt(personalSanctions.fechaFin, today),
          eq(personalSanctions.reportadaEnPdf, false)
        )
      )
      .orderBy(personalSanctions.fechaCreacion);
  }

  async markPersonalSanctionsAsReported(sanctionIds: string[]): Promise<void> {
    if (sanctionIds.length === 0) return;
    
    // Update all sanctions in the array to mark them as reported
    for (const id of sanctionIds) {
      await db
        .update(personalSanctions)
        .set({ reportadaEnPdf: true })
        .where(eq(personalSanctions.id, id));
    }
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
