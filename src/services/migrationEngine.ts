import { MCPData, MigrationTask, MigrationStatus, ValidationResult } from '../types';
import { formatAdapterManager } from './formatAdapter';
import { MCPProcessor } from './mcpProcessor';
import { ConfigValidationService } from './configValidationService';

export class MigrationEngine {
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly BATCH_SIZE = 10;

  /**
   * 执行MCP数据迁移
   */
  static async migrateMCPData(
    sourceTool: string,
    targetTool: string,
    mcpData: MCPData[],
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    const taskId = this.generateTaskId();
    const startTime = new Date();

    try {
      // 创建迁移任务
      const task: MigrationTask = {
        id: taskId,
        sourceTool,
        targetTool,
        mcpData,
        status: MigrationStatus.IN_PROGRESS,
        progress: 0,
        createdAt: startTime.toISOString(),
        error: undefined
      };

      // 验证迁移配置
      const validation = await this.validateMigrationConfig(sourceTool, targetTool);
      if (!validation.isValid) {
        throw new Error(`迁移配置验证失败: ${validation.errors.join(', ')}`);
      }

      // 执行迁移
      const result = await this.executeMigration(task, onProgress);

      return {
        success: true,
        taskId,
        migratedCount: result.migratedCount,
        failedCount: result.failedCount,
        errors: result.errors,
        duration: Date.now() - startTime.getTime(),
        warnings: result.warnings
      };

    } catch (error) {
      return {
        success: false,
        taskId,
        migratedCount: 0,
        failedCount: mcpData.length,
        errors: [error instanceof Error ? error.message : '未知错误'],
        duration: Date.now() - startTime.getTime(),
        warnings: []
      };
    }
  }

  /**
   * 验证迁移配置
   */
  private static async validateMigrationConfig(
    sourceTool: string,
    targetTool: string
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 检查源工具和目标工具是否相同
    if (sourceTool === targetTool) {
      result.isValid = false;
      result.errors.push('源工具和目标工具不能相同');
    }

    // 检查工具是否支持
    const supportedTools = ['cursor', 'github-copilot', 'tabnine', 'codex', 'kilocode'];
    if (!supportedTools.includes(sourceTool)) {
      result.isValid = false;
      result.errors.push(`不支持的源工具: ${sourceTool}`);
    }

    if (!supportedTools.includes(targetTool)) {
      result.isValid = false;
      result.errors.push(`不支持的目标工具: ${targetTool}`);
    }

    return result;
  }

