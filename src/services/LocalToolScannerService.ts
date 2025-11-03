import { AITool, MCPConfig } from '../types';
import { EXTENDED_TOOL_SCAN_CONFIGS, DEFAULT_TOOLS } from '../data/default-configs';
import { tauriFileService } from './TauriFileService';
import { createLogger } from './LoggerService';

/**
 * 扫描结果接口
 */
export interface ScanResult {
  toolId: string;
  toolName: string;
  foundConfigs: FoundMCPConfig[];
  scanStatus: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

/**
 * 发现的MCP配置接口
 */
export interface FoundMCPConfig {
  name: string;
  description: string;
  config: any;
  sourceFile: string;
}

/**
 * 扫描进度回调
 */
export type ScanProgressCallback = (progress: {
  current: number;
  total: number;
  status: string;
  toolId?: string;
}) => void;

/**
 * 本地AI工具MCP扫描服务
 * 负责扫描本地系统中的AI工具配置文件并转换为项目支持的格式
 */
export class LocalToolScannerService {
  private scanConfigs = EXTENDED_TOOL_SCAN_CONFIGS;
  private supportedTools: AITool[] = [];
  private logger = createLogger('LocalToolScannerService');

  constructor() {
    // 初始化默认支持的工具
    this.setSupportedTools(DEFAULT_TOOLS);
  }

  /**
   * 设置支持的工具列表
   */
  setSupportedTools(tools: AITool[]): void {
    this.supportedTools = tools;
  }

  /**
   * 扫描指定的 AI 工具列表
   */
  async scanTools(tools: AITool[], progressCallback?: ScanProgressCallback): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    
    progressCallback?.({
      current: 0,
      total: tools.length,
      status: '开始扫描指定的AI工具...'
    });

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      progressCallback?.({
        current: i + 1,
        total: tools.length,
        status: `正在扫描 ${tool.name}...`,
        toolId: tool.id
      });

