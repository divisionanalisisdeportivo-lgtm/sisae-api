import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and authorization
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'admin' or 'user'
  isActive: boolean("is_active").default(true).notNull(),
  temporaryAccess: boolean("temporary_access").default(false).notNull(),
  accessExpires: timestamp("access_expires"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by"),
});

export const clubSanctions = pgTable("club_sanctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numeroCarga: integer("numero_carga").notNull(),
  nombreSancionado: text("nombre_sancionado").notNull(),
  deporte: text("deporte").notNull(),
  ubicacion: text("ubicacion").notNull(),
  tipoSancion: text("tipo_sancion").notNull(),
  motivoSancion: text("motivo_sancion").array().notNull(),
  fechaInicio: text("fecha_inicio").notNull(),
  fechaFin: text("fecha_fin").notNull(),
  observaciones: text("observaciones"),
  actaPdf: text("acta_pdf"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

export const personalSanctions = pgTable("personal_sanctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numeroCarga: integer("numero_carga").notNull(),
  nombrePersona: text("nombre_persona").notNull(),
  dniPersona: text("dni_persona").notNull(),
  edadPersona: integer("edad_persona").notNull(),
  deporte: text("deporte").notNull(),
  ubicacion: text("ubicacion").notNull(),
  motivoSancion: text("motivo_sancion").notNull(),
  fechaInicio: text("fecha_inicio").notNull(),
  fechaFin: text("fecha_fin").notNull(),
  observaciones: text("observaciones"),
  actaPdf: text("acta_pdf"),
  reportadaEnPdf: boolean("reportada_en_pdf").default(false).notNull(),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

export const insertClubSanctionSchema = createInsertSchema(clubSanctions).omit({
  id: true,
  numeroCarga: true,
  fechaCreacion: true,
}).extend({
  motivoSancion: z.array(z.string()).min(1, "Debe seleccionar al menos un motivo"),
});

export const insertPersonalSanctionSchema = createInsertSchema(personalSanctions).omit({
  id: true,
  numeroCarga: true,
  reportadaEnPdf: true,
  fechaCreacion: true,
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClubSanction = z.infer<typeof insertClubSanctionSchema>;
export type InsertPersonalSanction = z.infer<typeof insertPersonalSanctionSchema>;
export type ClubSanction = typeof clubSanctions.$inferSelect;
export type PersonalSanction = typeof personalSanctions.$inferSelect;
