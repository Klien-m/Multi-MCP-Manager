import {useState, useEffect, useCallback} from 'react';
import {writeTextFile, readTextFile, exists, BaseDirectory, create, mkdir} from '@tauri-apps/plugin-fs';
import {appDataDir} from '@tauri-apps/api/path';

/**
 * Tauri 存储 Hook - 仅处理 Tauri 文件系统操作
 */
export const useTauriStorage = () => {
  const [appDataDirPath, setAppDataDirPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化存储目录
  const initializeDirectories = useCallback(async () => {
    console.log('useTauriStorage: initializeDirectories called');
    try {
      setIsLoading(true);
      setError(null);

      const appDataPath = await appDataDir();
      setAppDataDirPath(appDataPath);
      console.log('useTauriStorage: appDataPath set to:', appDataPath);

      // 确保目录存在并创建必要的配置文件（异步处理，不阻塞主流程）
      try {
        // 使用 mkdir 创建目录，而不是 create
        if (!(await exists(appDataPath))) {
          await mkdir(appDataPath, { recursive: true });
        }
        
        // 检查并创建 mcp-configs.json
        const mcpConfigsPath = getConfigPath("mcp-configs.json")
        if (!(await exists(mcpConfigsPath, {baseDir: BaseDirectory.AppData}))) {
          await create(mcpConfigsPath, {baseDir: BaseDirectory.AppData});
        }

        // 检查并创建 mcp-tools.json
        const toolsConfigPath = getConfigPath("mcp-tools.json");
        if (!(await exists(toolsConfigPath, {baseDir: BaseDirectory.AppData}))) {
          await create(toolsConfigPath, {baseDir: BaseDirectory.AppData});
        }
      } catch (dirError) {
        console.warn('useTauriStorage: Failed to create directories or config files:', dirError);
      }
    } catch (err) {
      console.error('useTauriStorage: Failed to initialize directories:', err);
      setError('初始化存储目录失败');
    } finally {
      setIsLoading(false);
      console.log('useTauriStorage: initializeDirectories completed');
    }
  }, []);

  // 读取文件
  const readFile = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      setError(null);

      if (await exists(filePath, {baseDir: BaseDirectory.AppData})) {
        return await readTextFile(filePath, {baseDir: BaseDirectory.AppData});
      }
      return null;
    } catch (err) {
      console.error(`Failed to read file ${filePath}:`, err);
      setError('读取文件失败');
      return null;
    }
  }, [appDataDirPath]);

  // 写入文件
  const writeFile = useCallback(async (filePath: string, content: string): Promise<boolean> => {
    console.log('useTauriStorage: writeFile called with:', { filePath, contentLength: content.length });
    try {
      setError(null);

      await writeTextFile(filePath, content, {baseDir: BaseDirectory.AppData});
      console.log('useTauriStorage: writeFile success for:', filePath);
      return true;
    } catch (err) {
      console.error(`useTauriStorage: Failed to write file ${filePath}:`, err);
      setError('写入文件失败');
      return false;
    }
  }, [appDataDirPath]);

  // 检查文件是否存在
  const fileExists = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      return await exists(filePath, {baseDir: BaseDirectory.AppData});
    } catch (err) {
      console.error(`Failed to check file existence ${filePath}:`, err);
      return false;
    }
  }, [appDataDirPath]);

  // 初始化
  useEffect(() => {
    initializeDirectories();
  }, [initializeDirectories]);

  // 读取 JSON 文件
  const readJsonFile = useCallback(async <T>(filePath: string): Promise<T | null> => {
    try {
      const content = await readFile(filePath);
      if (content) {
        return JSON.parse(content);
      }
      return null;
    } catch (err) {
      console.error(`Failed to read JSON file ${filePath}:`, err);
      setError('读取 JSON 文件失败');
      return null;
    }
  }, [readFile]);

  // 写入 JSON 文件
  const writeJsonFile = useCallback(async <T>(filePath: string, data: T): Promise<boolean> => {
    try {
      const content = JSON.stringify(data, null, 2);
      return await writeFile(filePath, content);
    } catch (err) {
      console.error(`Failed to write JSON file ${filePath}:`, err);
      setError('写入 JSON 文件失败');
      return false;
    }
  }, [writeFile]);

  // 获取配置键名
  const getConfigPath = useCallback((filename: string): string => {
    return `config-${filename}`;
  }, []);

  return {
    configDir: appDataDirPath,
    dataDir: appDataDirPath,
    isLoading,
    error,
    getConfigPath,
    readFile,
    writeFile,
    fileExists,
    readJsonFile,
    writeJsonFile,
    reload: initializeDirectories,
    clearError: () => setError(null)
  };
};