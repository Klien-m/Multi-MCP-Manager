import { storageService } from './storageService';
import { ToolConfig } from '../types';

class ToolConfigManager {
  /**
   * 获取所有工具配置
   */
  static async getToolConfigs(): Promise<ToolConfig[]> {
    try {
      const userData = await storageService.loadUserData();
      return userData?.toolConfigs || [];
    } catch (error) {
      console.error('Failed to load tool configs:', error);
      return [];
    }
  }

  /**
   * 保存工具配置
   */
  static async saveToolConfigs(configs: ToolConfig[]): Promise<void> {
    try {
      const userData = await storageService.loadUserData() || {
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

      userData.toolConfigs = configs;
      await storageService.saveUserData(userData);
    } catch (error) {
      console.error('Failed to save tool configs:', error);
      throw new Error('Failed to save tool configurations');
    }
  }

  /**
   * 添加新的工具配置
   */
  static async addToolConfig(config: ToolConfig): Promise<void> {
    try {
      const configs = await this.getToolConfigs();
      configs.push(config);
      await this.saveToolConfigs(configs);
    } catch (error) {
      console.error('Failed to add tool config:', error);
      throw new Error('Failed to add tool configuration');
    }
  }

  /**
   * 更新工具配置
   */
  static async updateToolConfig(toolName: string, config: Partial<ToolConfig>): Promise<void> {
    try {
      const configs = await this.getToolConfigs();
      const index = configs.findIndex(c => c.name === toolName);
      if (index !== -1) {
        configs[index] = { ...configs[index], ...config };
        await this.saveToolConfigs(configs);
      }
    } catch (error) {
      console.error('Failed to update tool config:', error);
      throw new Error('Failed to update tool configuration');
    }
  }

  /**
   * 删除工具配置
   */
  static async removeToolConfig(toolName: string): Promise<void> {
    try {
      const configs = await this.getToolConfigs();
      const filteredConfigs = configs.filter(c => c.name !== toolName);
      await this.saveToolConfigs(filteredConfigs);
    } catch (error) {
      console.error('Failed to remove tool config:', error);
      throw new Error('Failed to remove tool configuration');
    }
  }

  /**
   * 获取活跃的工具配置
   */
  static async getActiveToolConfigs(): Promise<ToolConfig[]> {
    try {
      const configs = await this.getToolConfigs();
      return configs.filter(config => config.isActive);
    } catch (error) {
      console.error('Failed to get active tool configs:', error);
      return [];
    }
  }

  /**
   * 检查工具是否存在
   */
  static async toolExists(toolName: string): Promise<boolean> {
    try {
      const configs = await this.getToolConfigs();
      return configs.some(config => config.name === toolName);
    } catch (error) {
      console.error('Failed to check tool existence:', error);
      return false;
    }
  }

  /**
   * 获取工具配置详情
   */
  static async getToolConfig(toolName: string): Promise<ToolConfig | null> {
    try {
      const configs = await this.getToolConfigs();
      return configs.find(config => config.name === toolName) || null;
    } catch (error) {
      console.error('Failed to get tool config:', error);
      return null;
    }
  }

  /**
   * 批量保存工具配置
   */
  static async batchSaveToolConfigs(configs: ToolConfig[]): Promise<void> {
    try {
      await this.saveToolConfigs(configs);
    } catch (error) {
      console.error('Failed to batch save tool configs:', error);
      throw new Error('Failed to batch save tool configurations');
    }
  }

  /**
   * 重置工具配置为默认值
   */
  static async resetToolConfigs(): Promise<void> {
    try {
      const defaultConfigs: ToolConfig[] = [
        {
          id: 'cursor',
          name: 'cursor',
          displayName: 'Cursor',
          defaultPath: '',
          customPath: '',
          isActive: true,
          supportedFormats: ['json', 'yaml', 'yml'],
          lastSync: undefined,
        },
        {
          id: 'claude-code',
          name: 'claude-code',
          displayName: 'Claude Code',
          defaultPath: '',
          customPath: '',
          isActive: true,
          supportedFormats: ['json', 'yaml', 'yml'],
          lastSync: undefined,
        },
        {
          id: 'zed',
          name: 'zed',
          displayName: 'Zed',
          defaultPath: '',
          customPath: '',
          isActive: true,
          supportedFormats: ['json', 'yaml', 'yml'],
          lastSync: undefined,
        },
        {
          id: 'vscode',
          name: 'vscode',
          displayName: 'Visual Studio Code',
          defaultPath: '',
          customPath: '',
          isActive: true,
          supportedFormats: ['json', 'yaml', 'yml'],
          lastSync: undefined,
        },
      ];

      await this.saveToolConfigs(defaultConfigs);
    } catch (error) {
      console.error('Failed to reset tool configs:', error);
      throw new Error('Failed to reset tool configurations');
    }
  }
}

export { ToolConfigManager };