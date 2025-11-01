import { 
  MCPData, 
  CodeSnippet, 
  MCPMetadata, 
  ValidationResult,
  ToolConfig 
} from '../types';

/**
 * MCP数据模型和验证逻辑
 */
export class MCPProcessor {
  private static readonly SUPPORTED_FORMATS = ['json', 'yaml', 'yml'];
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly REQUIRED_METADATA_FIELDS = ['name', 'version'];

  /**
   * 验证MCP数据的完整性
   */
  static validateMCPData(mcpData: MCPData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基本字段验证
    if (!mcpData.id || typeof mcpData.id !== 'string') {
      errors.push('MCP数据必须包含有效的ID');
    }

    if (!mcpData.sourceTool || typeof mcpData.sourceTool !== 'string') {
      errors.push('MCP数据必须包含有效的源工具信息');
    }

    // 验证代码片段
    if (!Array.isArray(mcpData.codeSnippets)) {
      errors.push('代码片段必须是数组格式');
    } else if (mcpData.codeSnippets.length === 0) {
      warnings.push('MCP数据中没有包含任何代码片段');
    } else {
      mcpData.codeSnippets.forEach((snippet, index) => {
        const snippetErrors = this.validateCodeSnippet(snippet, index);
        errors.push(...snippetErrors);
      });
    }

    // 验证元数据
    const metadataErrors = this.validateMetadata(mcpData.metadata);
    errors.push(...metadataErrors);

    // 验证时间戳
    if (!this.isValidDateString(mcpData.createdAt)) {
      errors.push('创建时间格式无效');
    }

    if (!this.isValidDateString(mcpData.updatedAt)) {
      errors.push('更新时间格式无效');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 验证单个代码片段
   */
  private static validateCodeSnippet(snippet: CodeSnippet, index: number): string[] {
    const errors: string[] = [];

    if (!snippet.id || typeof snippet.id !== 'string') {
      errors.push(`代码片段[${index}]: 必须包含有效的ID`);
    }

    if (!snippet.content || typeof snippet.content !== 'string') {
      errors.push(`代码片段[${index}]: 必须包含有效的内容`);
    }

    if (!snippet.language || typeof snippet.language !== 'string') {
      errors.push(`代码片段[${index}]: 必须包含有效的编程语言`);
    }

    if (!Array.isArray(snippet.tags)) {
      errors.push(`代码片段[${index}]: 标签必须是数组格式`);
    }

    return errors;
  }

  /**
   * 验证元数据
   */
  private static validateMetadata(metadata: MCPMetadata): string[] {
    const errors: string[] = [];

    this.REQUIRED_METADATA_FIELDS.forEach(field => {
      if (!metadata[field as keyof MCPMetadata]) {
        errors.push(`元数据中缺少必需字段: ${field}`);
      }
    });

    if (metadata.tags && !Array.isArray(metadata.tags)) {
      errors.push('标签必须是数组格式');
    }

    if (metadata.dependencies && !Array.isArray(metadata.dependencies)) {
      errors.push('依赖项必须是数组格式');
    }

    return errors;
  }

  /**
   * 检查日期字符串是否有效
   */
  private static isValidDateString(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * 从不同AI工具格式解析MCP数据
   */
  static parseFromTool(tool: string, data: any): MCPData | null {
    try {
      switch (tool.toLowerCase()) {
        case 'github-copilot':
          return this.parseGitHubCopilotFormat(data);
        case 'tabnine':
          return this.parseTabnineFormat(data);
        case 'cursor':
          return this.parseCursorFormat(data);
        case 'codex':
          return this.parseCodexFormat(data);
        case 'kilocode':
          return this.parseKiloCodeFormat(data);
        default:
          console.warn(`不支持的工具格式: ${tool}`);
          return null;
      }
    } catch (error) {
      console.error(`解析${tool}格式时出错:`, error);
      return null;
    }
  }

  /**
   * 将MCP数据转换为目标格式
   */
  static convertToFormat(targetFormat: string, mcpData: MCPData): any {
    switch (targetFormat.toLowerCase()) {
      case 'github-copilot':
        return this.convertToGitHubCopilotFormat(mcpData);
      case 'tabnine':
        return this.convertToTabnineFormat(mcpData);
      case 'cursor':
        return this.convertToCursorFormat(mcpData);
      case 'codex':
        return this.convertToCodexFormat(mcpData);
      case 'kilocode':
        return this.convertToKiloCodeFormat(mcpData);
      default:
        throw new Error(`不支持的目标格式: ${targetFormat}`);
    }
  }

  /**
   * 检测文件格式
   */
  static detectFileFormat(fileName: string, content: string): string | null {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (this.SUPPORTED_FORMATS.includes(extension || '')) {
      return extension || null;
    }

    // 尝试通过内容检测格式
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // Not JSON
    }

    return null;
  }

  /**
   * 验证文件大小
   */
  static validateFileSize(fileSize: number): boolean {
    return fileSize <= this.MAX_FILE_SIZE;
  }

  /**
   * GitHub Copilot格式解析
   */
  private static parseGitHubCopilotFormat(data: any): MCPData {
    return {
      id: data.id || this.generateId(),
      sourceTool: 'github-copilot',
      codeSnippets: data.codeSnippets || [],
      metadata: {
        name: data.metadata?.name || 'Unknown',
        description: data.metadata?.description,
        version: data.metadata?.version || '1.0.0',
        author: data.metadata?.author,
        tags: data.metadata?.tags || [],
        dependencies: data.metadata?.dependencies,
        configuration: data.metadata?.configuration
      },
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Tabnine格式解析
   */
  private static parseTabnineFormat(data: any): MCPData {
    return {
      id: data.id || this.generateId(),
      sourceTool: 'tabnine',
      codeSnippets: (data.snippets || []).map((snippet: any) => ({
        id: snippet.id || this.generateId(),
        content: snippet.code || '',
        language: snippet.language || 'javascript',
        description: snippet.description,
        tags: snippet.tags || [],
        context: snippet.context
      })),
      metadata: {
        name: data.name || 'Unknown',
        description: data.description,
        version: data.version || '1.0.0',
        author: data.author,
        tags: data.tags || [],
        dependencies: data.dependencies,
        configuration: data.config
      },
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString()
    };
  }

  /**
   * Cursor格式解析
   */
  private static parseCursorFormat(data: any): MCPData {
    return {
      id: data.id || this.generateId(),
      sourceTool: 'cursor',
      codeSnippets: (data.code || []).map((snippet: any) => ({
        id: snippet.id || this.generateId(),
        content: snippet.content || '',
        language: snippet.language || 'javascript',
        description: snippet.description,
        tags: snippet.tags || [],
        context: snippet.context
      })),
      metadata: {
        name: data.name || 'Unknown',
        description: data.description,
        version: data.version || '1.0.0',
        author: data.author,
        tags: data.tags || [],
        dependencies: data.dependencies,
        configuration: data.settings
      },
      createdAt: data.created || new Date().toISOString(),
      updatedAt: data.lastModified || new Date().toISOString()
    };
  }

  /**
   * Codex格式解析
   */
  private static parseCodexFormat(data: any): MCPData {
    return {
      id: data.id || this.generateId(),
      sourceTool: 'codex',
      codeSnippets: (data.code_snippets || []).map((snippet: any) => ({
        id: snippet.id || this.generateId(),
        content: snippet.code || '',
        language: snippet.language || 'javascript',
        description: snippet.description,
        tags: snippet.tags || [],
        context: snippet.metadata
      })),
      metadata: {
        name: data.metadata?.name || 'Unknown',
        description: data.metadata?.description,
        version: data.metadata?.version || '1.0.0',
        author: data.metadata?.author,
        tags: data.metadata?.tags || [],
        dependencies: data.metadata?.dependencies,
        configuration: data.metadata?.config
      },
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString()
    };
  }

  /**
   * KiloCode格式解析
   */
  private static parseKiloCodeFormat(data: any): MCPData {
    return {
      id: data.id || this.generateId(),
      sourceTool: 'kilocode',
      codeSnippets: (data.snippets || []).map((snippet: any) => ({
        id: snippet.id || this.generateId(),
        content: snippet.content || '',
        language: snippet.lang || 'javascript',
        description: snippet.desc,
        tags: snippet.tags || [],
        context: snippet.context
      })),
      metadata: {
        name: data.name || 'Unknown',
        description: data.desc,
        version: data.version || '1.0.0',
        author: data.author,
        tags: data.tags || [],
        dependencies: data.deps,
        configuration: data.config
      },
      createdAt: data.created || new Date().toISOString(),
      updatedAt: data.modified || new Date().toISOString()
    };
  }

  /**
   * 转换为GitHub Copilot格式
   */
  private static convertToGitHubCopilotFormat(mcpData: MCPData): any {
    return {
      id: mcpData.id,
      codeSnippets: mcpData.codeSnippets,
      metadata: mcpData.metadata,
      createdAt: mcpData.createdAt,
      updatedAt: mcpData.updatedAt
    };
  }

  /**
   * 转换为Tabnine格式
   */
  private static convertToTabnineFormat(mcpData: MCPData): any {
    return {
      id: mcpData.id,
      snippets: mcpData.codeSnippets.map(snippet => ({
        id: snippet.id,
        code: snippet.content,
        language: snippet.language,
        description: snippet.description,
        tags: snippet.tags,
        context: snippet.context
      })),
      name: mcpData.metadata.name,
      description: mcpData.metadata.description,
      version: mcpData.metadata.version,
      author: mcpData.metadata.author,
      tags: mcpData.metadata.tags,
      dependencies: mcpData.metadata.dependencies,
      config: mcpData.metadata.configuration,
      created_at: mcpData.createdAt,
      updated_at: mcpData.updatedAt
    };
  }

  /**
   * 转换为Cursor格式
   */
  private static convertToCursorFormat(mcpData: MCPData): any {
    return {
      id: mcpData.id,
      code: mcpData.codeSnippets.map(snippet => ({
        id: snippet.id,
        content: snippet.content,
        language: snippet.language,
        description: snippet.description,
        tags: snippet.tags,
        context: snippet.context
      })),
      name: mcpData.metadata.name,
      description: mcpData.metadata.description,
      version: mcpData.metadata.version,
      author: mcpData.metadata.author,
      tags: mcpData.metadata.tags,
      dependencies: mcpData.metadata.dependencies,
      settings: mcpData.metadata.configuration,
      created: mcpData.createdAt,
      lastModified: mcpData.updatedAt
    };
  }

  /**
   * 转换为Codex格式
   */
  private static convertToCodexFormat(mcpData: MCPData): any {
    return {
      id: mcpData.id,
      code_snippets: mcpData.codeSnippets.map(snippet => ({
        id: snippet.id,
        code: snippet.content,
        language: snippet.language,
        description: snippet.description,
        tags: snippet.tags,
        metadata: snippet.context
      })),
      metadata: mcpData.metadata,
      created_at: mcpData.createdAt,
      updated_at: mcpData.updatedAt
    };
  }

  /**
   * 转换为KiloCode格式
   */
  private static convertToKiloCodeFormat(mcpData: MCPData): any {
    return {
      id: mcpData.id,
      snippets: mcpData.codeSnippets.map(snippet => ({
        id: snippet.id,
        content: snippet.content,
        lang: snippet.language,
        desc: snippet.description,
        tags: snippet.tags,
        context: snippet.context
      })),
      name: mcpData.metadata.name,
      desc: mcpData.metadata.description,
      version: mcpData.metadata.version,
      author: mcpData.metadata.author,
      tags: mcpData.metadata.tags,
      deps: mcpData.metadata.dependencies,
      config: mcpData.metadata.configuration,
      created: mcpData.createdAt,
      modified: mcpData.updatedAt
    };
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建新的MCP数据
   */
  static createMCPData(sourceTool: string, metadata: Partial<MCPMetadata> = {}): MCPData {
    return {
      id: this.generateId(),
      sourceTool,
      codeSnippets: [],
      metadata: {
        name: metadata.name || 'New MCP',
        description: metadata.description,
        version: metadata.version || '1.0.0',
        author: metadata.author,
        tags: metadata.tags || [],
        dependencies: metadata.dependencies,
        configuration: metadata.configuration
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 更新MCP数据
   */
  static updateMCPData(mcpData: MCPData, updates: Partial<MCPData>): MCPData {
    return {
      ...mcpData,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 添加代码片段
   */
  static addCodeSnippet(mcpData: MCPData, snippet: Omit<CodeSnippet, 'id'>): MCPData {
    const newSnippet: CodeSnippet = {
      ...snippet,
      id: this.generateId()
    };

    return {
      ...mcpData,
      codeSnippets: [...mcpData.codeSnippets, newSnippet],
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 删除代码片段
   */
  static removeCodeSnippet(mcpData: MCPData, snippetId: string): MCPData {
    return {
      ...mcpData,
      codeSnippets: mcpData.codeSnippets.filter(snippet => snippet.id !== snippetId),
      updatedAt: new Date().toISOString()
    };
  }
}