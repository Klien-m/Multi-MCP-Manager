import { MCPData, ValidationResult } from '../types';
import { MCPProcessor } from './mcpProcessor';

export interface FormatAdapter {
  supportsFormat(format: string): boolean;
  detectFormat(fileName: string, content: string): string | null;
  parse(content: string, sourceTool?: string): MCPData | null;
  convert(mcpData: MCPData, targetFormat: string): string | null;
  validate(content: string): ValidationResult;
}

export class JsonFormatAdapter implements FormatAdapter {
  supportsFormat(format: string): boolean {
    return format.toLowerCase() === 'json';
  }

  detectFormat(fileName: string, content: string): string | null {
    if (fileName.toLowerCase().endsWith('.json')) {
      return 'json';
    }
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
    } catch {
      return null;
    }
  }

  convert(mcpData: MCPData, targetFormat: string): string | null {
    if (targetFormat.toLowerCase() !== 'json') {
      return null;
    }
    return JSON.stringify(mcpData, null, 2);
  }

  validate(content: string): ValidationResult {
    try {
      const data = JSON.parse(content);
      const mcpData = MCPProcessor.parseFromTool('unknown', data);
      if (!mcpData) {
        return { isValid: false, errors: ['Invalid MCP data structure'], warnings: [] };
      }
      return MCPProcessor.validateMCPData(mcpData);
    } catch (error) {
      return { isValid: false, errors: [`Invalid JSON: ${error}`], warnings: [] };
    }
  }
}

export class FormatAdapterManager {
  private adapters: FormatAdapter[] = [
    new JsonFormatAdapter()
  ];

  supportsFormat(format: string): boolean {
    return this.adapters.some(adapter => adapter.supportsFormat(format));
  }

  getSupportedFormats(): string[] {
    const formats = new Set<string>();
    this.adapters.forEach(adapter => {
      if (adapter.supportsFormat('json')) formats.add('json');
    });
    return Array.from(formats);
  }

  detectFormat(fileName: string, content: string): string | null {
    for (const adapter of this.adapters) {
      const format = adapter.detectFormat(fileName, content);
      if (format) return format;
    }
    return null;
  }

  getAdapter(format: string): FormatAdapter | null {
    return this.adapters.find(adapter => adapter.supportsFormat(format)) || null;
  }

  parse(content: string, sourceTool?: string, format?: string): MCPData | null {
    const targetFormat = format || this.detectFormat('', content);
    if (!targetFormat) return null;

    const adapter = this.getAdapter(targetFormat);
    if (!adapter) return null;

    return adapter.parse(content, sourceTool);
  }

  convert(mcpData: MCPData, targetFormat: string): string | null {
    const adapter = this.getAdapter(targetFormat);
    if (!adapter) return null;

    return adapter.convert(mcpData, targetFormat);
  }

  validate(content: string, format?: string): ValidationResult {
    const targetFormat = format || this.detectFormat('', content);
    if (!targetFormat) {
      return { isValid: false, errors: ['Unsupported format'], warnings: [] };
    }

    const adapter = this.getAdapter(targetFormat);
    if (!adapter) {
      return { isValid: false, errors: ['No adapter available for format'], warnings: [] };
    }

    return adapter.validate(content);
  }
}

export class FormatConversionService {
  private adapterManager = new FormatAdapterManager();

  async batchConvert(mcpDataList: MCPData[], targetFormat: string): Promise<string[]> {
    return mcpDataList
      .map(mcpData => this.adapterManager.convert(mcpData, targetFormat))
      .filter((content): content is string => content !== null);
  }

  async batchParse(files: Array<{ content: string; fileName: string; sourceTool?: string }>): Promise<MCPData[]> {
    return files
      .map(file => this.adapterManager.parse(file.content, file.sourceTool))
      .filter((data): data is MCPData => data !== null);
  }

  validateFormatCompatibility(sourceFormat: string, targetFormat: string): boolean {
    return this.adapterManager.supportsFormat(sourceFormat) && 
           this.adapterManager.supportsFormat(targetFormat);
  }

  getConversionSuggestions(sourceFormat: string): string[] {
    const supported = this.adapterManager.getSupportedFormats();
    return supported.filter(format => format !== sourceFormat);
  }

  supportsFormat(format: string): boolean {
    return this.adapterManager.supportsFormat(format);
  }

  canConvertToFormat(content: string, targetFormat: string): boolean {
    const validation = this.adapterManager.validate(content);
    if (!validation.isValid) return false;

    const mcpData = this.adapterManager.parse(content);
    if (!mcpData) return false;

    return this.adapterManager.convert(mcpData, targetFormat) !== null;
  }
}

// 导出单例
export const formatAdapterManager = new FormatAdapterManager();
export const formatConversionService = new FormatConversionService();