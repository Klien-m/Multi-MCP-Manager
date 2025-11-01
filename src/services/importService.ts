import { MCPData, ValidationResult } from '../types';
import { formatAdapterManager, formatConversionService } from './formatAdapter';
import { MCPProcessor } from './mcpProcessor';

/**
 * 导入配置接口
 */
export interface ImportConfig {
  sourceTool?: string;
  targetFormat?: string;
  validateBeforeImport?: boolean;
  mergeExisting?: boolean;
  createBackup?: boolean;
}

/**
 * 导入结果接口
 */
export interface ImportResult {
  success: boolean;
  importedData: MCPData[];
  errors: string[];
  warnings: string[];
  totalFiles: number;
  successfulImports: number;
  failedImports: number;
}

/**
 * 导入进度接口
 */
export interface ImportProgress {
  currentFile: number;
  totalFiles: number;
  currentFileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

/**
 * MCP数据导入服务
 */
export class ImportService {
  private config: ImportConfig;
  private onProgress?: (progress: ImportProgress) => void;
  
  constructor(config: ImportConfig = {}) {
    this.config = {
      validateBeforeImport: true,
      mergeExisting: false,
      createBackup: true,
      ...config
    };
  }
  
  /**
   * 设置进度回调
   */
  setProgressCallback(callback: (progress: ImportProgress) => void): void {
    this.onProgress = callback;
  }
  
  /**
   * 从文件导入MCP数据
   */
  async importFromFile(file: File, sourceTool?: string): Promise<ImportResult> {
    const results: ImportResult = {
      success: false,
      importedData: [],
      errors: [],
      warnings: [],
      totalFiles: 1,
      successfulImports: 0,
      failedImports: 0
    };
    
    try {
      // 读取文件内容
      const content = await this.readFileContent(file);
      
      // 检测文件格式
      const format = formatAdapterManager.detectFormat(file.name, content);
      if (!format) {
        results.errors.push(`无法检测文件格式: ${file.name}`);
        results.failedImports = 1;
        return results;
      }
      
      // 验证文件内容
      if (this.config.validateBeforeImport) {
        const validation = formatAdapterManager.validate(content, format);
        if (!validation.isValid) {
          results.errors.push(...validation.errors);
          results.warnings.push(...validation.warnings);
          results.failedImports = 1;
          return results;
        }
      }
      
      // 解析MCP数据
      const mcpData = formatAdapterManager.parse(
        content, 
        sourceTool || this.detectSourceTool(file.name),
        format
      );
      
      if (!mcpData) {
        results.errors.push(`无法解析MCP数据: ${file.name}`);
        results.failedImports = 1;
        return results;
      }
      
      // 验证MCP数据
      const mcpValidation = MCPProcessor.validateMCPData(mcpData);
      if (!mcpValidation.isValid) {
        results.errors.push(...mcpValidation.errors);
        results.warnings.push(...mcpValidation.warnings);
        results.failedImports = 1;
        return results;
      }
      
      results.importedData.push(mcpData);
      results.successfulImports = 1;
      results.success = true;
      
    } catch (error) {
      results.errors.push(`导入文件 ${file.name} 时出错: ${error instanceof Error ? error.message : '未知错误'}`);
      results.failedImports = 1;
    }
    
    return results;
  }
  
  /**
   * 批量导入MCP数据
   */
  async importFromFiles(files: File[], sourceTool?: string): Promise<ImportResult> {
    const results: ImportResult = {
      success: false,
      importedData: [],
      errors: [],
      warnings: [],
      totalFiles: files.length,
      successfulImports: 0,
      failedImports: 0
    };
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // 更新进度
      this.updateProgress({
        currentFile: i + 1,
        totalFiles: files.length,
        currentFileName: file.name,
        status: 'processing',
        progress: Math.round(((i + 1) / files.length) * 100)
      });
      
      try {
        const fileResult = await this.importFromFile(file, sourceTool);
        
        results.importedData.push(...fileResult.importedData);
        results.errors.push(...fileResult.errors);
        results.warnings.push(...fileResult.warnings);
        results.successfulImports += fileResult.successfulImports;
        results.failedImports += fileResult.failedImports;
        
      } catch (error) {
        results.errors.push(`处理文件 ${file.name} 时出错: ${error instanceof Error ? error.message : '未知错误'}`);
        results.failedImports++;
      }
    }
    
    results.success = results.failedImports === 0 || results.successfulImports > 0;
    
    // 完成进度
    this.updateProgress({
      currentFile: files.length,
      totalFiles: files.length,
      currentFileName: '完成',
      status: 'completed',
      progress: 100
    });
    
    return results;
  }
  
