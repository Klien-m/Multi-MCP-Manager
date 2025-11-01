import { MCPData } from '../types';
import { formatAdapterManager, formatConversionService } from './formatAdapter';

/**
 * 导出配置接口
 */
export interface ExportConfig {
  targetFormat: string;
  targetTool?: string;
  includeMetadata?: boolean;
  includeCodeSnippets?: boolean;
  compressOutput?: boolean;
  fileName?: string;
  includeVersionInfo?: boolean;
}

/**
 * 导出结果接口
 */
export interface ExportResult {
  success: boolean;
  exportedFiles: ExportedFile[];
  errors: string[];
  warnings: string[];
  totalFiles: number;
  successfulExports: number;
  failedExports: number;
}

/**
 * 导出文件接口
 */
export interface ExportedFile {
  fileName: string;
  content: string;
  format: string;
  size: number;
  mimeType: string;
}

/**
 * 导出进度接口
 */
export interface ExportProgress {
  currentFile: number;
  totalFiles: number;
  currentFileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

/**
 * MCP数据导出服务
 */
export class ExportService {
  private config: ExportConfig;
  private onProgress?: (progress: ExportProgress) => void;
  
  constructor(config: ExportConfig) {
    this.config = {
      includeMetadata: true,
      includeCodeSnippets: true,
      compressOutput: false,
      includeVersionInfo: true,
      ...config
    };
  }
  
  /**
   * 设置进度回调
   */
  setProgressCallback(callback: (progress: ExportProgress) => void): void {
    this.onProgress = callback;
  }
  
  /**
   * 导出单个MCP数据
   */
  async exportMCPData(mcpData: MCPData): Promise<ExportResult> {
    const results: ExportResult = {
      success: false,
      exportedFiles: [],
      errors: [],
      warnings: [],
      totalFiles: 1,
      successfulExports: 0,
      failedExports: 0
    };
    
    try {
      // 更新进度
      this.updateProgress({
        currentFile: 1,
        totalFiles: 1,
        currentFileName: this.generateFileName(mcpData),
        status: 'processing',
        progress: 50
      });
      
      // 准备导出数据
      const exportData = this.prepareExportData(mcpData);
      
      // 转换为目标格式
      const convertedContent = formatAdapterManager.convert(exportData, this.config.targetFormat);
      if (!convertedContent) {
        results.errors.push(`无法转换为 ${this.config.targetFormat} 格式`);
        results.failedExports = 1;
        return results;
      }
      
      // 创建导出文件
      const fileName = this.config.fileName || this.generateFileName(mcpData);
      const mimeType = this.getMimeType(this.config.targetFormat);
      const size = new Blob([convertedContent]).size;
      
      const exportedFile: ExportedFile = {
        fileName,
        content: convertedContent,
        format: this.config.targetFormat,
        size,
        mimeType
      };
      
      results.exportedFiles.push(exportedFile);
      results.successfulExports = 1;
      results.success = true;
      
      // 完成进度
      this.updateProgress({
        currentFile: 1,
        totalFiles: 1,
        currentFileName: fileName,
        status: 'completed',
        progress: 100
      });
      
    } catch (error) {
      results.errors.push(`导出MCP数据 ${mcpData.id} 时出错: ${error instanceof Error ? error.message : '未知错误'}`);
      results.failedExports = 1;
    }
    
    return results;
  }
  
  /**
   * 批量导出MCP数据
   */
  async exportMCPDataBatch(mcpDataList: MCPData[]): Promise<ExportResult> {
    const results: ExportResult = {
      success: false,
      exportedFiles: [],
      errors: [],
      warnings: [],
      totalFiles: mcpDataList.length,
      successfulExports: 0,
      failedExports: 0
    };
    
    for (let i = 0; i < mcpDataList.length; i++) {
      const mcpData = mcpDataList[i];
      
      // 更新进度
      this.updateProgress({
        currentFile: i + 1,
        totalFiles: mcpDataList.length,
        currentFileName: this.generateFileName(mcpData),
        status: 'processing',
        progress: Math.round(((i + 1) / mcpDataList.length) * 100)
      });
      
      try {
        const fileResult = await this.exportMCPData(mcpData);
        
        results.exportedFiles.push(...fileResult.exportedFiles);
        results.errors.push(...fileResult.errors);
        results.warnings.push(...fileResult.warnings);
        results.successfulExports += fileResult.successfulExports;
        results.failedExports += fileResult.failedExports;
        
      } catch (error) {
        results.errors.push(`处理MCP数据 ${mcpData.id} 时出错: ${error instanceof Error ? error.message : '未知错误'}`);
        results.failedExports++;
      }
    }
    
    results.success = results.failedExports === 0 || results.successfulExports > 0;
    
    // 完成进度
    this.updateProgress({
      currentFile: mcpDataList.length,
      totalFiles: mcpDataList.length,
      currentFileName: '完成',
      status: 'completed',
      progress: 100
    });
    
    return results;
  }
  
  /**
   * 导出为文件并下载
   */
  async exportAndDownload(mcpData: MCPData): Promise<boolean> {
    try {
      const result = await this.exportMCPData(mcpData);
      
      if (result.success && result.exportedFiles.length > 0) {
        const file = result.exportedFiles[0];
        return this.downloadFile(file);
      }
      
      return false;
    } catch (error) {
      console.error('导出并下载文件时出错:', error);
      return false;
    }
  }
  
