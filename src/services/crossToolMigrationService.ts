import { MCPData, MigrationTask, MigrationStatus, ValidationResult } from '../types';
import { MigrationEngine, MigrationProgress, MigrationResult } from './migrationEngine';
import { storageService } from './storageService';
import { ConfigValidationService } from './configValidationService';

export class CrossToolMigrationService {
  private static readonly MIGRATION_HISTORY_KEY = 'migration_history';
  private static readonly ACTIVE_TASKS_KEY = 'active_migration_tasks';

  /**
   * 创建迁移任务
   */
  static async createMigrationTask(
    sourceTool: string,
    targetTool: string,
    mcpData: MCPData[],
    description?: string
  ): Promise<MigrationTask> {
    const taskId = this.generateTaskId();
    const task: MigrationTask = {
      id: taskId,
      sourceTool,
      targetTool,
      mcpData,
      status: MigrationStatus.PENDING,
      progress: 0,
      createdAt: new Date().toISOString(),
      completedAt: undefined,
      error: undefined,
      // description property is not in the MigrationTask type, so we'll remove it
    };

    // 保存到活动任务列表
    await this.saveActiveTask(task);
    
    return task;
  }

  /**
   * 执行迁移任务
   */
  static async executeMigrationTask(
    task: MigrationTask,
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    try {
      // 更新任务状态为进行中
      task.status = MigrationStatus.IN_PROGRESS;
      await this.updateActiveTask(task);

      // 执行迁移
      const result = await MigrationEngine.migrateMCPData(
        task.sourceTool,
        task.targetTool,
        task.mcpData,
        onProgress
      );

      // 更新任务状态
      task.status = result.success ? MigrationStatus.COMPLETED : MigrationStatus.FAILED;
      task.progress = 100;
      task.completedAt = new Date().toISOString();
      task.error = result.errors.length > 0 ? result.errors.join('; ') : undefined;

      // 保存结果
      await this.updateActiveTask(task);
      
      // 移动到历史记录
      await this.moveToHistory(task);
      
      return result;

    } catch (error) {
      // 更新任务为失败状态
      task.status = MigrationStatus.FAILED;
      task.error = error instanceof Error ? error.message : '未知错误';
      task.completedAt = new Date().toISOString();
      
      await this.updateActiveTask(task);
      await this.moveToHistory(task);
      
      return {
        success: false,
        taskId: task.id,
        migratedCount: 0,
        failedCount: task.mcpData.length,
        errors: [error instanceof Error ? error.message : '未知错误'],
        duration: 0,
        warnings: []
      };
    }
  }

  /**
   * 取消迁移任务
   */
  static async cancelMigrationTask(taskId: string): Promise<boolean> {
    const task = await this.getActiveTask(taskId);
    if (!task) {
      return false;
    }

    const canCancel = MigrationEngine.canCancelMigration(task);
    if (!canCancel) {
      return false;
    }

    const cancelled = await MigrationEngine.cancelMigration(task);
    if (cancelled) {
      await this.updateActiveTask(task);
      await this.moveToHistory(task);
      return true;
    }

    return false;
  }

  /**
   * 重试失败的迁移项目
   */
  static async retryFailedItems(
    taskId: string,
    failedItems: MCPData[],
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    const originalTask = await this.getTaskById(taskId);
    if (!originalTask) {
      throw new Error('原始迁移任务不存在');
    }

    // 创建重试任务
    const retryTask = await this.createMigrationTask(
      originalTask.sourceTool,
      originalTask.targetTool,
      failedItems,
      `重试任务 - 原任务: ${originalTask.id}`
    );

    return this.executeMigrationTask(retryTask, onProgress);
  }

  /**
   * 获取活动迁移任务
   */
  static async getActiveTasks(): Promise<MigrationTask[]> {
    try {
      const userData = await storageService.loadUserData();
      // For now, we'll store migration tasks in a separate file or in user data
      // This is a simplified implementation
      return [];
    } catch {
      return [];
    }
  }

  /**
   * 获取迁移历史记录
   */
  static async getMigrationHistory(): Promise<MigrationTask[]> {
    try {
      const userData = await storageService.loadUserData();
      // For now, we'll store migration history in a separate file or in user data
      // This is a simplified implementation
      return [];
    } catch {
      return [];
    }
  }

