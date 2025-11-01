import { MCPData } from '../types';
import { formatAdapterManager } from './formatAdapter';
import { MCPProcessor } from './mcpProcessor';

/**
 * 文件扫描结果接口
 */
export interface ScanResult {
  success: boolean;
  files: ScannedFile[];
  errors: string[];
  warnings: string[];
  scannedCount: number;
  foundCount: number;
}

/**
 * 扫描到的文件接口
 */
export interface ScannedFile {
  path: string;
  name: string;
  size: number;
  modifiedAt: string;
  format: string | null;
  mcpData: MCPData | null;
  error?: string;
}

/**
 * 文件扫描配置接口
 */
export interface ScanConfig {
  directories: string[];
  includeSubdirs?: boolean;
  supportedFormats?: string[];
  maxSize?: number; // in bytes
  excludePatterns?: string[];
}

/**
 * MCP文件扫描服务
 */
export class FileScannerService {
  private config: ScanConfig;
  private onProgress?: (progress: ScanProgress) => void;
  
  constructor(config: ScanConfig) {
    this.config = {
      includeSubdirs: true,
      supportedFormats: ['json', 'yaml', 'yml'],
      maxSize: 10 * 1024 * 1024, // 10MB
      excludePatterns: ['node_modules', '.git', 'backup'],
      ...config
    };
  }
  
  /**
   * 设置进度回调
   */
  setProgressCallback(callback: (progress: ScanProgress) => void): void {
    this.onProgress = callback;
  }
  