  /**
   * 批量导出并下载
   */
  async exportBatchAndDownload(mcpDataList: MCPData[]): Promise<boolean> {
    try {
      const result = await this.exportMCPDataBatch(mcpDataList);
      
      if (result.success) {
        for (const file of result.exportedFiles) {
          this.downloadFile(file);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('批量导出并下载文件时出错:', error);
      return false;
    }
  }
  
  /**
   * 导出为剪贴板内容
   */
  async exportToClipboard(mcpData: MCPData): Promise<boolean> {
    try {
      const result = await this.exportMCPData(mcpData);
      
      if (result.success && result.exportedFiles.length > 0) {
        const file = result.exportedFiles[0];
        await navigator.clipboard.writeText(file.content);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('导出到剪贴板时出错:', error);
      return false;
    }
  }
  
  /**
   * 生成文件名
   */
  private generateFileName(mcpData: MCPData): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const safeName = mcpData.metadata.name.replace(/[^a-zA-Z0-9]/g, '-');
    const extension = this.getFileExtension(this.config.targetFormat);
    
    return `${safeName}_${timestamp}.${extension}`;
  }
  
  /**
   * 获取文件扩展名
   */
  private getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yml'
    };
    
    return extensions[format.toLowerCase()] || format.toLowerCase();
  }
  
  /**
   * 获取MIME类型
   */
  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'json': 'application/json',
      'yaml': 'application/x-yaml',
      'yml': 'application/x-yaml'
    };
    
    return mimeTypes[format.toLowerCase()] || 'application/octet-stream';
  }
  
  /**
   * 准备导出数据
   */
  private prepareExportData(mcpData: MCPData): MCPData {
    let exportData = { ...mcpData };
    
    // 根据配置过滤数据
    if (!this.config.includeMetadata) {
      exportData = {
        ...exportData,
        metadata: {
          name: mcpData.metadata.name,
          version: mcpData.metadata.version
        } as any
      };
    }
    
    if (!this.config.includeCodeSnippets) {
      exportData = {
        ...exportData,
        codeSnippets: []
      };
    }
    
    // 添加版本信息
    if (this.config.includeVersionInfo) {
      exportData = {
        ...exportData,
        metadata: {
          ...exportData.metadata,
          configuration: {
            ...exportData.metadata.configuration,
            exportedAt: new Date().toISOString(),
            exportedBy: 'MCP Unified Manager',
            exportVersion: '1.0.0'
          }
        }
      };
    }
    
    return exportData;
  }
  
  /**
   * 下载文件
   */
  private downloadFile(file: ExportedFile): boolean {
    try {
      const blob = new Blob([file.content], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = file.fileName;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('下载文件时出错:', error);
      return false;
    }
  }
  
  /**
   * 检查格式是否支持导出
   */
  isFormatSupported(format: string): boolean {
    const supportedFormats = formatAdapterManager.getSupportedFormats();
    return supportedFormats.includes(format.toLowerCase());
  }
  
  /**
   * 获取支持的导出格式
   */
  getSupportedFormats(): string[] {
    return formatAdapterManager.getSupportedFormats();
  }
  
  /**
   * 获取导出建议
   */
  getExportSuggestions(mcpData: MCPData): string[] {
    const suggestions = [];
    
    if (this.config.targetTool) {
      suggestions.push(`导出为 ${this.config.targetTool} 兼容格式`);
    }
    
    if (this.config.targetFormat) {
      suggestions.push(`使用 ${this.config.targetFormat} 格式`);
    }
    
    if (this.config.includeMetadata) {
      suggestions.push('包含元数据信息');
    }
    
    if (this.config.includeCodeSnippets) {
      suggestions.push('包含代码片段');
    }
    
    return suggestions;
  }
  
  /**
   * 更新进度
   */
  private updateProgress(progress: ExportProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }
  
  /**
   * 创建针对特定AI工具的导出配置
   */
  static createToolExportConfig(tool: string, customConfig: Partial<ExportConfig> = {}): ExportConfig {
    const baseConfigs: Record<string, ExportConfig> = {
      'github-copilot': {
        targetFormat: 'json',
        targetTool: 'github-copilot',
        includeMetadata: true,
        includeCodeSnippets: true,
        includeVersionInfo: true
      },
      'tabnine': {
        targetFormat: 'json',
        targetTool: 'tabnine',
        includeMetadata: true,
        includeCodeSnippets: true,
        includeVersionInfo: true
      },
      'cursor': {
        targetFormat: 'json',
        targetTool: 'cursor',
        includeMetadata: true,
        includeCodeSnippets: true,
        includeVersionInfo: true
      },
      'codex': {
        targetFormat: 'json',
        targetTool: 'codex',
        includeMetadata: true,
        includeCodeSnippets: true,
        includeVersionInfo: true
      },
      'kilocode': {
        targetFormat: 'json',
        targetTool: 'kilocode',
        includeMetadata: true,
        includeCodeSnippets: true,
        includeVersionInfo: true
      }
    };
    
    const baseConfig = baseConfigs[tool] || {
      targetFormat: 'json',
      targetTool: tool,
      includeMetadata: true,
      includeCodeSnippets: true,
      includeVersionInfo: true
    };
    
    return { ...baseConfig, ...customConfig };
  }
}

// 导出单例
export const exportService = new ExportService({
  targetFormat: 'json',
  includeMetadata: true,
  includeCodeSnippets: true,
  includeVersionInfo: true
});