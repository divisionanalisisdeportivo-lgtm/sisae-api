import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export interface BackupData {
  timestamp: string;
  version: string;
  clubSanctions: any[];
  personalSanctions: any[];
  users: any[];
  statistics: {
    totalClubSanctions: number;
    totalPersonalSanctions: number;
    totalUsers: number;
    backupDate: string;
  };
}

export class BackupService {
  private backupDir = "./backups";

  constructor() {
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory() {
    try {
      await mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      // Directory may already exist
    }
  }

  // Create a backup of all system data
  async createBackup(): Promise<string> {
    await this.ensureBackupDirectory();

    // Use Argentina timezone (UTC-3) with proper formatting
    const now = new Date();
    const options = {
      timeZone: 'America/Argentina/Cordoba',
      year: 'numeric' as const,
      month: '2-digit' as const, 
      day: '2-digit' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      second: '2-digit' as const,
      hour12: false
    };
    const argentinaTimeString = now.toLocaleString('sv-SE', options);
    const timestamp = argentinaTimeString.replace(' ', 'T') + '-03:00';
    
    const clubSanctions = await storage.getClubSanctions();
    const personalSanctions = await storage.getPersonalSanctions();
    const users = await storage.getAllUsers();

    const backupData: BackupData = {
      timestamp,
      version: "1.0",
      clubSanctions,
      personalSanctions,
      users: users.map(user => ({
        ...user,
        password: "[REDACTED]" // Don't backup passwords
      })),
      statistics: {
        totalClubSanctions: clubSanctions.length,
        totalPersonalSanctions: personalSanctions.length,
        totalUsers: users.length,
        backupDate: timestamp
      }
    };

    const fileName = `backup_${timestamp.replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(this.backupDir, fileName);
    
    await writeFile(filePath, JSON.stringify(backupData, null, 2), 'utf8');
    
    // Keep only the last 10 backups
    await this.cleanOldBackups();
    
    return filePath;
  }

  // Get list of available backups
  async getBackupList(): Promise<Array<{fileName: string, date: string, size: number}>> {
    await this.ensureBackupDirectory();
    
    try {
      const files = await readdir(this.backupDir);
      const backupFiles = files.filter(f => f.startsWith('backup_') && f.endsWith('.json'));
      
      const backupInfo = [];
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await stat(filePath);
        backupInfo.push({
          fileName: file,
          date: stats.mtime.toISOString(),
          size: stats.size
        });
      }
      
      return backupInfo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error reading backup directory:', error);
      return [];
    }
  }

  // Load backup data (for inspection, not restoration)
  async getBackupData(fileName: string): Promise<BackupData | null> {
    try {
      const filePath = path.join(this.backupDir, fileName);
      const data = await readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading backup file:', error);
      return null;
    }
  }

  // Restore system from backup
  async restoreFromBackup(fileName: string): Promise<{ success: boolean; message: string; restoredData?: any }> {
    try {
      // First, create a backup of current state
      await this.createBackup();
      
      // Load backup data
      const backupData = await this.getBackupData(fileName);
      if (!backupData) {
        return { success: false, message: "No se pudo cargar el archivo de respaldo" };
      }

      // Clear existing data (except users to preserve authentication)
      await storage.clearAllSanctions();

      // Restore club sanctions with original numbers
      const restoredClubSanctions = [];
      console.log(`📋 Restaurando ${backupData.clubSanctions.length} sanciones de club...`);
      
      // Sort by numeroCarga to maintain proper order during restoration
      const sortedClubSanctions = [...backupData.clubSanctions].sort((a, b) => a.numeroCarga - b.numeroCarga);
      
      for (const clubSanction of sortedClubSanctions) {
        try {
          console.log(`🔄 Restaurando sanción club #${clubSanction.numeroCarga}: ${clubSanction.nombreSancionado} (${clubSanction.tipoSancion})`);
          const restored = await storage.createClubSanctionWithNumber({
            nombreSancionado: clubSanction.nombreSancionado,
            deporte: clubSanction.deporte,
            ubicacion: clubSanction.ubicacion,
            tipoSancion: clubSanction.tipoSancion,
            motivoSancion: clubSanction.motivoSancion || [],
            fechaInicio: clubSanction.fechaInicio,
            fechaFin: clubSanction.fechaFin,
            observaciones: clubSanction.observaciones || "",
            actaPdf: clubSanction.actaPdf || ""
          }, clubSanction.numeroCarga);
          console.log(`✅ Sanción club restaurada con ID: ${restored.id}, número: ${restored.numeroCarga}`);
          restoredClubSanctions.push(restored);
        } catch (error) {
          console.error(`❌ Error restoring club sanction #${clubSanction.numeroCarga}:`, error);
        }
      }