  /**
   * 扫描目录中的MCP文件
   */
  async scanDirectories(): Promise<ScanResult> {
    const results: ScanResult = {
      success: false,
      files: [],
      errors: [],
      warnings: [],
      scannedCount: 0,
      foundCount: 0
    };
    
    for (const directory of this.config.directories) {
      try {
        const dirResults = await this.scanDirectory(directory);
        results.files.push(...dirResults.files);
        results.errors.push(...dirResults.errors);
        results.warnings.push(...dirResults.warnings);
        results.scannedCount += dirResults.scannedCount;
        results.foundCount += dirResults.foundCount;
      } catch (error) {
        results.errors.push(`扫描目录 ${directory} 时出错: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }
    
    results.success = results.errors.length === 0 || results.foundCount > 0;
    return results;
  }
  
  /**
   * 扫描单个目录
   */
  public async scanDirectory(directory: string): Promise<ScanResult> {
    const results: ScanResult = {
      success: false,
      files: [],
      errors: [],
      warnings: [],
      scannedCount: 0,
      foundCount: 0
    };
    
    try {
      // 模拟文件系统操作 - 在实际实现中，这里会使用Tauri的文件系统API
      // 由于我们是在浏览器环境中，这里提供一个模拟实现
      const mockFiles = this.generateMockFiles(directory);
      
      for (let i = 0; i < mockFiles.length; i++) {
        const filePath = mockFiles[i];
        
        // 更新进度
        this.updateProgress({
          currentFile: i + 1,
          totalFiles: mockFiles.length,
          currentPath: filePath,
          status: 'scanning',
          progress: Math.round(((i + 1) / mockFiles.length) * 100)
        });
        
        try {
          const fileResult = await this.scanFile(filePath);
          if (fileResult) {
            results.files.push(fileResult);
            if (fileResult.mcpData) {
              results.foundCount++;
            }
          }
        } catch (error) {
          results.errors.push(`处理文件 ${filePath} 时出错: ${error instanceof Error ? error.message : '未知错误'}`);
        }
        
        results.scannedCount++;
      }
      
      results.success = true;
      
    } catch (error) {
      results.errors.push(`扫描目录 ${directory} 时出错: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    return results;
  }
  
  /**
   * 扫描单个文件
   */
  private async scanFile(filePath: string): Promise<ScannedFile | null> {
    try {
      // 模拟读取文件内容
      const fileContent = await this.readFileContent(filePath);
      
      if (!fileContent) {
        return null;
      }
      
      // 检测文件格式
      const format = formatAdapterManager.detectFormat(filePath, fileContent);
      if (!format || !this.config.supportedFormats?.includes(format)) {
        return {
          path: filePath,
          name: this.getFileName(filePath),
          size: fileContent.length,
          modifiedAt: new Date().toISOString(),
          format: null,
          mcpData: null,
          error: '不支持的文件格式'
        };
      }
      
      // 检查文件大小
      if (fileContent.length > (this.config.maxSize || 0)) {
        return {
          path: filePath,
          name: this.getFileName(filePath),
          size: fileContent.length,
          modifiedAt: new Date().toISOString(),
          format,
          mcpData: null,
          error: `文件大小超过限制 (${this.formatFileSize(this.config.maxSize || 0)})`
        };
      }
      
      // 解析MCP数据
      const mcpData = formatAdapterManager.parse(fileContent, this.detectSourceTool(filePath), format);
      
      return {
        path: filePath,
        name: this.getFileName(filePath),
        size: fileContent.length,
        modifiedAt: new Date().toISOString(),
        format,
        mcpData,
        error: mcpData ? undefined : '无法解析MCP数据'
      };
      
    } catch (error) {
      return {
        path: filePath,
        name: this.getFileName(filePath),
        size: 0,
        modifiedAt: new Date().toISOString(),
        format: null,
        mcpData: null,
        error: `读取文件时出错: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }
  
  /**
   * 读取文件内容（模拟实现）
   */
  private async readFileContent(filePath: string): Promise<string | null> {
    // 在实际实现中，这里会使用Tauri的文件读取API
    // 这里返回模拟的MCP数据
    if (filePath.includes('cursor') || filePath.includes('mcp.json')) {
      return JSON.stringify({
        id: `mock_${Date.now()}`,
        sourceTool: this.detectSourceTool(filePath),
        codeSnippets: [
          {
            id: `snippet_${Date.now()}`,
            content: 'console.log("Hello, World!");',
            language: 'javascript',
            description: 'A simple hello world example',
            tags: ['example', 'javascript'],
            context: {}
          }
        ],
        metadata: {
          name: 'Mock MCP Data',
          description: 'This is mock MCP data for testing',
          version: '1.0.0',
          author: 'Mock Author',
          tags: ['mock', 'test'],
          dependencies: [],
          configuration: {}
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return null;
  }
  
  /**
   * 从文件路径检测源工具
   */
  private detectSourceTool(filePath: string): string {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('cursor')) {
      return 'cursor';
    }
    if (lowerPath.includes('github') || lowerPath.includes('copilot')) {
      return 'github-copilot';
    }
    if (lowerPath.includes('tabnine')) {
      return 'tabnine';
    }
    if (lowerPath.includes('codex')) {
      return 'codex';
    }
    if (lowerPath.includes('kilo') || lowerPath.includes('code')) {
      return 'kilocode';
    }
    
    return 'unknown';
  }
  
  /**
   * 获取文件名
   */
  private getFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }
  
  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * 生成模拟文件列表
   */
  private generateMockFiles(directory: string): string[] {
    const mockFiles = [
      `${directory}/cursor/mcp.json`,
      `${directory}/github-copilot/mcp.json`,
      `${directory}/tabnine/mcp.json`,
      `${directory}/config/settings.json`,
      `${directory}/logs/app.log`
    ];
    
    return mockFiles.filter(filePath => {
      // 应用排除模式
      return !this.config.excludePatterns?.some(pattern => 
        filePath.includes(pattern)
      );
    });
  }
  
  /**
   * 更新进度
   */
  private updateProgress(progress: ScanProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }
  
  /**
   * 验证目录是否存在
   */
  async validateDirectory(directory: string): Promise<boolean> {
    try {
      // 在实际实现中，这里会使用Tauri的目录检查API
      // 这里简单返回true作为模拟
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 获取支持的文件格式
   */
  getSupportedFormats(): string[] {
    return this.config.supportedFormats || [];
  }
  
  /**
   * 检查路径是否为MCP文件
   */
  isMCPFile(filePath: string): boolean {
    const format = formatAdapterManager.detectFormat(filePath, '');
    return format !== null && this.config.supportedFormats?.includes(format) || false;
  }
  
  /**
   * 从扫描结果中提取有效的MCP数据
   */
  extractValidMCPData(scanResult: ScanResult): MCPData[] {
    return scanResult.files
      .filter(file => file.mcpData !== null && file.error === undefined)
      .map(file => file.mcpData!)
      .filter((mcpData): mcpData is MCPData => mcpData !== null);
  }
}

/**
 * 扫描进度接口
 */
export interface ScanProgress {
  currentFile: number;
  totalFiles: number;
  currentPath: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  progress: number;
}

// 导出单例
export const fileScannerService = new FileScannerService({
  directories: []
});