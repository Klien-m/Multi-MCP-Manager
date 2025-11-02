import { AITool } from '../types';
import { DEFAULT_TOOLS, DEFAULT_TOOL_IDS, MCP_CONFIG_SUGGESTIONS } from '../test-data/default-configs';

/**
 * 工具配置服务 - 管理各种 AI 工具的配置文件读取
 */
export class ToolConfigService {
  private supportedTools: AITool[] = [...DEFAULT_TOOLS];

  // 获取所有支持的工具
  getSupportedTools(): AITool[] {
    return [...this.supportedTools];
  }

  // 添加自定义工具
  addCustomTool(tool: Omit<AITool, 'id'>): AITool {
    const newTool: AITool = {
      ...tool,
      id: `custom-${Date.now()}`
    };
    this.supportedTools.push(newTool);
    return newTool;
  }

  // 更新工具配置
  updateTool(toolId: string, updates: Partial<AITool>): boolean {
    const tool = this.supportedTools.find(t => t.id === toolId);
    if (!tool) return false;

    Object.assign(tool, updates);
    return true;
  }

  // 删除自定义工具
  deleteCustomTool(toolId: string): boolean {
    const index = this.supportedTools.findIndex(t => t.id === toolId);
    if (index === -1 || this.isDefaultTool(toolId)) return false;

    this.supportedTools.splice(index, 1);
    return true;
  }

  // 检查是否为默认工具
  private isDefaultTool(toolId: string): boolean {
    return DEFAULT_TOOL_IDS.includes(toolId);
  }

  // 扫描配置文件
  async scanConfigFiles(): Promise<Array<{ tool: AITool; exists: boolean; content?: string }>> {
    const results: Array<{ tool: AITool; exists: boolean; content?: string }> = [];

    for (const tool of this.supportedTools) {
      try {
        const configPath = this.resolvePath(tool.configPath || '');
        const exists = await this.checkFileExists(configPath);
        
        let content: string | undefined;
        if (exists) {
          content = await this.readFile(configPath);
        }

        results.push({
          tool,
          exists,
          content
        });
      } catch (error) {
        console.warn(`Failed to scan config for ${tool.name}:`, error);
        results.push({
          tool,
          exists: false
        });
      }
    }

    return results;
  }

  // 读取工具配置文件
  async readToolConfig(toolId: string): Promise<{ success: boolean; config?: any; error?: string }> {
    const tool = this.supportedTools.find(t => t.id === toolId);
    if (!tool) {
      return { success: false, error: '工具不存在' };
    }

    try {
      const configPath = this.resolvePath(tool.configPath || '');
      const content = await this.readFile(configPath);
      
      if (!content) {
        return { success: false, error: '配置文件不存在' };
      }

      const config = JSON.parse(content);
      return { success: true, config };
    } catch (error) {
      return { success: false, error: `读取配置失败: ${error instanceof Error ? error.message : '未知错误'}` };
    }
  }

  // 写入工具配置文件
  async writeToolConfig(toolId: string, config: any): Promise<{ success: boolean; error?: string }> {
    const tool = this.supportedTools.find(t => t.id === toolId);
    if (!tool) {
      return { success: false, error: '工具不存在' };
    }

    try {
      const configPath = this.resolvePath(tool.configPath || '');
      const content = JSON.stringify(config, null, 2);
      await this.writeFile(configPath, content);
      return { success: true };
    } catch (error) {
      return { success: false, error: `写入配置失败: ${error instanceof Error ? error.message : '未知错误'}` };
    }
  }

  // 解析路径（处理 ~ 符号）
  private resolvePath(path: string): string {
    if (path.startsWith('~/')) {
      // 在 Tauri 环境中，使用适当的路径解析
      // 这里先返回原始路径，后续可以集成 Tauri API 进行真实解析
      return path;
    }
    return path;
  }

  // 检查文件是否存在
  private async checkFileExists(path: string): Promise<boolean> {
    try {
      // 这里需要集成 Tauri 的文件系统 API
      // 暂时返回 false，等待 Tauri 集成
      return false;
    } catch {
      return false;
    }
  }

  // 读取文件内容
  private async readFile(path: string): Promise<string | undefined> {
    try {
      // 这里需要集成 Tauri 的文件系统 API
      // 暂时返回 undefined，等待 Tauri 集成
      return undefined;
    } catch {
      return undefined;
    }
  }

  // 写入文件内容
  private async writeFile(path: string, content: string): Promise<void> {
    try {
      // 这里需要集成 Tauri 的文件系统 API
      // 暂时抛出错误，等待 Tauri 集成
      throw new Error('文件写入功能需要 Tauri 支持');
    } catch {
      throw new Error('文件写入功能需要 Tauri 支持');
    }
  }

  // 获取工具的 MCP 配置建议
  getMCPConfigSuggestions(toolId: string): Array<{ name: string; description: string; config: any }> {
    return MCP_CONFIG_SUGGESTIONS[toolId as keyof typeof MCP_CONFIG_SUGGESTIONS] || [];
  }

  // 导出工具配置为 JSON
  exportToolConfigs(toolIds?: string[]): string {
    const tools = toolIds 
      ? this.supportedTools.filter(t => toolIds.includes(t.id))
      : this.supportedTools;

    return JSON.stringify({
      tools,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  // 导入工具配置
  importToolConfigs(dataString: string): { success: boolean; importedCount: number; error?: string } {
    try {
      const data = JSON.parse(dataString);
      
      if (!data.tools || !Array.isArray(data.tools)) {
        return { success: false, importedCount: 0, error: '无效的工具配置格式' };
      }

      let importedCount = 0;
      for (const tool of data.tools) {
        // 检查是否已存在
        const existingIndex = this.supportedTools.findIndex(t => t.id === tool.id);
        if (existingIndex === -1) {
          this.supportedTools.push(tool);
          importedCount++;
        } else {
          // 更新现有工具
          this.supportedTools[existingIndex] = tool;
          importedCount++;
        }
      }

      return { success: true, importedCount };
    } catch (error) {
      return { success: false, importedCount: 0, error: '导入失败，请检查文件格式' };
    }
  }
}

// 导出单例
export const toolConfigService = new ToolConfigService();