  /**
   * 从文本内容导入
   */
  importFromText(content: string, fileName: string, sourceTool?: string): ImportResult {
    const results: ImportResult = {
      success: false,
      importedData: [],
      errors: [],
      warnings: [],
      totalFiles: 1,
      successfulImports: 0,
      failedImports: 0
    };
    
    try {
      // 检测文件格式
      const format = formatAdapterManager.detectFormat(fileName, content);
      if (!format) {
        results.errors.push(`无法检测文件格式: ${fileName}`);
        results.failedImports = 1;
        return results;
      }
      
      // 验证文件内容
      if (this.config.validateBeforeImport) {
        const validation = formatAdapterManager.validate(content, format);
        if (!validation.isValid) {
          results.errors.push(...validation.errors);
          results.warnings.push(...validation.warnings);
          results.failedImports = 1;
          return results;
        }
      }
      
      // 解析MCP数据
      const mcpData = formatAdapterManager.parse(
        content, 
        sourceTool || this.detectSourceTool(fileName),
        format
      );
      
      if (!mcpData) {
        results.errors.push(`无法解析MCP数据: ${fileName}`);
        results.failedImports = 1;
        return results;
      }
      
      // 验证MCP数据
      const mcpValidation = MCPProcessor.validateMCPData(mcpData);
      if (!mcpValidation.isValid) {
        results.errors.push(...mcpValidation.errors);
        results.warnings.push(...mcpValidation.warnings);
        results.failedImports = 1;
        return results;
      }
      
      results.importedData.push(mcpData);
      results.successfulImports = 1;
      results.success = true;
      
    } catch (error) {
      results.errors.push(`导入内容时出错: ${error instanceof Error ? error.message : '未知错误'}`);
      results.failedImports = 1;
    }
    
    return results;
  }
  
  /**
   * 从拖拽事件导入
   */
  async importFromDragEvent(event: DragEvent): Promise<ImportResult> {
    const files: File[] = [];
    
    if (event.dataTransfer?.items) {
      // 使用DataTransferItemList API
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        const item = event.dataTransfer.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
    } else if (event.dataTransfer?.files) {
      // 使用DataTransferFiles API
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        files.push(event.dataTransfer.files[i]);
      }
    }
    
    return this.importFromFiles(files);
  }
  
  /**
   * 从剪贴板导入
   */
  async importFromClipboard(): Promise<ImportResult> {
    try {
      // 尝试从剪贴板读取文本
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type === 'text/plain') {
            const blob = await clipboardItem.getType('text/plain');
            const text = await blob.text();
            
            if (this.isValidMCPContent(text)) {
              return this.importFromText(text, 'clipboard.txt');
            }
          }
        }
      }
      
      return {
        success: false,
        importedData: [],
        errors: ['剪贴板中没有有效的MCP数据'],
        warnings: [],
        totalFiles: 0,
        successfulImports: 0,
        failedImports: 1
      };
      
    } catch (error) {
      return {
        success: false,
        importedData: [],
        errors: [`从剪贴板读取数据时出错: ${error instanceof Error ? error.message : '未知错误'}`],
        warnings: [],
        totalFiles: 0,
        successfulImports: 0,
        failedImports: 1
      };
    }
  }
  
  /**
   * 检测源工具
   */
  private detectSourceTool(fileName: string): string {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('github') || lowerName.includes('copilot')) {
      return 'github-copilot';
    }
    if (lowerName.includes('tabnine')) {
      return 'tabnine';
    }
    if (lowerName.includes('cursor')) {
      return 'cursor';
    }
    if (lowerName.includes('codex')) {
      return 'codex';
    }
    if (lowerName.includes('kilo') || lowerName.includes('code')) {
      return 'kilocode';
    }
    
    return 'unknown';
  }
  
  /**
   * 检查内容是否为有效的MCP数据
   */
  private isValidMCPContent(content: string): boolean {
    try {
      // 检查是否为JSON格式且包含MCP相关字段
      const data = JSON.parse(content);
      return !!(data.codeSnippets || data.snippets || data.code);
    } catch {
      // 检查YAML格式
      return content.includes(':') && (content.includes('codeSnippets') || content.includes('snippets') || content.includes('code'));
    }
  }
  
  /**
   * 读取文件内容
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('无法读取文件内容'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件时发生错误'));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * 更新进度
   */
  private updateProgress(progress: ImportProgress): void {
    if (this.onProgress) {
      this.onProgress(progress);
    }
  }
  
  /**
   * 获取支持的文件格式
   */
  getSupportedFormats(): string[] {
    return formatAdapterManager.getSupportedFormats();
  }
  
  /**
   * 检查文件是否可以导入
   */
  canImportFile(file: File): boolean {
    const format = formatAdapterManager.detectFormat(file.name, '');
    return format !== null;
  }
  
  /**
   * 获取导入建议
   */
  getImportSuggestions(file: File): string[] {
    const format = formatAdapterManager.detectFormat(file.name, '');
    if (!format) {
      return ['无法识别文件格式，请确保文件包含有效的MCP数据'];
    }
    
    const sourceTool = this.detectSourceTool(file.name);
    const suggestions = [`检测到 ${sourceTool} 格式`];
    
    if (this.config.targetFormat && format !== this.config.targetFormat) {
      suggestions.push(`将转换为 ${this.config.targetFormat} 格式`);
    }
    
    return suggestions;
  }
}

// 导出单例
export const importService = new ImportService();