import { toast } from 'sonner';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  source: string;
  data?: any;
  error?: Error;
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableToast: boolean;
  maxLogEntries: number;
}

/**
 * 日志服务
 * 提供结构化的日志记录和错误处理
 */
export class LoggerService {
  private logs: LogEntry[] = [];
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableToast: true,
    maxLogEntries: 1000
  };

  /**
   * 设置日志配置
   */
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 记录调试信息
   */
  debug(source: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, source, message, data);
  }

  /**
   * 记录信息
   */
  info(source: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, source, message, data);
  }

  /**
   * 记录警告
   */
  warn(source: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, source, message, data);
  }

  /**
   * 记录错误
   */
  error(source: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, source, message, data, error);
  }

  /**
   * 通用日志记录方法
   */
  private log(
    level: LogLevel,
    source: string,
    message: string,
    data?: any,
    error?: Error
  ): void {
    // 检查日志级别过滤
    if (level < this.config.level) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      data,
      error
    };

    // 添加到日志列表
    this.logs.unshift(logEntry);

    // 限制日志数量
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(0, this.config.maxLogEntries);
    }

    // 控制台输出
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Toast 通知
    if (this.config.enableToast && level >= LogLevel.WARN) {
      this.showToast(logEntry);
    }
  }

  /**
   * 输出到控制台
   */
  private logToConsole(logEntry: LogEntry): void {
    const { level, source, message, data, error } = logEntry;
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] ${source}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} [DEBUG] ${message}`, data);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} [INFO] ${message}`, data);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} [WARN] ${message}`, data, error);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} [ERROR] ${message}`, data, error);
        break;
    }
  }

  /**
   * 显示 Toast 通知
   */
  private showToast(logEntry: LogEntry): void {
    const { level, message, error } = logEntry;
    
    switch (level) {
      case LogLevel.WARN:
        toast.warning(message, {
          duration: 5000
        });
        break;
      case LogLevel.ERROR:
        const errorMessage = error ? `${message}: ${error.message}` : message;
        toast.error(errorMessage, {
          duration: 8000
        });
        break;
    }
  }

  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 获取指定级别的日志
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * 获取指定来源的日志
   */
  getLogsBySource(source: string): LogEntry[] {
    return this.logs.filter(log => log.source === source);
  }

  /**
   * 清除所有日志
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 导出日志为 JSON
   */
  exportLogs(): string {
    return JSON.stringify({
      exportTime: new Date().toISOString(),
      logs: this.logs,
      config: this.config
    }, null, 2);
  }

  /**
   * 导入日志
   */
  importLogs(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (imported.logs && Array.isArray(imported.logs)) {
        this.logs = imported.logs;
        if (imported.config) {
          this.config = imported.config;
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * 创建带源的子记录器
   */
  createLogger(source: string): SubLogger {
    return new SubLogger(source, this);
  }
}

/**
 * 子记录器类
 * 提供便捷的日志记录方法
 */
export class SubLogger {
  constructor(
    private source: string,
    private logger: LoggerService
  ) {}

  debug(message: string, data?: any): void {
    this.logger.debug(this.source, message, data);
  }

  info(message: string, data?: any): void {
    this.logger.info(this.source, message, data);
  }

  warn(message: string, data?: any): void {
    this.logger.warn(this.source, message, data);
  }

  error(message: string, error?: Error, data?: any): void {
    this.logger.error(this.source, message, error, data);
  }
}

// 导出单例
export const loggerService = new LoggerService();

// 导出便捷函数
export const createLogger = (source: string) => loggerService.createLogger(source);