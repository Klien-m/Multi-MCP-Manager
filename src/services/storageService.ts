import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { AppState, BackupData, ToolConfig, MCPData, VersionRecord, BackupRecord } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LocalStorageService {
  private readonly STORAGE_DIR = join(__dirname, '../../data');
  private readonly STORAGE_FILE = join(this.STORAGE_DIR, 'mcp-manager-data.json');
  private readonly BACKUP_DIR = join(this.STORAGE_DIR, 'backups');

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!existsSync(this.STORAGE_DIR)) {
      mkdirSync(this.STORAGE_DIR, { recursive: true });
    }
    if (!existsSync(this.BACKUP_DIR)) {
      mkdirSync(this.BACKUP_DIR, { recursive: true });
    }
  }

  /**
   * Save complete user data to local JSON file
   */
  saveUserData(data: AppState): void {
    try {
      const dataToSave = {
        mcpCollections: data.mcpCollections,
        toolConfigs: data.toolConfigs,
        versions: data.versions,
        backups: data.backups,
        aiConfig: data.aiConfig,
        lastUpdated: new Date().toISOString(),
      };

      writeFileSync(this.STORAGE_FILE, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Load complete user data from local JSON file
   */
  loadUserData(): AppState | null {
    try {
      if (!existsSync(this.STORAGE_FILE)) {
        return null;
      }

      const data = readFileSync(this.STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);

      return {
        mcpCollections: parsed.mcpCollections || [],
        toolConfigs: parsed.toolConfigs || [],
        versions: parsed.versions || [],
        backups: parsed.backups || [],
        currentMigration: undefined,
        isLoading: false,
        error: undefined,
        aiConfig: parsed.aiConfig || {
          tools: [],
          autoSync: true,
          backupEnabled: true,
          backupInterval: 24,
        },
      };
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }

  /**
   * Create a backup of current user data
   */
  backupUserData(): string {
    try {
      const userData = this.loadUserData();
      if (!userData) {
        throw new Error('No user data to backup');
      }

      const backupId = `backup-${Date.now()}`;
      const backupData: BackupData = {
        mcpCollections: userData.mcpCollections,
        toolConfigs: userData.toolConfigs,
        versions: userData.versions,
        metadata: {
          backupDate: new Date().toISOString(),
          appVersion: '0.1.0',
          platform: process.platform,
        },
      };

      const backupFile = join(this.BACKUP_DIR, `${backupId}.json`);
      writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

      return backupId;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Restore from a specific backup
   */
  restoreFromBackup(backupId: string): boolean {
    try {
      const backupFile = join(this.BACKUP_DIR, `${backupId}.json`);
      if (!existsSync(backupFile)) {
        throw new Error(`Backup ${backupId} not found`);
      }

      const backupData = readFileSync(backupFile, 'utf-8');
      const parsed: BackupData = JSON.parse(backupData);

      const userData: AppState = {
        mcpCollections: parsed.mcpCollections || [],
        toolConfigs: parsed.toolConfigs || [],
        versions: parsed.versions || [],
        backups: [],
        currentMigration: undefined,
        isLoading: false,
        error: undefined,
        aiConfig: {
          tools: [],
          autoSync: true,
          backupEnabled: true,
          backupInterval: 24,
        },
      };

      this.saveUserData(userData);
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * List all available backups
   */
  listBackups(): BackupRecord[] {
    try {
      if (!existsSync(this.BACKUP_DIR)) {
        return [];
      }

      const files = readdirSync(this.BACKUP_DIR);
      const backups: BackupRecord[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.BACKUP_DIR, file);
          const stats = require('fs').statSync(filePath);
          
          const backupData = readFileSync(filePath, 'utf-8');
          const parsed: BackupData = JSON.parse(backupData);

          backups.push({
            id: file.replace('.json', ''),
            name: `Backup ${parsed.metadata.backupDate}`,
            description: `Backup created on ${parsed.metadata.backupDate}`,
            data: parsed,
            createdAt: parsed.metadata.backupDate,
            createdBy: 'system',
            size: stats.size,
          });
        }
      }

      return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Delete a specific backup
   */
  deleteBackup(backupId: string): boolean {
    try {
      const backupFile = join(this.BACKUP_DIR, `${backupId}.json`);
      if (existsSync(backupFile)) {
        unlinkSync(backupFile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Export MCP data to a file
   */
  exportMCPData(mcpIds: string[], format: 'json' | 'csv' = 'json'): string {
    try {
      const userData = this.loadUserData();
      if (!userData) {
        throw new Error('No user data available');
      }

      const dataToExport = userData.mcpCollections.filter(mcp => mcpIds.includes(mcp.id));
      
      let content: string;
      let extension: string;

      if (format === 'json') {
        content = JSON.stringify(dataToExport, null, 2);
        extension = 'json';
      } else {
        // Simple CSV export for code snippets
        content = 'id,name,description,language,content\n';
        for (const mcp of dataToExport) {
          for (const snippet of mcp.codeSnippets) {
            const line = [
              mcp.id,
              mcp.metadata.name,
              mcp.metadata.description || '',
              snippet.language,
              snippet.content.replace(/"/g, '""')
            ].join('","');
            content += `"${line}"\n`;
          }
        }
        extension = 'csv';
      }

      const exportFile = join(this.STORAGE_DIR, `mcp-export-${Date.now()}.${extension}`);
      writeFileSync(exportFile, content);

      return exportFile;
    } catch (error) {
      console.error('Failed to export MCP data:', error);
      throw new Error('Failed to export MCP data');
    }
  }

  /**
   * Import MCP data from a file
   */
  importMCPData(filePath: string): boolean {
    try {
      if (!existsSync(filePath)) {
        throw new Error('File not found');
      }

      const content = readFileSync(filePath, 'utf-8');
      let importedData: MCPData[];

      if (filePath.endsWith('.json')) {
        importedData = JSON.parse(content);
      } else if (filePath.endsWith('.csv')) {
        // Simple CSV import (would need more robust parsing in production)
        const lines = content.split('\n').slice(1); // Skip header
        importedData = [];
        
        for (const line of lines) {
          if (line.trim()) {
            const [id, name, description, language, content] = line.split(',');
            importedData.push({
              id: id || `imported-${Date.now()}`,
              sourceTool: 'imported',
              codeSnippets: [{
                id: `snippet-${Date.now()}`,
                content: content || '',
                language: language || 'javascript',
                description: description || '',
                tags: [],
              }],
              metadata: {
                name: name || 'Imported MCP',
                description: description || '',
                version: '1.0.0',
                tags: [],
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      } else {
        throw new Error('Unsupported file format');
      }

      const userData = this.loadUserData() || {
        mcpCollections: [],
        toolConfigs: [],
        versions: [],
        backups: [],
        currentMigration: undefined,
        isLoading: false,
        error: undefined,
        aiConfig: {
          tools: [],
          autoSync: true,
          backupEnabled: true,
          backupInterval: 24,
        },
      };

      userData.mcpCollections.push(...importedData);
      this.saveUserData(userData);

      return true;
    } catch (error) {
      console.error('Failed to import MCP data:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    try {
      const userData = this.loadUserData();
      const backups = this.listBackups();

      return {
        totalMCPs: userData?.mcpCollections.length || 0,
        totalTools: userData?.toolConfigs.length || 0,
        totalVersions: userData?.versions.length || 0,
        totalBackups: backups.length,
        totalBackupSize: backups.reduce((sum, backup) => sum + backup.size, 0),
        lastBackup: backups[0]?.createdAt || null,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalMCPs: 0,
        totalTools: 0,
        totalVersions: 0,
        totalBackups: 0,
        totalBackupSize: 0,
        lastBackup: null,
      };
    }
  }
}

// Export singleton instance
export const storageService = new LocalStorageService();