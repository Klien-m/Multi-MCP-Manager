import { useState, useEffect, useCallback } from 'react';

/**
 * LocalStorage 存储 Hook - 提供与 Tauri 存储类似的 API
 */
export const useLocalStorage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化存储
  const initializeStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 检查 localStorage 是否可用
      if (typeof localStorage === 'undefined') {
        throw new Error('浏览器不支持 localStorage');
      }
      
      // 设置初始化标记
      localStorage.setItem('storage_initialized', 'true');
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to initialize localStorage:', err);
      setError('初始化存储失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 获取配置键名
  const getConfigKey = useCallback((filename: string): string => {
    return `config_${filename}`;
  }, []);

  // 获取数据键名
  const getDataKey = useCallback((filename: string): string => {
    return `data_${filename}`;
  }, []);

  // 读取字符串数据
  const readFile = useCallback(async (key: string): Promise<string | null> => {
    try {
      setError(null);
      
      // 检查 localStorage 是否可用
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage 不可用，跳过读取');
        return null;
      }
      
      // 确保已初始化
      if (!isInitialized) {
        await initializeStorage();
      }
      
      const value = localStorage.getItem(key);
      return value;
    } catch (err) {
      console.error(`Failed to read from localStorage ${key}:`, err);
      setError('读取数据失败');
      return null;
    }
  }, [isInitialized, initializeStorage]);

  // 写入字符串数据
  const writeFile = useCallback(async (key: string, content: string): Promise<boolean> => {
    try {
      setError(null);
      
      // 检查 localStorage 是否可用
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage 不可用，跳过写入');
        setError('localStorage 不可用');
        return false;
      }
      
      // 确保已初始化
      if (!isInitialized) {
        await initializeStorage();
      }
      
      localStorage.setItem(key, content);
      return true;
    } catch (err) {
      console.error(`Failed to write to localStorage ${key}:`, err);
      setError('写入数据失败');
      return false;
    }
  }, [isInitialized, initializeStorage]);

  // 检查键是否存在
  const fileExists = useCallback(async (key: string): Promise<boolean> => {
    try {
      // 检查 localStorage 是否可用
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage 不可用，跳过存在性检查');
        return false;
      }
      
      const value = localStorage.getItem(key);
      return value !== null;
    } catch (err) {
      console.error(`Failed to check key existence ${key}:`, err);
      return false;
    }
  }, []);

  // 初始化
  useEffect(() => {
    initializeStorage();
  }, [initializeStorage]);

  // 读取 JSON 数据
  const readJsonFile = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      const content = await readFile(key);
      if (content) {
        return JSON.parse(content);
      }
      return null;
    } catch (err) {
      console.error(`Failed to read JSON from localStorage ${key}:`, err);
      setError('读取 JSON 数据失败');
      return null;
    }
  }, [readFile]);

  // 写入 JSON 数据
  const writeJsonFile = useCallback(async <T>(key: string, data: T): Promise<boolean> => {
    try {
      const content = JSON.stringify(data, null, 2);
      return await writeFile(key, content);
    } catch (err) {
      console.error(`Failed to write JSON to localStorage ${key}:`, err);
      setError('写入 JSON 数据失败');
      return false;
    }
  }, [writeFile]);

  // 清除指定键
  const removeFile = useCallback(async (key: string): Promise<boolean> => {
    try {
      setError(null);
      
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage 不可用，跳过删除');
        return false;
      }
      
      if (!isInitialized) {
        await initializeStorage();
      }
      
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Failed to remove from localStorage ${key}:`, err);
      setError('删除数据失败');
      return false;
    }
  }, [isInitialized, initializeStorage]);

  // 清空所有数据
  const clearAll = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage 不可用，跳过清空');
        return false;
      }
      
      if (!isInitialized) {
        await initializeStorage();
      }
      
      localStorage.clear();
      return true;
    } catch (err) {
      console.error('Failed to clear localStorage:', err);
      setError('清空数据失败');
      return false;
    }
  }, [isInitialized, initializeStorage]);

  // 获取所有键名
  const getAllKeys = useCallback((): string[] => {
    try {
      if (typeof localStorage === 'undefined') {
        return [];
      }
      
      return Object.keys(localStorage);
    } catch (err) {
      console.error('Failed to get localStorage keys:', err);
      return [];
    }
  }, []);

  return {
    // 状态
    isLoading,
    isInitialized,
    error,
    
    // 路径/键名生成
    getConfigKey,
    getDataKey,
    
    // 基本操作
    readFile,
    writeFile,
    fileExists,
    removeFile,
    
    // JSON 操作
    readJsonFile,
    writeJsonFile,
    
    // 管理操作
    clearAll,
    getAllKeys,
    
    // 工具方法
    reload: initializeStorage,
    clearError: () => setError(null)
  };
};