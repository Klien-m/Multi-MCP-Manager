import { useState, useEffect, useCallback } from 'react';
import { writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { appConfigDir, appDataDir } from '@tauri-apps/api/path';

/**
 * Tauri 存储 Hook - 仅处理 Tauri 文件系统操作
 */
export const useTauriStorage = () => {
  const [configDir, setConfigDir] = useState<string | null>(null);
  const [dataDir, setDataDir] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化存储目录
  const initializeDirectories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const configPath = await appConfigDir();
      const dataPath = await appDataDir();
      
      setConfigDir(configPath);
      setDataDir(dataPath);
      
      // 确保目录存在
      try {
        await writeTextFile(`${configPath}/.init`, '');
        await writeTextFile(`${dataPath}/.init`, '');
      } catch (dirError) {
        console.warn('Failed to create directories:', dirError);
      }
    } catch (err) {
      console.error('Failed to initialize directories:', err);
      setError('初始化存储目录失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 获取配置文件路径
  const getConfigPath = useCallback(async (filename: string): Promise<string> => {
    if (!configDir) {
      await initializeDirectories();
    }
    return `${configDir}/${filename}`;
  }, [configDir, initializeDirectories]);

  // 获取数据文件路径
  const getDataPath = useCallback(async (filename: string): Promise<string> => {
    if (!dataDir) {
      await initializeDirectories();
    }
    return `${dataDir}/${filename}`;
  }, [dataDir, initializeDirectories]);

  // 读取文件
  const readFile = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      setError(null);
      if (await exists(filePath)) {
        return await readTextFile(filePath);
      }
      return null;
    } catch (err) {
      console.error(`Failed to read file ${filePath}:`, err);
      setError('读取文件失败');
      return null;
    }
  }, []);

  // 写入文件
  const writeFile = useCallback(async (filePath: string, content: string): Promise<boolean> => {
    try {
      setError(null);
      await writeTextFile(filePath, content);
      return true;
    } catch (err) {
      console.error(`Failed to write file ${filePath}:`, err);
      setError('写入文件失败');
      return false;
    }
  }, []);

  // 检查文件是否存在
  const fileExists = useCallback(async (filePath: string): Promise<boolean> => {
    try {
      return await exists(filePath);
    } catch (err) {
      console.error(`Failed to check file existence ${filePath}:`, err);
      return false;
    }
  }, []);

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

  return {
    configDir,
    dataDir,
    isLoading,
    error,
    getConfigPath,
    getDataPath,
    readFile,
    writeFile,
    fileExists,
    readJsonFile,
    writeJsonFile,
    reload: initializeDirectories,
    clearError: () => setError(null)
  };
};