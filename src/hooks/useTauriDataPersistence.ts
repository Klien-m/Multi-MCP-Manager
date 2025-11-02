import { useState, useEffect } from 'react';
import { tauriStorageService, UserData, ConfigData, ToolConfig } from '../services/tauriStorageService';

export const useTauriDataPersistence = () => {
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [configs, setConfigs] = useState<ConfigData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从Tauri文件系统加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userData = await tauriStorageService.loadUserData();
        if (userData) {
          setTools(userData.tools);
          setConfigs(userData.configs);
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError('加载用户数据失败');
        // 设置默认数据
        const defaultUserData = {
          tools: [
            {
              id: "cursor",
              name: "Cursor",
              displayName: "Cursor",
              defaultPath: "~/.cursor/mcp.json",
              supportedFormats: ['json'],
              isActive: true
            },
            {
              id: "claude",
              name: "Claude Desktop",
              displayName: "Claude Desktop",
              defaultPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
              supportedFormats: ['json'],
              isActive: true
            }
          ],
          configs: [
            {
              id: "mcp-1",
              name: "filesystem-server",
              enabled: true,
              toolId: "cursor",
              config: {
                command: "npx",
                args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"],
                env: {}
              },
              lastModified: new Date().toISOString()
            }
          ],
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setTools(defaultUserData.tools);
        setConfigs(defaultUserData.configs);
        
        // 尝试保存默认数据
        try {
          await tauriStorageService.saveUserData(defaultUserData);
        } catch (saveError) {
          console.error("Failed to save default data:", saveError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 保存数据到Tauri文件系统
  const saveData = async (newTools: ToolConfig[], newConfigs: ConfigData[]) => {
    try {
      const userData: UserData = {
        tools: newTools,
        configs: newConfigs,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await tauriStorageService.saveUserData(userData);
      return true;
    } catch (err) {
      console.error("Failed to save user data:", err);
      setError('保存用户数据失败');
      return false;
    }
  };

  const addConfig = async (config: ConfigData): Promise<boolean> => {
    const newConfigs = [...configs, config];
    const success = await saveData(tools, newConfigs);
    if (success) {
      setConfigs(newConfigs);
    }
    return success;
  };

  const updateConfig = async (updatedConfig: ConfigData): Promise<boolean> => {
    const newConfigs = configs.map(config =>
      config.id === updatedConfig.id 
        ? { ...updatedConfig, lastModified: new Date().toISOString() } 
        : config
    );
    const success = await saveData(tools, newConfigs);
    if (success) {
      setConfigs(newConfigs);
    }
    return success;
  };

  const deleteConfig = async (id: string): Promise<boolean> => {
    const newConfigs = configs.filter(config => config.id !== id);
    const success = await saveData(tools, newConfigs);
    if (success) {
      setConfigs(newConfigs);
    }
    return success;
  };

  const toggleConfig = async (id: string): Promise<boolean> => {
    const newConfigs = configs.map(config =>
      config.id === id
        ? { ...config, enabled: !config.enabled, lastModified: new Date().toISOString() }
        : config
    );
    const success = await saveData(tools, newConfigs);
    if (success) {
      setConfigs(newConfigs);
    }
    return success;
  };

  const updateTools = async (newTools: ToolConfig[]): Promise<boolean> => {
    const success = await saveData(newTools, configs);
    if (success) {
      setTools(newTools);
    }
    return success;
  };

  const exportData = async (): Promise<string | null> => {
    try {
      return await tauriStorageService.exportData();
    } catch (err) {
      console.error("Failed to export data:", err);
      setError('导出数据失败');
      return null;
    }
  };

  const importData = async (dataString: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await tauriStorageService.importData(dataString);
      
      // 重新加载数据
      const userData = await tauriStorageService.loadUserData();
      if (userData) {
        setTools(userData.tools);
        setConfigs(userData.configs);
      }
      
      return true;
    } catch (err) {
      console.error("Failed to import data:", err);
      setError('导入数据失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetData = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await tauriStorageService.resetAllData();
      
      // 重新加载默认数据
      const userData = await tauriStorageService.loadUserData();
      if (userData) {
        setTools(userData.tools);
        setConfigs(userData.configs);
      }
      
      return true;
    } catch (err) {
      console.error("Failed to reset data:", err);
      setError('重置数据失败');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tools,
    configs,
    isLoading,
    error,
    setTools: updateTools,
    setConfigs,
    addConfig,
    updateConfig,
    deleteConfig,
    toggleConfig,
    exportData,
    importData,
    resetData,
    clearError: () => setError(null)
  };
};