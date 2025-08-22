import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clubSanctions = pgTable("club_sanctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombreSancionado: text("nombre_sancionado").notNull(),
  deporte: text("deporte").notNull(),
  ubicacion: text("ubicacion").notNull(),
  tipoSancion: text("tipo_sancion").notNull(),
  fechaInicio: text("fecha_inicio").notNull(),
  fechaFin: text("fecha_fin").notNull(),
  observaciones: text("observaciones"),
  actaPdf: text("acta_pdf"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

export const personalSanctions = pgTable("personal_sanctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombrePersona: text("nombre_persona").notNull(),
  dniPersona: text("dni_persona").notNull(),
  edadPersona: integer("edad_persona").notNull(),
  deporte: text("deporte").notNull(),
  ubicacion: text("ubicacion").notNull(),
  fechaInicio: text("fecha_inicio").notNull(),
  fechaFin: text("fecha_fin").notNull(),
  observaciones: text("observaciones"),
  actaPdf: text("acta_pdf"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow(),
});

export const insertClubSanctionSchema = createInsertSchema(clubSanctions).omit({
  id: true,
  fechaCreacion: true,
});

export const insertPersonalSanctionSchema = createInsertSchema(personalSanctions).omit({
  id: true,
  fechaCreacion: true,
});

export type InsertClubSanction = z.infer<typeof insertClubSanctionSchema>;
export type InsertPersonalSanction = z.infer<typeof insertPersonalSanctionSchema>;
export type ClubSanction = typeof clubSanctions.$inferSelect;
export type PersonalSanction = typeof personalSanctions.$inferSelect;