  /**
   * 执行实际的迁移操作
   */
  private static async executeMigration(
    task: MigrationTask,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationExecutionResult> {
    const results: MigrationExecutionResult = {
      migratedCount: 0,
      failedCount: 0,
      errors: [],
      warnings: []
    };

    const totalItems = task.mcpData.length;
    const batches = this.createBatches(task.mcpData, this.BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      for (let itemIndex = 0; itemIndex < batch.length; itemIndex++) {
        const mcpItem = batch[itemIndex];
        const currentIndex = batchIndex * this.BATCH_SIZE + itemIndex;
        
        try {
          // 转换MCP数据格式
          const convertedData = await this.convertMCPFormat(mcpItem, task.sourceTool, task.targetTool);
          
          if (convertedData) {
            // 验证转换后的数据
            const validation = MCPProcessor.validateMCPData(convertedData);
            if (validation.isValid) {
              results.migratedCount++;
            } else {
              results.failedCount++;
              results.errors.push(`数据验证失败 (${mcpItem.id}): ${validation.errors.join(', ')}`);
            }
          } else {
            results.failedCount++;
            results.errors.push(`格式转换失败 (${mcpItem.id})`);
          }

        } catch (error) {
          results.failedCount++;
          results.errors.push(`迁移失败 (${mcpItem.id}): ${error instanceof Error ? error.message : '未知错误'}`);
        }

        // 更新进度
        const progress = Math.round(((currentIndex + 1) / totalItems) * 100);
        task.progress = progress;
        
        if (onProgress) {
          onProgress({
            taskId: task.id,
            current: currentIndex + 1,
            total: totalItems,
            progress,
            status: task.status,
            errors: [...results.errors],
            warnings: [...results.warnings]
          });
        }
      }

      // 批次间延迟，避免过于频繁的操作
      if (batchIndex < batches.length - 1) {
        await this.delay(100);
      }
    }

    return results;
  }

  /**
   * 转换MCP数据格式
   */
  private static async convertMCPFormat(
    mcpData: MCPData,
    sourceTool: string,
    targetTool: string
  ): Promise<MCPData | null> {
    try {
      // 获取源工具的格式
      const sourceFormat = this.getToolFormat(sourceTool);
      const targetFormat = this.getToolFormat(targetTool);

      if (!sourceFormat || !targetFormat) {
        throw new Error('无法确定工具格式');
      }

      // 将MCP数据转换为源格式的字符串
      const sourceContent = formatAdapterManager.convert(mcpData, sourceFormat);
      if (!sourceContent) {
        throw new Error('无法转换为源格式');
      }

      // 解析源格式内容为MCP数据对象
      const parsedData = formatAdapterManager.parse(sourceContent, sourceTool);
      if (!parsedData) {
        throw new Error('无法解析源格式内容');
      }

      // 更新源工具信息
      parsedData.sourceTool = targetTool;

      // 转换为目标格式
      const targetContent = formatAdapterManager.convert(parsedData, targetFormat);
      if (!targetContent) {
        throw new Error('无法转换为目标格式');
      }

      // 解析目标格式内容
      const targetData = formatAdapterManager.parse(targetContent, targetTool);
      if (!targetData) {
        throw new Error('无法解析目标格式内容');
      }

      return targetData;

    } catch (error) {
      console.error(`格式转换失败:`, error);
      return null;
    }
  }

  /**
   * 获取工具的默认格式
   */
  private static getToolFormat(tool: string): string | null {
    const formatMap: { [tool: string]: string } = {
      'cursor': 'json',
      'github-copilot': 'json',
      'tabnine': 'json',
      'codex': 'json',
      'kilocode': 'json'
    };

    return formatMap[tool] || null;
  }

  /**
   * 创建批次
   */
  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * 延迟函数
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成任务ID
   */
  private static generateTaskId(): string {
    return `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查迁移是否可以取消
   */
  static canCancelMigration(task: MigrationTask): boolean {
    return task.status === MigrationStatus.PENDING || task.status === MigrationStatus.IN_PROGRESS;
  }

  /**
   * 取消迁移任务
   */
  static async cancelMigration(task: MigrationTask): Promise<boolean> {
    if (!this.canCancelMigration(task)) {
      return false;
    }

    task.status = MigrationStatus.CANCELLED;
    task.error = '迁移已取消';
    return true;
  }

  /**
   * 重试失败的迁移项目
   */
  static async retryFailedItems(
    task: MigrationTask,
    failedItems: MCPData[],
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    const retryTask = { ...task, mcpData: failedItems };
    return this.migrateMCPData(
      retryTask.sourceTool,
      retryTask.targetTool,
      retryTask.mcpData,
      onProgress
    );
  }

  /**
   * 获取迁移统计信息
   */
  static getMigrationStats(tasks: MigrationTask[]): MigrationStats {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === MigrationStatus.COMPLETED).length;
    const failedTasks = tasks.filter(t => t.status === MigrationStatus.FAILED).length;
    const inProgressTasks = tasks.filter(t => t.status === MigrationStatus.IN_PROGRESS).length;
    const cancelledTasks = tasks.filter(t => t.status === MigrationStatus.CANCELLED).length;

    const totalItems = tasks.reduce((sum, task) => sum + task.mcpData.length, 0);
    const successfulItems = tasks
      .filter(t => t.status === MigrationStatus.COMPLETED)
      .reduce((sum, task) => sum + task.mcpData.length, 0);

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      inProgressTasks,
      cancelledTasks,
      totalItems,
      successfulItems,
      successRate: totalTasks > 0 ? (successfulItems / totalItems) * 100 : 0
    };
  }
}

// 类型定义
export interface MigrationProgress {
  taskId: string;
  current: number;
  total: number;
  progress: number;
  status: MigrationStatus;
  errors: string[];
  warnings: string[];
}

export interface MigrationResult {
  success: boolean;
  taskId: string;
  migratedCount: number;
  failedCount: number;
  errors: string[];
  duration: number;
  warnings: string[];
}

export interface MigrationExecutionResult {
  migratedCount: number;
  failedCount: number;
  errors: string[];
  warnings: string[];
}

export interface MigrationStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  inProgressTasks: number;
  cancelledTasks: number;
  totalItems: number;
  successfulItems: number;
  successRate: number;
}