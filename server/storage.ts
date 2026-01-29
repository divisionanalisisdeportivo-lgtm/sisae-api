import { type ClubSanction, type PersonalSanction, type InsertClubSanction, type InsertPersonalSanction, type User, type InsertUser, clubSanctions, personalSanctions, users } from "@shared/schema";
import { db } from "./db";
import { eq, and, lt, max, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Club sanctions
  getClubSanctions(): Promise<ClubSanction[]>;
  getClubSanction(id: string): Promise<ClubSanction | undefined>;
  createClubSanction(sanction: InsertClubSanction): Promise<ClubSanction>;
  createClubSanctionWithNumber(sanction: InsertClubSanction, numeroCarga: number): Promise<ClubSanction>;
  updateClubSanction(id: string, sanction: Partial<InsertClubSanction>): Promise<ClubSanction | undefined>;
  deleteClubSanction(id: string): Promise<boolean>;
  
  // Personal sanctions
  getPersonalSanctions(): Promise<PersonalSanction[]>;
  getPersonalSanction(id: string): Promise<PersonalSanction | undefined>;
  createPersonalSanction(sanction: InsertPersonalSanction): Promise<PersonalSanction>;
  createPersonalSanctionWithNumber(sanction: InsertPersonalSanction, numeroCarga: number): Promise<PersonalSanction>;
  updatePersonalSanction(id: string, sanction: Partial<InsertPersonalSanction>): Promise<PersonalSanction | undefined>;
  deletePersonalSanction(id: string): Promise<boolean>;
  
  // Report methods
  getExpiredUnreportedPersonalSanctions(): Promise<PersonalSanction[]>;
  markPersonalSanctionsAsReported(sanctionIds: string[]): Promise<void>;
  
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Backup restoration
  clearAllSanctions(): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}


export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }
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
    return await db.select().from(clubSanctions).orderBy(desc(clubSanctions.numeroCarga));
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

  async createClubSanctionWithNumber(insertSanction: InsertClubSanction, numeroCarga: number): Promise<ClubSanction> {
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
    return await db.select().from(personalSanctions).orderBy(desc(personalSanctions.numeroCarga));
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

  async createPersonalSanctionWithNumber(insertSanction: InsertPersonalSanction, numeroCarga: number): Promise<PersonalSanction> {
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
      .orderBy(desc(personalSanctions.numeroCarga));
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

  // User management methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updateData,
        lastLogin: updateData.lastLogin ? new Date() : undefined
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  // Clear all sanctions for backup restoration
  async clearAllSanctions(): Promise<void> {
    await db.delete(clubSanctions);
    await db.delete(personalSanctions);
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
