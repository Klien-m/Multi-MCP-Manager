import { appConfigDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, exists } from '@tauri-apps/plugin-fs';
import { ToolConfig, CustomDirectoryConfig } from '../types';
import { fileScannerService } from './fileScanner';

export class CustomDirectoryService {
  private static readonly CONFIG_FILE = 'custom-directories.json';

  /**
   * 获取自定义目录配置
   */
  static async getCustomDirectories(): Promise<CustomDirectoryConfig> {
    try {
      const configPath = await this.getConfigPath();
      if (await exists(configPath)) {
        const configData = await readTextFile(configPath);
        return JSON.parse(configData);
      }
    } catch (error) {
      console.warn('Failed to load custom directories config:', error);
    }
    
    // 返回默认配置
    return {
      customPaths: {},
      lastScanTime: null
    };
  }

  /**
   * 保存自定义目录配置
   */
  static async saveCustomDirectories(config: CustomDirectoryConfig): Promise<void> {
    try {
      const configPath = await this.getConfigPath();
        await writeTextFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Failed to save custom directories config:', error);
      throw new Error('保存自定义目录配置失败');
    }
  }

  /**
   * 添加自定义目录
   */
  static async addCustomDirectory(tool: ToolConfig, directory: string): Promise<void> {
    const config = await this.getCustomDirectories();
    
    if (!config.customPaths[tool.name]) {
      config.customPaths[tool.name] = [];
    }
    
    // 避免重复添加
    if (!config.customPaths[tool.name].includes(directory)) {
      config.customPaths[tool.name].push(directory);
      await this.saveCustomDirectories(config);
    }
  }

  /**
   * 移除自定义目录
   */
  static async removeCustomDirectory(tool: ToolConfig, directory: string): Promise<void> {
    const config = await this.getCustomDirectories();
    
    if (config.customPaths[tool.name]) {
      config.customPaths[tool.name] = config.customPaths[tool.name].filter(
        (path: string) => path !== directory
      );
      
      // 如果该工具没有自定义路径了，删除该工具的配置
      if (config.customPaths[tool.name].length === 0) {
        delete config.customPaths[tool.name];
      }
      
      await this.saveCustomDirectories(config);
    }
  }

  /**
   * 获取工具的所有目录（默认 + 自定义）
   */
  static async getToolDirectories(tool: ToolConfig): Promise<string[]> {
    const config = await this.getCustomDirectories();
    const customPaths = config.customPaths[tool.name] || [];
    
    return [tool.defaultPath, ...customPaths];
  }

  /**
   * 扫描所有工具的自定义目录
   */
  static async scanCustomDirectories(): Promise<{ [toolName: string]: string[] }> {
    const config = await this.getCustomDirectories();
    const results: { [toolName: string]: string[] } = {};
    
    for (const [toolName, directories] of Object.entries(config.customPaths)) {
      const allFiles: string[] = [];
      
      for (const directory of directories as string[]) {
        try {
          const scanResult = await fileScannerService.scanDirectory(directory);
          allFiles.push(...scanResult.files.map(file => file.path));
        } catch (error) {
          console.warn(`Failed to scan custom directory ${directory} for ${toolName}:`, error);
        }
      }
      
      if (allFiles.length > 0) {
        results[toolName] = allFiles;
      }
    }
    
    // 更新最后扫描时间
    config.lastScanTime = new Date().toISOString();
    await this.saveCustomDirectories(config);
    
    return results;
  }

  /**
   * 获取配置文件路径
   */
  private static async getConfigPath(): Promise<string> {
    const appDir = await appConfigDir();
    return `${appDir}${this.CONFIG_FILE}`;
  }
}