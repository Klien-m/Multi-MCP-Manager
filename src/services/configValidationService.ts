import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import { ToolConfig, ValidationResult } from '../types';
import { CustomDirectoryService } from './customDirectoryService';
import { fileScannerService } from './fileScanner';

export class ConfigValidationService {
  /**
   * 验证单个工具配置
   */
  static async validateToolConfig(tool: ToolConfig): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 检查工具名称
    if (!tool.name || tool.name.trim() === '') {
      result.isValid = false;
      result.errors.push('工具名称不能为空');
    }

    if (!tool.displayName || tool.displayName.trim() === '') {
      result.isValid = false;
      result.errors.push('工具显示名称不能为空');
    }

    // 检查默认路径
    if (!tool.defaultPath || tool.defaultPath.trim() === '') {
      result.isValid = false;
      result.errors.push('默认路径不能为空');
    } else {
      try {
        const pathExists = await this.validatePath(tool.defaultPath);
        if (!pathExists) {
          result.warnings.push(`默认路径不存在: ${tool.defaultPath}`);
        }
      } catch (error) {
        result.errors.push(`验证默认路径时出错: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    // 检查自定义路径
    if (tool.customPath && tool.customPath.trim() !== '') {
      try {
        const pathExists = await this.validatePath(tool.customPath);
        if (!pathExists) {
          result.warnings.push(`自定义路径不存在: ${tool.customPath}`);
        }
      } catch (error) {
        result.errors.push(`验证自定义路径时出错: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    // 检查支持的格式
    if (!tool.supportedFormats || tool.supportedFormats.length === 0) {
      result.isValid = false;
      result.errors.push('至少需要支持一种文件格式');
    } else {
      const validFormats = ['json', 'yaml', 'yml', 'xml', 'txt'];
      for (const format of tool.supportedFormats) {
        if (!validFormats.includes(format.toLowerCase())) {
          result.warnings.push(`不常见的文件格式: ${format}`);
        }
      }
    }

    // 检查文件是否存在
    if (tool.defaultPath) {
      try {
        const mcpFiles = await this.findMCPFilesInPath(tool.defaultPath, tool.supportedFormats);
        if (mcpFiles.length === 0) {
          result.warnings.push(`在默认路径中未找到MCP文件: ${tool.defaultPath}`);
        }
      } catch (error) {
        result.errors.push(`扫描默认路径时出错: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    return result;
  }

  /**
   * 验证所有工具配置
   */
  static async validateAllToolConfigs(tools: ToolConfig[]): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const toolNames = new Set<string>();
    
    for (const tool of tools) {
      // 检查重复的工具名称
      if (toolNames.has(tool.name)) {
        result.isValid = false;
        result.errors.push(`重复的工具名称: ${tool.name}`);
      }
      toolNames.add(tool.name);

      // 验证单个工具配置
      const toolResult = await this.validateToolConfig(tool);
      
      if (!toolResult.isValid) {
        result.isValid = false;
      }
      
      result.errors.push(...toolResult.errors);
      result.warnings.push(...toolResult.warnings);
    }

    return result;
  }

  /**
   * 验证自定义目录配置
   */
  static async validateCustomDirectories(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const customConfig = await CustomDirectoryService.getCustomDirectories();
      
      // 检查自定义路径是否存在
      for (const [toolName, directories] of Object.entries(customConfig.customPaths)) {
        for (const directory of directories) {
          try {
            const pathExists = await this.validatePath(directory);
            if (!pathExists) {
              result.warnings.push(`自定义目录不存在: ${toolName} -> ${directory}`);
            }
          } catch (error) {
            result.errors.push(`验证自定义目录时出错 (${toolName}): ${error instanceof Error ? error.message : '未知错误'}`);
          }
        }
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push(`加载自定义目录配置时出错: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return result;
  }

  /**
   * 验证路径是否存在且可访问
   */
  private static async validatePath(path: string): Promise<boolean> {
    try {
      return await exists(path);
    } catch (error) {
      console.warn(`Path validation failed for ${path}:`, error);
      return false;
    }
  }

  /**
   * 在指定路径中查找MCP文件
   */
  private static async findMCPFilesInPath(path: string, supportedFormats: string[]): Promise<string[]> {
    try {
      // 使用文件扫描服务来查找MCP文件
      const scanService = new (fileScannerService.constructor as any)({
        directories: [path],
        supportedFormats,
        includeSubdirs: true
      });
      
      const result = await scanService.scanDirectories();
      return result.files
        .filter((file: any) => file.mcpData !== null)
        .map((file: any) => file.path);
    } catch (error) {
      console.warn(`Failed to find MCP files in path ${path}:`, error);
      return [];
    }
  }

  /**
   * 验证MCP文件格式
   */
  static async validateMCPFile(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // 检查文件是否存在
      const fileExists = await exists(filePath);
      if (!fileExists) {
        result.isValid = false;
        result.errors.push('文件不存在');
        return result;
      }

      // 读取文件内容
      const content = await readTextFile(filePath);
      if (!content || content.trim() === '') {
        result.isValid = false;
        result.errors.push('文件内容为空');
        return result;
      }

      // 检查文件大小
      // Note: In a real implementation, you would get the actual file size
      // For now, we'll use the content length as an approximation
      const fileSize = new Blob([content]).size;
      if (fileSize > 10 * 1024 * 1024) { // 10MB limit
        result.warnings.push('文件大小超过10MB，可能影响性能');
      }

      // 检查JSON格式（如果是JSON文件）
      if (filePath.toLowerCase().endsWith('.json')) {
        try {
          JSON.parse(content);
        } catch (error) {
          result.isValid = false;
          result.errors.push(`JSON格式错误: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      // 检查YAML格式（如果是YAML文件）
      if (filePath.toLowerCase().match(/\.(yaml|yml)$/)) {
        // Note: In a real implementation, you would use a YAML parser
        // For now, we'll do basic syntax validation
        if (content.includes('---') && !content.startsWith('---')) {
          result.warnings.push('YAML文件包含文档分隔符，但不在文件开头');
        }
      }

    } catch (error) {
      result.isValid = false;
      result.errors.push(`读取文件时出错: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    return result;
  }

  /**
   * 验证配置的完整性
   */
  static async validateConfigurationIntegrity(tools: ToolConfig[]): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 检查是否有至少一个活跃的工具
    const activeTools = tools.filter(tool => tool.isActive);
    if (activeTools.length === 0) {
      result.isValid = false;
      result.errors.push('至少需要启用一个工具');
    }

    // 检查是否有重复的路径配置
    const allPaths = new Set<string>();
    for (const tool of tools) {
      if (tool.defaultPath && allPaths.has(tool.defaultPath)) {
        result.warnings.push(`工具 "${tool.name}" 的默认路径与其他工具重复`);
      }
      if (tool.defaultPath) {
        allPaths.add(tool.defaultPath);
      }
      
      if (tool.customPath && allPaths.has(tool.customPath)) {
        result.warnings.push(`工具 "${tool.name}" 的自定义路径与其他工具重复`);
      }
      if (tool.customPath) {
        allPaths.add(tool.customPath);
      }
    }

    // 验证所有活跃工具的配置
    for (const tool of activeTools) {
      const toolResult = await this.validateToolConfig(tool);
      if (!toolResult.isValid) {
        result.isValid = false;
        result.errors.push(`工具 "${tool.name}" 配置无效: ${toolResult.errors.join(', ')}`);
      }
      result.warnings.push(...toolResult.warnings.map(w => `工具 "${tool.name}": ${w}`));
    }

    return result;
  }

  /**
   * 生成配置健康报告
   */
  static async generateHealthReport(tools: ToolConfig[]): Promise<string[]> {
    const report: string[] = [];
    
    try {
      // 基本配置检查
      const configResult = await this.validateAllToolConfigs(tools);
      report.push(`配置验证: ${configResult.isValid ? '通过' : '失败'} (${configResult.errors.length} 错误, ${configResult.warnings.length} 警告)`);
      
      // 自定义目录检查
      const customResult = await this.validateCustomDirectories();
      report.push(`自定义目录: ${customResult.isValid ? '通过' : '失败'} (${customResult.errors.length} 错误, ${customResult.warnings.length} 警告)`);
      
      // 完整性检查
      const integrityResult = await this.validateConfigurationIntegrity(tools);
      report.push(`配置完整性: ${integrityResult.isValid ? '通过' : '失败'} (${integrityResult.errors.length} 错误, ${integrityResult.warnings.length} 警告)`);
      
      // 活跃工具统计
      const activeTools = tools.filter(tool => tool.isActive);
      report.push(`活跃工具: ${activeTools.length}/${tools.length}`);
      
      // 路径可达性检查
      let accessiblePaths = 0;
      for (const tool of activeTools) {
        if (tool.defaultPath && await this.validatePath(tool.defaultPath)) {
          accessiblePaths++;
        }
        if (tool.customPath && await this.validatePath(tool.customPath)) {
          accessiblePaths++;
        }
      }
      report.push(`可达路径: ${accessiblePaths}`);
      
    } catch (error) {
      report.push(`生成健康报告时出错: ${error instanceof Error ? error.message : '未知错误'}`);
    }
    
    return report;
  }
}