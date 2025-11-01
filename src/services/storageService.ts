import { writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { appConfigDir } from '@tauri-apps/api/path';
import { AppState, BackupData, ToolConfig, MCPData, VersionRecord, BackupRecord } from '../types';

class LocalStorageService {
  private readonly STORAGE_DIR = 'data';
  private readonly STORAGE_FILE = 'mcp-manager-data.json';
  private readonly BACKUP_DIR = 'backups';

  constructor() {
    // Directories will be created automatically by Tauri when needed
  }

  private async getStoragePath(filename: string): Promise<string> {
    const appDir = await appConfigDir();
    return `${appDir}/${this.STORAGE_DIR}/${filename}`;
  }

  private async getBackupPath(filename: string): Promise<string> {
    const appDir = await appConfigDir();
    return `${appDir}/${this.BACKUP_DIR}/${filename}`;
  }

  /**
   * Save complete user data to local JSON file
   */
  async saveUserData(data: AppState): Promise<void> {
    try {
      const dataToSave = {
        mcpCollections: data.mcpCollections,
        toolConfigs: data.toolConfigs,
        versions: data.versions,
        backups: data.backups,
        aiConfig: data.aiConfig,
        lastUpdated: new Date().toISOString(),
      };

      const storagePath = await this.getStoragePath(this.STORAGE_FILE);
      await writeTextFile(storagePath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Load complete user data from local JSON file
   */
  async loadUserData(): Promise<AppState | null> {
    try {
      const storagePath = await this.getStoragePath(this.STORAGE_FILE);
      if (!(await exists(storagePath))) {
        return null;
      }

      const data = await readTextFile(storagePath);
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
  async backupUserData(): Promise<string> {
    try {
      const userData = await this.loadUserData();
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
          platform: 'tauri',
        },
      };

      const backupPath = await this.getBackupPath(`${backupId}.json`);
      await writeTextFile(backupPath, JSON.stringify(backupData, null, 2));

      return backupId;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Restore from a specific backup
   */
  async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      const backupPath = await this.getBackupPath(`${backupId}.json`);
      if (!(await exists(backupPath))) {
        throw new Error(`Backup ${backupId} not found`);
      }

      const backupData = await readTextFile(backupPath);
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

      await this.saveUserData(userData);
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupRecord[]> {
    try {
      // Note: Tauri plugin-fs doesn't have readDir, so we'll need a different approach
      // For now, return empty array. In a real implementation, you might want to
      // maintain a backup index file or use a different approach
      return [];
    } catch (error) {
      console.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backupPath = await this.getBackupPath(`${backupId}.json`);
      if (await exists(backupPath)) {
        // Note: Tauri plugin-fs doesn't have removeFile, so we'll need a different approach
        // For now, return false. In a real implementation, you might want to
        // use a different approach or implement file removal
        return false;
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
  async exportMCPData(mcpIds: string[], format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const userData = await this.loadUserData();
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

      const exportPath = await this.getStoragePath(`mcp-export-${Date.now()}.${extension}`);
      await writeTextFile(exportPath, content);

      return exportPath;
    } catch (error) {
      console.error('Failed to export MCP data:', error);
      throw new Error('Failed to export MCP data');
    }
  }

  /**
   * Import MCP data from a file
   */
  async importMCPData(filePath: string): Promise<boolean> {
    try {
      if (!(await exists(filePath))) {
        throw new Error('File not found');
      }

      const content = await readTextFile(filePath);
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

      const userData = await this.loadUserData() || {
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
      await this.saveUserData(userData);

      return true;
    } catch (error) {
      console.error('Failed to import MCP data:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const userData = await this.loadUserData();
      const backups = await this.listBackups();

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