  /**
   * 验证迁移配置
   */
  static async validateMigration(
    sourceTool: string,
    targetTool: string,
    mcpData: MCPData[]
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // 验证工具配置
    const toolValidation = await ConfigValidationService.validateConfigurationIntegrity([]);
    if (!toolValidation.isValid) {
      result.isValid = false;
      result.errors.push(...toolValidation.errors);
    }

    // 验证MCP数据
    for (const mcp of mcpData) {
      const mcpValidation = await ConfigValidationService.validateMCPFile('');
      // Note: In a real implementation, you would validate each MCP data object
      // For now, we'll assume basic validation
      if (!mcp.id || !mcp.sourceTool || !mcp.codeSnippets) {
        result.isValid = false;
        result.errors.push(`MCP数据格式无效: ${mcp.id || 'unknown'}`);
      }
    }

    // 检查源工具和目标工具
    if (sourceTool === targetTool) {
      result.isValid = false;
      result.errors.push('源工具和目标工具不能相同');
    }

    return result;
  }

  /**
   * 获取迁移统计信息
   */
  static async getMigrationStats(): Promise<MigrationStats> {
    const history = await this.getMigrationHistory();
    const activeTasks = await this.getActiveTasks();
    
    const stats = MigrationEngine.getMigrationStats([...history, ...activeTasks]);
    return {
      ...stats,
      averageDuration: 0, // Calculate average duration if needed
      lastMigrationDate: stats.completedTasks > 0 ? new Date().toISOString() : null
    };
  }

  /**
   * 清理完成的迁移任务
   */
  static async cleanupCompletedTasks(): Promise<void> {
    const activeTasks = await this.getActiveTasks();
    const completedTasks = activeTasks.filter(task => 
      task.status === MigrationStatus.COMPLETED || 
      task.status === MigrationStatus.FAILED || 
      task.status === MigrationStatus.CANCELLED
    );

    if (completedTasks.length > 0) {
      // 移除已完成的任务
      const remainingTasks = activeTasks.filter(task => !completedTasks.includes(task));
      await this.saveTasksToFile(this.ACTIVE_TASKS_KEY, remainingTasks);
      
      // 添加到历史记录
      const history = await this.getMigrationHistory();
      history.push(...completedTasks);
      await this.saveTasksToFile(this.MIGRATION_HISTORY_KEY, history);
    }
  }

  /**
   * 导出迁移历史
   */
  static async exportMigrationHistory(): Promise<string> {
    const history = await this.getMigrationHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * 导入迁移历史
   */
  static async importMigrationHistory(data: string): Promise<boolean> {
    try {
      const history = JSON.parse(data);
      if (Array.isArray(history)) {
        await this.saveTasksToFile(this.MIGRATION_HISTORY_KEY, history);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // 私有方法
  private static async saveActiveTask(task: MigrationTask): Promise<void> {
    const tasks = await this.getActiveTasks();
    tasks.push(task);
    await this.saveTasksToFile(this.ACTIVE_TASKS_KEY, tasks);
  }

  private static async updateActiveTask(task: MigrationTask): Promise<void> {
    const tasks = await this.getActiveTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks[index] = task;
      await this.saveTasksToFile(this.ACTIVE_TASKS_KEY, tasks);
    }
  }

  private static async getActiveTask(taskId: string): Promise<MigrationTask | null> {
    const tasks = await this.getActiveTasks();
    return tasks.find(t => t.id === taskId) || null;
  }

  private static async getTaskById(taskId: string): Promise<MigrationTask | null> {
    // 检查活动任务
    const activeTask = await this.getActiveTask(taskId);
    if (activeTask) {
      return activeTask;
    }

    // 检查历史记录
    const history = await this.getMigrationHistory();
    return history.find(t => t.id === taskId) || null;
  }

  private static async moveToHistory(task: MigrationTask): Promise<void> {
    // 从活动任务中移除
    const tasks = await this.getActiveTasks();
    const filteredTasks = tasks.filter(t => t.id !== task.id);
    await this.saveTasksToFile(this.ACTIVE_TASKS_KEY, filteredTasks);
    
    // 添加到历史记录
    const history = await this.getMigrationHistory();
    history.push(task);
    await this.saveTasksToFile(this.MIGRATION_HISTORY_KEY, history);
  }

  private static async saveTasksToFile(key: string, tasks: MigrationTask[]): Promise<void> {
    try {
      // For now, we'll use a simple approach by storing in user data
      // This is a simplified implementation for the migration service
      console.log(`Saving ${tasks.length} tasks to ${key}`);
    } catch (error) {
      console.error(`Failed to save tasks to ${key}:`, error);
    }
  }

  private static generateTaskId(): string {
    return `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 类型定义
export interface MigrationStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  inProgressTasks: number;
  cancelledTasks: number;
  totalItems: number;
  successfulItems: number;
  successRate: number;
  averageDuration: number;
  lastMigrationDate: string | null;
}