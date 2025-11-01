import { MCPData, ValidationResult } from '../types';
import { MCPProcessor } from './mcpProcessor';

/**
 * 文件格式适配器接口
 */
export interface FormatAdapter {
  /**
   * 检测是否支持该格式
   */
  supportsFormat(format: string): boolean;
  
  /**
   * 检测文件格式
   */
  detectFormat(fileName: string, content: string): string | null;
  
  /**
   * 解析文件内容为MCP数据
   */
  parse(content: string, sourceTool?: string): MCPData | null;
  
  /**
   * 将MCP数据转换为指定格式
   */
  convert(mcpData: MCPData, targetFormat: string): string | null;
  
  /**
   * 验证文件内容
   */
  validate(content: string): ValidationResult;
}

/**
 * JSON格式适配器
 */
export class JsonFormatAdapter implements FormatAdapter {
  readonly SUPPORTED_FORMATS = ['json'];
  
  supportsFormat(format: string): boolean {
    return this.SUPPORTED_FORMATS.includes(format.toLowerCase());
  }
  
  detectFormat(fileName: string, content: string): string | null {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (this.SUPPORTED_FORMATS.includes(extension || '')) {
      return extension || null;
    }
    
    // 尝试解析JSON
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      return null;
    }
  }
  
  parse(content: string, sourceTool?: string): MCPData | null {
    try {
      const data = JSON.parse(content);
      return MCPProcessor.parseFromTool(sourceTool || 'unknown', data);
    } catch (error) {
      console.error('JSON解析失败:', error);
      return null;
    }
  }
  
  convert(mcpData: MCPData, targetFormat: string): string | null {
    if (!this.supportsFormat(targetFormat)) {
      return null;
    }
    
    const convertedData = MCPProcessor.convertToFormat(targetFormat, mcpData);
    try {
      return JSON.stringify(convertedData, null, 2);
    } catch (error) {
      console.error('JSON转换失败:', error);
      return null;
    }
  }
  
  validate(content: string): ValidationResult {
    try {
      JSON.parse(content);
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['JSON格式无效'],
        warnings: []
      };
    }
  }
}

/**
 * YAML格式适配器
 */
export class YamlFormatAdapter implements FormatAdapter {
  private readonly SUPPORTED_FORMATS = ['yaml', 'yml'];
  
  supportsFormat(format: string): boolean {
    return this.SUPPORTED_FORMATS.includes(format.toLowerCase());
  }
  
  detectFormat(fileName: string, content: string): string | null {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (this.SUPPORTED_FORMATS.includes(extension || '')) {
      return extension || null;
    }
    
    // 检查YAML格式特征
    if (content.trim().startsWith('---') || content.includes(': ')) {
      return 'yaml';
    }
    
    return null;
  }
  
  parse(content: string, sourceTool?: string): MCPData | null {
    // Note: In a real implementation, you would use a YAML parser like js-yaml
    // For now, we'll try to convert YAML-like content to JSON first
    try {
      // Simple YAML to JSON conversion for basic cases
      const jsonData = this.yamlToJson(content);
      const data = JSON.parse(jsonData);
      return MCPProcessor.parseFromTool(sourceTool || 'unknown', data);
    } catch (error) {
      console.error('YAML解析失败:', error);
      return null;
    }
  }
  
  convert(mcpData: MCPData, targetFormat: string): string | null {
    if (!this.supportsFormat(targetFormat)) {
      return null;
    }
    
    const convertedData = MCPProcessor.convertToFormat(targetFormat, mcpData);
    try {
      // Convert to YAML format
      return this.jsonToYaml(convertedData);
    } catch (error) {
      console.error('YAML转换失败:', error);
      return null;
    }
  }
  
  validate(content: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic YAML validation
    if (!content.trim()) {
      errors.push('YAML内容不能为空');
    }
    
    // Check for basic YAML structure
    if (!content.includes(':') && !content.trim().startsWith('---')) {
      warnings.push('YAML文件可能缺少键值对结构');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  private yamlToJson(yaml: string): string {
    // Simple YAML to JSON conversion
    // In production, use a proper YAML parser
    const lines = yaml.split('\n');
    const result: any = {};
    let currentObj = result;
    let stack: any[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const indent = line.length - trimmed.length;
      const [key, ...valueParts] = trimmed.split(':');
      
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        const newCurrent = {};
        
        // Adjust stack based on indentation
        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }
        
        if (stack.length === 0) {
          currentObj[key] = value || newCurrent;
        } else {
          const parent = stack[stack.length - 1].obj;
          parent[key] = value || newCurrent;
        }
        
        if (!value) {
          stack.push({ obj: newCurrent, indent });
        }
      }
    }
    
    return JSON.stringify(result, null, 2);
  }
  
  private jsonToYaml(obj: any, indent = 0): string {
    // Simple JSON to YAML conversion
    // In production, use a proper YAML serializer
    let result = '';
    const spaces = '  '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += `${spaces}${key}:\n${this.jsonToYaml(value, indent + 1)}`;
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return result;
  }
}