      // Restore personal sanctions with original numbers
      const restoredPersonalSanctions = [];
      console.log(`👤 Restaurando ${backupData.personalSanctions.length} sanciones personales...`);
      
      // Sort by numeroCarga to maintain proper order during restoration
      const sortedPersonalSanctions = [...backupData.personalSanctions].sort((a, b) => a.numeroCarga - b.numeroCarga);
      
      for (const personalSanction of sortedPersonalSanctions) {
        try {
          console.log(`🔄 Restaurando sanción personal #${personalSanction.numeroCarga}: ${personalSanction.nombrePersona} (${personalSanction.motivoSancion})`);
          const restored = await storage.createPersonalSanctionWithNumber({
            nombrePersona: personalSanction.nombrePersona,
            dniPersona: personalSanction.dniPersona,
            edadPersona: personalSanction.edadPersona,
            deporte: personalSanction.deporte,
            ubicacion: personalSanction.ubicacion,
            motivoSancion: personalSanction.motivoSancion,
            fechaInicio: personalSanction.fechaInicio,
            fechaFin: personalSanction.fechaFin,
            observaciones: personalSanction.observaciones || "",
            actaPdf: personalSanction.actaPdf || ""
          }, personalSanction.numeroCarga);
          
          console.log(`✅ Sanción personal restaurada con ID: ${restored.id}, número: ${restored.numeroCarga}`);
          
          // Restore the reported status if it was true in the backup
          if (personalSanction.reportadaEnPdf) {
            await storage.markPersonalSanctionsAsReported([restored.id]);
          }
          restoredPersonalSanctions.push(restored);
        } catch (error) {
          console.error(`❌ Error restoring personal sanction #${personalSanction.numeroCarga}:`, error);
        }
      }

      return {
        success: true,
        message: `Restauración exitosa desde ${fileName}`,
        restoredData: {
          clubSanctions: restoredClubSanctions.length,
          personalSanctions: restoredPersonalSanctions.length,
          timestamp: backupData.timestamp
        }
      };

    } catch (error) {
      console.error('Error during restoration:', error);
      return { 
        success: false, 
        message: `Error durante la restauración: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  // Clean old backups, keep only the last 10
  private async cleanOldBackups() {
    try {
      const backups = await this.getBackupList();
      if (backups.length > 10) {
        const oldBackups = backups.slice(10);
        for (const backup of oldBackups) {
          const filePath = path.join(this.backupDir, backup.fileName);
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  // Create automatic daily backup
  async scheduleAutomaticBackup() {
    // Create backup immediately
    try {
      const backupPath = await this.createBackup();
      console.log(`✅ Backup automático creado: ${backupPath}`);
    } catch (error) {
      console.error('❌ Error creando backup automático:', error);
    }

    // Schedule daily backups at 2 AM
    const scheduleDaily = () => {
      const now = new Date();
      const nextBackup = new Date();
      nextBackup.setDate(now.getDate() + 1);
      nextBackup.setHours(2, 0, 0, 0);
      
      const msUntilNextBackup = nextBackup.getTime() - now.getTime();
      
      setTimeout(async () => {
        try {
          const backupPath = await this.createBackup();
          console.log(`✅ Backup automático diario creado: ${backupPath}`);
        } catch (error) {
          console.error('❌ Error en backup automático diario:', error);
        }
        
        // Schedule next backup
        scheduleDaily();
      }, msUntilNextBackup);
    };

    scheduleDaily();
  }
}

export const backupService = new BackupService();