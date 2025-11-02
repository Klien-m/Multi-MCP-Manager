import { writeTextFile, readTextFile, exists, create } from '@tauri-apps/plugin-fs';
import { appConfigDir, appDataDir } from '@tauri-apps/api/path';
import { ToolConfig } from '../types';

export type { ToolConfig };

// 存储文件名
const CONFIG_FILE = 'app-config.json';
const DATA_FILE = 'user-data.json';

// 应用配置接口
export interface AppConfig {
  theme: 'light' | 'dark' | 'system';
  language: string;
  backupPath: string;
  showAdvanced: boolean;
  telemetryEnabled: boolean;
  lastSelectedToolId: string;
}

// 用户数据接口
export interface UserData {
  tools: ToolConfig[];
  configs: ConfigData[];
  version: string;
  createdAt: string;
  updatedAt: string;
}


// 配置数据接口
export interface ConfigData {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  lastModified: string;
  toolId: string;
}

// 默认配置
const DEFAULT_CONFIG: AppConfig = {
  theme: 'system',
  language: 'zh-CN',
  backupPath: '',
  showAdvanced: false,
  telemetryEnabled: false,
  lastSelectedToolId: ''
};

// 初始数据
const INITIAL_TOOLS: ToolConfig[] = [
  {
    id: "cursor",
    name: "Cursor",
    displayName: "Cursor",
    defaultPath: "~/.cursor/mcp.json",
    supportedFormats: ['json'],
    isActive: true
  },
  {
    id: "claude",
    name: "Claude Desktop",
    displayName: "Claude Desktop",
    defaultPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
    supportedFormats: ['json'],
    isActive: true
  }
];

const INITIAL_CONFIGS: ConfigData[] = [
  {
    id: "mcp-1",
    name: "filesystem-server",
    enabled: true,
    toolId: "cursor",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"],
      env: {}
    },
    lastModified: new Date().toISOString()
  },
  {
    id: "mcp-2",
    name: "github-server",
    enabled: false,
    toolId: "cursor",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "<YOUR_TOKEN>"
      }
    },
    lastModified: new Date().toISOString()
  },
  {
    id: "mcp-3",
    name: "postgres-server",
    enabled: true,
    toolId: "claude",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"],
      env: {}
    },
    lastModified: new Date().toISOString()
  },
  {
    id: "mcp-4",
    name: "brave-search",
    enabled: true,
    toolId: "claude",
    config: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: {
        BRAVE_API_KEY: "<YOUR_API_KEY>"
      }
    },
    lastModified: new Date().toISOString()
  }
];

class TauriStorageService {
  private configDir: string | null = null;
  private dataDir: string | null = null;

  /**
   * 初始化存储目录
   */
  private async ensureDirectories(): Promise<void> {
    if (!this.configDir) {
      this.configDir = await appConfigDir();
      this.dataDir = await appDataDir();
      
      // 确保目录存在
      try {
        // 使用writeTextFile会自动创建目录，所以我们先写一个临时文件来创建目录
        await writeTextFile(`${this.configDir}/.init`, '');
        await writeTextFile(`${this.dataDir}/.init`, '');
      } catch (error) {
        console.warn('Failed to create directories:', error);
      }
    }
  }

  /**
   * 获取配置文件路径
   */
  private async getConfigPath(): Promise<string> {
    await this.ensureDirectories();
    return `${this.configDir}/${CONFIG_FILE}`;
  }

  /**
   * 获取数据文件路径
   */
  private async getDataPath(): Promise<string> {
    await this.ensureDirectories();
    return `${this.dataDir}/${DATA_FILE}`;
  }

  /**
   * 保存应用配置
   */
  async saveConfig(config: AppConfig): Promise<void> {
    try {
      const configPath = await this.getConfigPath();
      await writeTextFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new Error('保存配置失败');
    }
  }

  /**
   * 加载应用配置
   */
  async loadConfig(): Promise<AppConfig> {
    try {
      const configPath = await this.getConfigPath();
      
      if (await exists(configPath)) {
        const content = await readTextFile(configPath);
        const savedConfig = JSON.parse(content);
        
        // 合并默认配置，确保所有字段都存在
        return { ...DEFAULT_CONFIG, ...savedConfig };
      }
    } catch (error) {
      console.warn('Failed to load config:', error);
    }
    
    // 返回默认配置
    return { ...DEFAULT_CONFIG };
  }

  /**
   * 保存用户数据
   */
  async saveUserData(data: UserData): Promise<void> {
    try {
      const dataPath = await this.getDataPath();
      const dataToSave = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await writeTextFile(dataPath, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw new Error('保存用户数据失败');
    }
  }

  /**
   * 加载用户数据
   */
  async loadUserData(): Promise<UserData | null> {
    try {
      const dataPath = await this.getDataPath();
      
      if (await exists(dataPath)) {
        const content = await readTextFile(dataPath);
        const savedData = JSON.parse(content);
        
        return {
          tools: savedData.tools || INITIAL_TOOLS,
          configs: savedData.configs || INITIAL_CONFIGS,
          version: savedData.version || '1.0.0',
          createdAt: savedData.createdAt || new Date().toISOString(),
          updatedAt: savedData.updatedAt || new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Failed to load user data:', error);
    }
    
    // 返回初始数据
    return {
      tools: INITIAL_TOOLS,
      configs: INITIAL_CONFIGS,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 重置所有数据
   */
  async resetAllData(): Promise<void> {
    try {
      await this.saveUserData({
        tools: INITIAL_TOOLS,
        configs: INITIAL_CONFIGS,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw new Error('重置数据失败');
    }
  }

  /**
   * 导出数据
   */
  async exportData(): Promise<string> {
    try {
      const userData = await this.loadUserData();
      if (!userData) {
        throw new Error('No user data found');
      }
      
      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('导出数据失败');
    }
  }

  /**
   * 导入数据
   */
  async importData(dataString: string): Promise<void> {
    try {
      const importedData = JSON.parse(dataString);
      
      if (!importedData.tools || !importedData.configs) {
        throw new Error('Invalid data format');
      }
      
      await this.saveUserData({
        tools: importedData.tools,
        configs: importedData.configs,
        version: importedData.version || '1.0.0',
        createdAt: importedData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('导入数据失败');
    }
  }
}

// 导出单例
export const tauriStorageService = new TauriStorageService();