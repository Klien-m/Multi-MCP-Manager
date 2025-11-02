import { MCPConfig, AITool } from '../types';

// 备份记录接口
export interface BackupRecord {
  id: string;
  name: string;
  description?: string;
  data: {
    tools: AITool[];
    configs: MCPConfig[];
  };
  createdAt: string;
  createdBy: string;
  size: number;
}

/**
 * 备份服务 - 管理配置的备份和恢复
 */
export class BackupService {
  private backups: BackupRecord[] = [];

  // 创建备份
  createBackup(name: string, description?: string, tools?: AITool[], configs?: MCPConfig[]): string {
    const backupId = `backup-${Date.now()}`;
    const backupData = {
      tools: tools || [],
      configs: configs || []
    };
    
    const backup: BackupRecord = {
      id: backupId,
      name,
      description,
      data: backupData,
      createdAt: new Date().toISOString(),
      createdBy: 'user',
      size: this.calculateBackupSize(backupData)
    };

    this.backups.unshift(backup); // 添加到开头
    return backupId;
  }

  // 获取所有备份
  getAllBackups(): BackupRecord[] {
    return [...this.backups];
  }

  // 根据 ID 获取备份
  getBackupById(id: string): BackupRecord | undefined {
    return this.backups.find(backup => backup.id === id);
  }

  // 删除备份
  deleteBackup(id: string): boolean {
    const index = this.backups.findIndex(backup => backup.id === id);
    if (index === -1) return false;

    this.backups.splice(index, 1);
    return true;
  }

  // 恢复备份
  restoreBackup(id: string): { success: boolean; restoredData?: { tools: AITool[]; configs: MCPConfig[] }; error?: string } {
    const backup = this.getBackupById(id);
    if (!backup) {
      return { success: false, error: '备份不存在' };
    }

    try {
      return {
        success: true,
        restoredData: backup.data
      };
    } catch (error) {
      return { success: false, error: `恢复备份失败: ${error instanceof Error ? error.message : '未知错误'}` };
    }
  }

  // 导出备份为 JSON
  exportBackup(id: string): string | null {
    const backup = this.getBackupById(id);
    if (!backup) return null;

    return JSON.stringify({
      ...backup,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  // 导入备份
  importBackup(dataString: string): { success: boolean; backupId?: string; error?: string } {
    try {
      const data = JSON.parse(dataString);
      
      if (!data.id || !data.name || !data.data) {
        return { success: false, error: '无效的备份格式' };
      }

      // 检查是否已存在
      const existingIndex = this.backups.findIndex(b => b.id === data.id);
      if (existingIndex === -1) {
        this.backups.unshift(data);
      } else {
        this.backups[existingIndex] = data;
      }

      return { success: true, backupId: data.id };
    } catch (error) {
      return { success: false, error: '导入备份失败，请检查文件格式' };
    }
  }

  // 获取备份统计
  getBackupStats() {
    return {
      totalBackups: this.backups.length,
      totalSize: this.backups.reduce((sum, backup) => sum + backup.size, 0),
      latestBackup: this.backups[0]?.createdAt || null,
      oldestBackup: this.backups[this.backups.length - 1]?.createdAt || null
    };
  }

  // 清理旧备份（保留最近的 n 个）
  cleanupOldBackups(keepCount: number = 10): number {
    if (this.backups.length <= keepCount) return 0;

    const removedCount = this.backups.length - keepCount;
    this.backups = this.backups.slice(0, keepCount);
    return removedCount;
  }

  // 自动备份（根据配置）
  async autoBackup(configs: MCPConfig[], tools: AITool[], autoBackupConfig?: AutoBackupConfig): Promise<{ success: boolean; backupId?: string; error?: string }> {
    if (!autoBackupConfig?.enabled) {
      return { success: false, error: '自动备份未启用' };
    }

    try {
      // 检查是否需要备份（基于时间间隔）
      const lastBackup = this.backups[0];
      if (lastBackup) {
        const lastBackupTime = new Date(lastBackup.createdAt).getTime();
        const now = Date.now();
        const intervalMs = autoBackupConfig.intervalHours * 3600 * 1000;
        
        if (now - lastBackupTime < intervalMs) {
          return { success: false, error: '距离上次备份时间间隔太短' };
        }
      }

      const backupId = this.createBackup(
        `自动备份 ${new Date().toLocaleString()}`,
        `自动备份于 ${new Date().toLocaleString()}`,
        tools,
        configs
      );

      // 清理旧备份
      if (autoBackupConfig.maxBackups) {
        this.cleanupOldBackups(autoBackupConfig.maxBackups);
      }

      return { success: true, backupId };
    } catch (error) {
      return { success: false, error: `自动备份失败: ${error instanceof Error ? error.message : '未知错误'}` };
    }
  }

  // 计算备份大小
  private calculateBackupSize(data: { tools: AITool[]; configs: MCPConfig[] }): number {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  }
}

// 自动备份配置接口
interface AutoBackupConfig {
  enabled: boolean;
  intervalHours: number; // 备份间隔（小时）
  maxBackups: number; // 最大保留备份数量
}

// 导出单例
export const backupService = new BackupService();