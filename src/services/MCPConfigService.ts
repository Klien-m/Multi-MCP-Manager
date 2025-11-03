import { MCPConfig, AITool } from '../types';
import { DEFAULT_TOOLS, DEFAULT_MCP_CONFIGS } from '../data/default-configs';

/**
 * MCP 配置服务 - 统一的配置管理核心
 */
export class MCPConfigService {
  private configs: MCPConfig[] = [];
  private tools: AITool[] = [];

  // 初始化默认配置
  initializeDefaultConfigs(): void {
    this.tools = [];
    this.configs = [];
  }

  // 获取所有配置
  getAllConfigs(): MCPConfig[] {
    return [...this.configs];
  }

  // 根据工具ID获取配置
  getConfigsByTool(toolId: string): MCPConfig[] {
    return this.configs.filter(config => config.toolId === toolId);
  }

  // 获取单个配置
  getConfigById(id: string): MCPConfig | undefined {
    return this.configs.find(config => config.id === id);
  }

  // 添加新配置
  addConfig(config: Omit<MCPConfig, 'id' | 'lastModified'>): MCPConfig {
    const newConfig: MCPConfig = {
      ...config,
      id: this.generateId(),
      lastModified: new Date().toISOString()
    };
    this.configs.push(newConfig);
    return newConfig;
  }

  // 更新配置
  updateConfig(updatedConfig: MCPConfig): boolean {
    const index = this.configs.findIndex(config => config.id === updatedConfig.id);
    if (index === -1) return false;

    this.configs[index] = {
      ...updatedConfig,
      lastModified: new Date().toISOString()
    };
    return true;
  }

  // 删除配置
  deleteConfig(id: string): boolean {
    const index = this.configs.findIndex(config => config.id === id);
    if (index === -1) return false;

    this.configs.splice(index, 1);
    return true;
  }

  // 复制配置（保持原有功能）
  copyConfig(sourceId: string, targetId: string): boolean {
    const source = this.configs.find(config => config.id === sourceId);
    if (!source) return false;

    const targetIndex = this.configs.findIndex(config => config.id === targetId);
    if (targetIndex === -1) return false;

    this.configs[targetIndex] = {
      ...this.configs[targetIndex],
      config: { ...source.config },
      lastModified: new Date().toISOString()
    };
    return true;
  }

  // 切换配置启用状态
  toggleConfig(id: string): boolean {
    const config = this.configs.find(config => config.id === id);
    if (!config) return false;

    config.enabled = !config.enabled;
    config.lastModified = new Date().toISOString();
    return true;
  }

  // 搜索配置
  searchConfigs(query: string, toolId?: string): MCPConfig[] {
    let configs = this.configs;
    if (toolId) {
      configs = this.getConfigsByTool(toolId);
    }

    if (!query.trim()) return configs;

    const lowerQuery = query.toLowerCase();
    return configs.filter(config =>
      config.name.toLowerCase().includes(lowerQuery) ||
      config.id.toLowerCase().includes(lowerQuery)
    );
  }

  // 获取所有工具
  getAllTools(): AITool[] {
    return [...this.tools];
  }

  // 添加新工具
  addTool(tool: Omit<AITool, 'id'>): AITool {
    const newTool: AITool = {
      ...tool,
      id: `tool-${Date.now()}`
    };
    this.tools.push(newTool);
    return newTool;
  }

  // 更新工具
  updateTool(updatedTool: AITool): boolean {
    const index = this.tools.findIndex(tool => tool.id === updatedTool.id);
    if (index === -1) return false;

    this.tools[index] = updatedTool;
    return true;
  }

  // 删除工具
  deleteTool(id: string): boolean {
    const index = this.tools.findIndex(tool => tool.id === id);
    if (index === -1) return false;

    // 删除该工具的所有配置
    this.configs = this.configs.filter(config => config.toolId !== id);
    this.tools.splice(index, 1);
    return true;
  }

  // 导出数据为 JSON
  exportData(toolId?: string): string {
    const data = toolId 
      ? {
          tool: this.tools.find(t => t.id === toolId),
          configs: this.getConfigsByTool(toolId)
        }
      : {
          tools: this.tools,
          configs: this.configs
        };
    
    return JSON.stringify(data, null, 2);
  }

  // 导入数据
  importData(dataString: string): { success: boolean; message: string } {
    try {
      const imported = JSON.parse(dataString);
      
      if (imported.tools && imported.configs) {
        // 全量导入
        this.tools = imported.tools;
        this.configs = imported.configs;
        return { success: true, message: `成功导入 ${imported.tools.length} 个工具和 ${imported.configs.length} 个配置` };
      } else if (imported.tool && imported.configs) {
        // 单工具导入
        const toolExists = this.tools.find(t => t.id === imported.tool.id);
        if (!toolExists) {
          this.tools.push(imported.tool);
        }
        
        const updatedConfigs = imported.configs.map((config: any) => ({
          ...config,
          toolId: imported.tool.id
        }));
        
        this.configs = this.configs.filter((c: MCPConfig) => c.toolId !== imported.tool.id);
        this.configs.push(...updatedConfigs);
        
        return { success: true, message: `成功导入工具 ${imported.tool.name} 的 ${imported.configs.length} 个配置` };
      } else if (Array.isArray(imported)) {
        // 兼容旧格式
        this.configs.push(...imported.map((c: any) => ({
          ...c,
          toolId: c.toolId || this.tools[0]?.id
        })));
        return { success: true, message: `成功导入 ${imported.length} 个配置` };
      } else {
        return { success: false, message: "无效的配置文件格式" };
      }
    } catch (e) {
      return { success: false, message: "导入失败，请检查文件格式" };
    }
  }

  // 获取配置统计
  getConfigStats() {
    return this.tools.reduce((acc, tool) => {
      const toolConfigs = this.configs.filter(c => c.toolId === tool.id);
      acc[tool.id] = {
        total: toolConfigs.length,
        enabled: toolConfigs.filter(c => c.enabled).length
      };
      return acc;
    }, {} as Record<string, { total: number; enabled: number }>);
  }

  // 生成唯一ID
  private generateId(): string {
    return `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 保存数据到 JSON 字符串
  saveToJson(): string {
    return JSON.stringify({
      tools: this.tools,
      configs: this.configs,
      version: '1.0.0',
      savedAt: new Date().toISOString()
    }, null, 2);
  }

  // 从 JSON 字符串加载数据
  loadFromJson(dataString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(dataString);
      
      if (data.tools && data.configs) {
        this.tools = data.tools;
        this.configs = data.configs;
        return { success: true, message: "数据加载成功" };
      } else {
        return { success: false, message: "数据格式无效" };
      }
    } catch (e) {
      return { success: false, message: "JSON 解析失败" };
    }
  }
}

// 导出单例
export const mcpConfigService = new MCPConfigService();