      try {
        this.logger.debug(`开始扫描工具: ${tool.name} (${tool.id})`);
        const result = await this.scanSingleTool(tool);
        this.logger.info(`完成扫描工具: ${tool.name} (${tool.id})`, {
          status: result.scanStatus,
          configCount: result.foundConfigs.length
        });
        results.push(result);
      } catch (error) {
        this.logger.error(`扫描工具失败: ${tool.name} (${tool.id})`, error as Error);
        results.push({
          toolId: tool.id,
          toolName: tool.name,
          foundConfigs: [],
          scanStatus: 'failed',
          errorMessage: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    progressCallback?.({
      current: tools.length,
      total: tools.length,
      status: '扫描完成'
    });

    return results;
  }

  /**
   * 扫描所有支持的AI工具
   */
  async scanAllTools(
    progressCallback?: ScanProgressCallback
  ): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const toolsToScan = this.getToolsToScan();
    
    progressCallback?.({
      current: 0,
      total: toolsToScan.length,
      status: '开始扫描本地AI工具...'
    });

    for (let i = 0; i < toolsToScan.length; i++) {
      const tool = toolsToScan[i];
      progressCallback?.({
        current: i + 1,
        total: toolsToScan.length,
        status: `正在扫描 ${tool.name}...`,
        toolId: tool.id
      });

      try {
        this.logger.debug(`开始扫描工具: ${tool.name} (${tool.id})`);
        const result = await this.scanSingleTool(tool);
        this.logger.info(`完成扫描工具: ${tool.name} (${tool.id})`, {
          status: result.scanStatus,
          configCount: result.foundConfigs.length
        });
        results.push(result);
      } catch (error) {
        this.logger.error(`扫描工具失败: ${tool.name} (${tool.id})`, error as Error);
        results.push({
          toolId: tool.id,
          toolName: tool.name,
          foundConfigs: [],
          scanStatus: 'failed',
          errorMessage: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    progressCallback?.({
      current: toolsToScan.length,
      total: toolsToScan.length,
      status: '扫描完成'
    });

    return results;
  }

  /**
   * 扫描单个工具
   */
  async scanSingleTool(tool: AITool): Promise<ScanResult> {
    const toolConfig = this.scanConfigs[tool.id as keyof typeof this.scanConfigs];
    if (!toolConfig) {
      return {
        toolId: tool.id,
        toolName: tool.name,
        foundConfigs: [],
        scanStatus: 'failed',
        errorMessage: '不支持的工具类型'
      };
    }

    const foundConfigs: FoundMCPConfig[] = [];
    let scanStatus: 'success' | 'partial' | 'failed' = 'success';
    let errorMessage: string | undefined;

    try {
      // 扫描所有可能的配置文件路径
      for (const configPath of toolConfig.paths) {
        try {
          const resolvedPath = await this.resolvePath(configPath);
          this.logger.debug(`扫描配置文件: ${resolvedPath}`);
          const fileExists = await this.checkFileExists(resolvedPath);
          
          if (fileExists) {
            const fileContent = await this.readFile(resolvedPath);
            if (fileContent) {
              this.logger.info(`发现配置文件: ${resolvedPath}`, {
                toolId: tool.id,
                toolName: tool.name
              });
              const configs = await this.parseMCPConfigurations(
                fileContent,
                resolvedPath,
                toolConfig
              );
              foundConfigs.push(...configs);
            } else {
              this.logger.warn(`配置文件为空: ${resolvedPath}`);
            }
          } else {
            this.logger.debug(`配置文件不存在: ${resolvedPath}`);
          }
        } catch (error) {
          this.logger.error(`扫描路径失败: ${configPath}`, error as Error);
          scanStatus = 'partial';
        }
      }
    } catch (error) {
      scanStatus = 'failed';
      errorMessage = error instanceof Error ? error.message : '扫描过程中发生错误';
    }

    return {
      toolId: tool.id,
      toolName: tool.name,
      foundConfigs,
      scanStatus,
      errorMessage
    };
  }

  /**
   * 解析MCP配置文件
   */
  private async parseMCPConfigurations(
    content: string,
    sourceFile: string,
    toolConfig: any
  ): Promise<FoundMCPConfig[]> {
    const configs: FoundMCPConfig[] = [];
    
    try {
      const parsed = JSON.parse(content);
      
      // 直接解析 mcpServers 配置
      if (parsed.mcpServers) {
        for (const [serverName, serverConfig] of Object.entries(parsed.mcpServers)) {
          configs.push({
            name: serverName,
            description: `从 ${serverName} 配置转换`,
            config: serverConfig,
            sourceFile
          });
        }
      }
      
      // 如果没有 mcpServers，尝试通用解析
      if (configs.length === 0) {
        const genericConfig = this.parseGenericMCPConfig(parsed, sourceFile);
        if (genericConfig) {
          configs.push(genericConfig);
        }
      }
      
    } catch (error) {
      this.logger.error(`解析MCP配置失败: ${sourceFile}`, error as Error);
    }
    
    return configs;
  }

  /**
   * 解析通用MCP配置
   */
  private parseGenericMCPConfig(config: any, sourceFile: string): FoundMCPConfig | null {
    // 尝试从常见字段提取配置信息
    const command = config?.command || 'npx';
    const args = config?.args || ['-y', '@modelcontextprotocol/server-local'];
    const env = config?.env || config?.environment || {};
    
    if (command || args.length > 0) {
      return {
        name: 'generic-config',
        description: '从通用配置字段提取',
        config: { command, args, env },
        sourceFile
      };
    }
    
    return null;
  }

  /**
   * 获取需要扫描的工具列表
   */
  private getToolsToScan(): AITool[] {
    return this.supportedTools.filter(tool => {
      return this.scanConfigs[tool.id as keyof typeof this.scanConfigs];
    });
  }

  /**
   * 解析路径（处理 ~ 符号）
   */
  private async resolvePath(path: string): Promise<string> {
    this.logger.debug(`解析路径: ${path}`);
    return await tauriFileService.resolvePath(path);
  }

  /**
   * 检查文件是否存在
   */
  private async checkFileExists(path: string): Promise<boolean> {
    this.logger.debug(`检查文件存在性: ${path}`);
    return await tauriFileService.checkFileExists(path);
  }

  /**
   * 读取文件内容
   */
  private async readFile(path: string): Promise<string | undefined> {
    this.logger.debug(`读取文件: ${path}`);
    return await tauriFileService.readFile(path);
  }

  /**
   * 将扫描结果转换为MCPConfig格式
   */
  convertToMCPConfigs(scanResults: ScanResult[]): MCPConfig[] {
    const configs: MCPConfig[] = [];
    
    this.logger.info(`转换扫描结果为MCP配置`, {
      totalResults: scanResults.length,
      totalConfigs: scanResults.reduce((sum, result) => sum + result.foundConfigs.length, 0)
    });
    
    for (const result of scanResults) {
      if (result.scanStatus === 'success' || result.scanStatus === 'partial') {
        for (const foundConfig of result.foundConfigs) {
          const mcpConfig: MCPConfig = {
            id: `scan-${result.toolId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: foundConfig.name,
            enabled: true, // 简化逻辑，所有扫描到的配置都启用
            config: foundConfig.config,
            lastModified: new Date().toISOString(),
            toolId: result.toolId
          };
          configs.push(mcpConfig);
        }
      }
    }
    
    this.logger.info(`转换完成`, {
      generatedConfigs: configs.length
    });
    
    return configs;
  }

  /**
   * 从扫描结果创建 AITool 对象
   * 只有当工具实际扫描到 MCP 配置时才创建 AITool
   */
  createAIToolsFromScanResults(scanResults: ScanResult[]): AITool[] {
    const tools: AITool[] = [];
    const processedToolIds = new Set<string>();

    for (const result of scanResults) {
      // 当工具成功或部分成功扫描到 MCP 配置时才创建 AITool
      if ((result.scanStatus === 'success' || result.scanStatus === 'partial') && result.foundConfigs.length > 0) {
        if (!processedToolIds.has(result.toolId)) {
          processedToolIds.add(result.toolId);
          
          // 从支持的工具列表中查找工具信息
          const toolInfo = this.supportedTools.find(tool => tool.id === result.toolId);
          
          const tool: AITool = {
            id: result.toolId,
            name: result.toolName,
            icon: toolInfo?.icon || 'https://via.placeholder.com/32x32?text=AI',
            defaultPath: toolInfo?.defaultPath || `~/.${result.toolId}/mcp.json`
          };
          
          tools.push(tool);
        }
      }
    }

    return tools;
  }

  /**
   * 检测重复配置
   */
  detectDuplicates(configs: MCPConfig[]): Array<{ original: MCPConfig; duplicates: MCPConfig[] }> {
    const duplicates: Array<{ original: MCPConfig; duplicates: MCPConfig[] }> = [];
    const processed = new Set<string>();
    
    for (const config of configs) {
      const configKey = this.getConfigKey(config);
      
      if (!processed.has(configKey)) {
        processed.add(configKey);
        
        // 查找相同配置的其他实例
        const sameConfigs = configs.filter(c => 
          c.toolId === config.toolId && 
          this.getConfigKey(c) === configKey &&
          c.id !== config.id
        );
        
        if (sameConfigs.length > 0) {
          duplicates.push({
            original: config,
            duplicates: sameConfigs
          });
        }
      }
    }
    
    return duplicates;
  }

  /**
   * 生成配置唯一键
   */
  private getConfigKey(config: MCPConfig): string {
    return `${config.toolId}-${JSON.stringify(config.config)}-${config.name}`;
  }
}

// 导出单例
export const localToolScannerService = new LocalToolScannerService();