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
      const exists = await invoke<boolean>('check_file_exists', { path });
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
      const content = await invoke<string>('read_file_content', { path });
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

  /**
   * 扫描本地AI工具
   */
  async scanLocalTools(): Promise<any[]> {
    try {
      const results = await invoke<any[]>('scan_local_tools');
      return results;
    } catch (error) {
      console.error('Failed to scan local tools:', error);
      throw new Error('扫描本地AI工具失败');
    }
  }

  /**
   * 读取目录内容
   */
  async readDir(path: string): Promise<string[]> {
    try {
      // TODO: 需要添加Tauri命令来读取目录
      return [];
    } catch (error) {
      console.error('Failed to read directory:', error);
      return [];
    }
  }

  /**
   * 写入文件
   */
  async writeFile(path: string, content: string): Promise<void> {
    try {
      // TODO: 需要添加Tauri命令来写入文件
      console.log('Write file not yet implemented');
    } catch (error) {
      console.error('Failed to write file:', error);
      throw new Error('写入文件失败');
    }
  }
}

// 导出单例
export const tauriFileService = new TauriFileService();