/**
 * 格式适配器管理器
 */
export class FormatAdapterManager {
  private adapters: FormatAdapter[] = [
    new JsonFormatAdapter(),
    new YamlFormatAdapter()
  ];
  
  /**
   * 获取支持的格式列表
   */
  getSupportedFormats(): string[] {
    const formats = new Set<string>();
    this.adapters.forEach(adapter => {
      if (adapter instanceof JsonFormatAdapter) {
        adapter.SUPPORTED_FORMATS.forEach(format => formats.add(format));
      } else if (adapter instanceof YamlFormatAdapter) {
        adapter.SUPPORTED_FORMATS.forEach(format => formats.add(format));
      }
    });
    return Array.from(formats);
  }
  
  /**
   * 检测文件格式
   */
  detectFormat(fileName: string, content: string): string | null {
    for (const adapter of this.adapters) {
      const format = adapter.detectFormat(fileName, content);
      if (format) {
        return format;
      }
    }
    return null;
  }
  
  /**
   * 获取适配器
   */
  getAdapter(format: string): FormatAdapter | null {
    return this.adapters.find(adapter => adapter.supportsFormat(format)) || null;
  }
  
  /**
   * 解析文件内容
   */
  parse(content: string, sourceTool?: string, format?: string): MCPData | null {
    const targetFormat = format || this.detectFormat('temp', content);
    
    if (!targetFormat) {
      console.error('无法检测文件格式');
      return null;
    }
    
    const adapter = this.getAdapter(targetFormat);
    if (!adapter) {
      console.error(`不支持的格式: ${targetFormat}`);
      return null;
    }
    
    return adapter.parse(content, sourceTool);
  }
  
  /**
   * 转换MCP数据
   */
  convert(mcpData: MCPData, targetFormat: string): string | null {
    const adapter = this.getAdapter(targetFormat);
    if (!adapter) {
      console.error(`不支持的格式: ${targetFormat}`);
      return null;
    }
    
    return adapter.convert(mcpData, targetFormat);
  }
  
  /**
   * 验证文件内容
   */
  validate(content: string, format?: string): ValidationResult {
    const targetFormat = format || this.detectFormat('temp', content);
    
    if (!targetFormat) {
      return {
        isValid: false,
        errors: ['无法检测文件格式'],
        warnings: []
      };
    }
    
    const adapter = this.getAdapter(targetFormat);
    if (!adapter) {
      return {
        isValid: false,
        errors: [`不支持的格式: ${targetFormat}`],
        warnings: []
      };
    }
    
    return adapter.validate(content);
  }
}

/**
 * 格式转换服务
 */
export class FormatConversionService {
  private adapterManager = new FormatAdapterManager();
  
  /**
   * 批量转换MCP数据
   */
  async batchConvert(mcpDataList: MCPData[], targetFormat: string): Promise<string[]> {
    const results: string[] = [];
    
    for (const mcpData of mcpDataList) {
      try {
        const converted = this.adapterManager.convert(mcpData, targetFormat);
        if (converted) {
          results.push(converted);
        }
      } catch (error) {
        console.error(`转换MCP数据 ${mcpData.id} 时出错:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * 批量解析文件
   */
  async batchParse(files: Array<{ content: string; fileName: string; sourceTool?: string }>): Promise<MCPData[]> {
    const results: MCPData[] = [];
    
    for (const file of files) {
      try {
        const mcpData = this.adapterManager.parse(file.content, file.sourceTool);
        if (mcpData) {
          results.push(mcpData);
        }
      } catch (error) {
        console.error(`解析文件 ${file.fileName} 时出错:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * 验证文件格式兼容性
   */
  validateFormatCompatibility(sourceFormat: string, targetFormat: string): boolean {
    const sourceAdapter = this.adapterManager.getAdapter(sourceFormat);
    const targetAdapter = this.adapterManager.getAdapter(targetFormat);
    
    return !!(sourceAdapter && targetAdapter);
  }
  
  /**
   * 获取格式转换建议
   */
  getConversionSuggestions(sourceFormat: string): string[] {
    const supportedFormats = this.adapterManager.getSupportedFormats();
    return supportedFormats.filter(format => format !== sourceFormat);
  }
  
  /**
   * 检查文件是否可以转换为目标格式
   */
  canConvertToFormat(content: string, targetFormat: string): boolean {
    const sourceFormat = this.adapterManager.detectFormat('temp', content);
    if (!sourceFormat) {
      return false;
    }
    
    const validation = this.adapterManager.validate(content, sourceFormat);
    if (!validation.isValid) {
      return false;
    }
    
    return this.adapterManager.getAdapter(targetFormat) !== null;
  }
}

// 导出单例
export const formatAdapterManager = new FormatAdapterManager();
export const formatConversionService = new FormatConversionService();