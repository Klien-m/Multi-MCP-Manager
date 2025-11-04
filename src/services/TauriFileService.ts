import { invoke } from '@tauri-apps/api/core';

/**
 * Tauri 文件系统服务
 * 提供对本地文件系统操作的封装
 */
export class TauriFileService {
  /**
   * 获取用户主目录
   */
  async getUserHomeDir(): Promise<string> {
    try {
      const homeDir = await invoke<string>('get_user_home_dir');
      return homeDir;
    } catch (error) {
      console.error('Failed to get user home directory:', error);
      throw new Error('无法获取用户主目录');
    }
  }

  /**
   * 检查文件是否存在
   */
  async checkFileExists(path: string): Promise<boolean> {
    try {
      const exists = await invoke<boolean>('file_exists', { path });
      return exists;
    } catch (error) {
      console.error('Failed to check file exists:', error);
      return false;
    }
  }

  /**
   * 读取文件内容
   */
  async readFile(path: string): Promise<string | undefined> {
    try {
      const content = await invoke<string>('read_file', { path });
      return content;
    } catch (error) {
      console.error('Failed to read file:', error);
      return undefined;
    }
  }

  /**
   * 解析路径（处理 ~ 符号）
   */
  async resolvePath(path: string): Promise<string> {
    if (path.startsWith('~/')) {
      try {
        const homeDir = await this.getUserHomeDir();
        return `${homeDir}/${path.substring(2)}`;
      } catch {
        // 如果无法获取HOME目录，返回原始路径
        return path;
      }
    }
    return path;
  }

}

// 导出单例
export const tauriFileService = new TauriFileService();