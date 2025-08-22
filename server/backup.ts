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

    const timestamp = new Date().toISOString();
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