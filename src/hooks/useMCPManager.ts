import { useState, useEffect, useCallback } from 'react';
import { useTauriStorage } from './useTauriStorage';
import { mcpConfigService } from '../services/MCPConfigService';
import { backupService } from '../services/BackupService';
import { MCPConfig, AITool } from '../types';

/**
 * MCP 管理 Hook - 为 Components 提供统一的配置管理 API
 */
export const useMCPManager = () => {
  // 使用 Tauri 存储管理配置数据
  const {
    readJsonFile,
    writeJsonFile,
    isLoading: storageLoading,
    error: storageError
  } = useTauriStorage();

  // 状态管理
  const [configs, setConfigs] = useState<MCPConfig[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [configsLoading, setConfigsLoading] = useState(true);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [configsError, setConfigsError] = useState<string | null>(null);
  const [toolsError, setToolsError] = useState<string | null>(null);

  // 从文件系统加载配置数据
  const loadConfigs = useCallback(async () => {
    try {
      setConfigsLoading(true);
      setConfigsError(null);
      
      const configsData = await readJsonFile<MCPConfig[]>('mcp-configs.json');
      if (configsData) {
        setConfigs(configsData);
      } else {
        setConfigs([]);
      }
    } catch (err) {
      console.error('Failed to load configs:', err);
      setConfigsError('加载配置数据失败');
      setConfigs([]);
    } finally {
      setConfigsLoading(false);
    }
  }, [readJsonFile]);

  // 从文件系统加载工具数据
  const loadTools = useCallback(async () => {
    try {
      setToolsLoading(true);
      setToolsError(null);
      
      const toolsData = await readJsonFile<AITool[]>('mcp-tools.json');
      if (toolsData) {
        setTools(toolsData);
      } else {
        setTools([]);
      }
    } catch (err) {
      console.error('Failed to load tools:', err);
      setToolsError('加载工具数据失败');
      setTools([]);
    } finally {
      setToolsLoading(false);
    }
  }, [readJsonFile]);

  // 保存配置数据到文件系统
  const saveConfigs = useCallback(async (configsData: MCPConfig[]) => {
    try {
      setConfigsError(null);
      const success = await writeJsonFile('mcp-configs.json', configsData);
      if (success) {
        setConfigs(configsData);
      } else {
        setConfigsError('保存配置数据失败');
      }
      return success;
    } catch (err) {
      console.error('Failed to save configs:', err);
      setConfigsError('保存配置数据失败');
      return false;
    }
  }, [writeJsonFile]);

  // 保存工具数据到文件系统
  const saveTools = useCallback(async (toolsData: AITool[]) => {
    try {
      setToolsError(null);
      const success = await writeJsonFile('mcp-tools.json', toolsData);
      if (success) {
        setTools(toolsData);
      } else {
        setToolsError('保存工具数据失败');
      }
      return success;
    } catch (err) {
      console.error('Failed to save tools:', err);
      setToolsError('保存工具数据失败');
      return false;
    }
  }, [writeJsonFile]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化数据
  useEffect(() => {
    loadConfigs();
    loadTools();
  }, [loadConfigs, loadTools]);

  // 初始化默认配置
  useEffect(() => {
    if (configs.length === 0 && tools.length === 0 && !configsLoading && !toolsLoading) {
      // 如果没有存储数据，使用默认配置
      mcpConfigService.initializeDefaultConfigs();
      const defaultConfigs = mcpConfigService.getAllConfigs();
      const defaultTools = mcpConfigService.getAllTools();
      
      saveConfigs(defaultConfigs);
      saveTools(defaultTools);
      
      // 设置默认选中的工具
      const defaultTool = defaultTools[0];
      if (defaultTool) {
        setSelectedToolId(defaultTool.id);
      }
    } else if (tools.length > 0 && !selectedToolId && !toolsLoading) {
      // 如果有工具但没有选中，默认选中第一个
      setSelectedToolId(tools[0].id);
    }
  }, [configs.length, tools.length, configsLoading, toolsLoading, selectedToolId, saveConfigs, saveTools]);

  // 获取当前工具的配置
  const currentToolConfigs = configs.filter(config => config.toolId === selectedToolId);

  // 搜索过滤
  const filteredConfigs = currentToolConfigs.filter(config =>
    config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 配置统计
  const configStats = mcpConfigService.getConfigStats();

  // 添加新配置
  const addConfig = useCallback((config: Omit<MCPConfig, 'id' | 'lastModified'>) => {
    const newConfig = mcpConfigService.addConfig(config);
    const newConfigs = [...configs, newConfig];
    setConfigs(newConfigs);
    saveConfigs(newConfigs);
    return newConfig;
  }, [configs, saveConfigs]);

  // 更新配置
  const updateConfig = useCallback((updatedConfig: MCPConfig) => {
    const success = mcpConfigService.updateConfig(updatedConfig);
    if (success) {
      const newConfigs = configs.map(config =>
        config.id === updatedConfig.id ? updatedConfig : config
      );
      setConfigs(newConfigs);
      saveConfigs(newConfigs);
    }
    return success;
  }, [configs, saveConfigs]);

  // 删除配置
  const deleteConfig = useCallback((id: string) => {
    const success = mcpConfigService.deleteConfig(id);
    if (success) {
      const newConfigs = configs.filter(config => config.id !== id);
      setConfigs(newConfigs);
      saveConfigs(newConfigs);
    }
    return success;
  }, [configs, saveConfigs]);

  // 复制配置（保持原有功能）
  const copyConfig = useCallback((sourceId: string, targetId: string) => {
    const success = mcpConfigService.copyConfig(sourceId, targetId);
    if (success) {
      // 重新获取配置数据
      const newConfigs = mcpConfigService.getAllConfigs();
      setConfigs(newConfigs);
      saveConfigs(newConfigs);
    }
    return success;
  }, [saveConfigs]);

  // 切换配置启用状态
  const toggleConfig = useCallback((id: string) => {
    const success = mcpConfigService.toggleConfig(id);
    if (success) {
      const newConfigs = configs.map(config =>
        config.id === id ? { ...config, enabled: !config.enabled } : config
      );
      setConfigs(newConfigs);
      saveConfigs(newConfigs);
    }
    return success;
  }, [configs, saveConfigs]);

  // 添加新工具
  const addTool = useCallback((tool: Omit<AITool, 'id'>) => {
    const newTool = mcpConfigService.addTool(tool);
    const newTools = [...tools, newTool];
    setTools(newTools);
    saveTools(newTools);
    return newTool;
  }, [tools, saveTools]);

  // 更新工具
  const updateTool = useCallback((updatedTool: AITool) => {
    const success = mcpConfigService.updateTool(updatedTool);
    if (success) {
      const newTools = tools.map(tool =>
        tool.id === updatedTool.id ? updatedTool : tool
      );
      setTools(newTools);
      saveTools(newTools);
    }
    return success;
  }, [tools, saveTools]);

  // 删除工具
  const deleteTool = useCallback((id: string) => {
    const success = mcpConfigService.deleteTool(id);
    if (success) {
      const newTools = tools.filter(tool => tool.id !== id);
      const newConfigs = configs.filter(config => config.toolId !== id);
      
      setTools(newTools);
      setConfigs(newConfigs);
      saveTools(newTools);
      saveConfigs(newConfigs);
      
      // 如果删除的是当前选中的工具，切换到第一个工具
      if (id === selectedToolId && newTools.length > 0) {
        setSelectedToolId(newTools[0].id);
      } else if (newTools.length === 0) {
        setSelectedToolId('');
      }
    }
    return success;
  }, [tools, configs, selectedToolId, saveTools, saveConfigs]);

  // 导出配置
  const exportConfigs = useCallback((toolId?: string) => {
    return mcpConfigService.exportData(toolId);
  }, []);

  // 导入配置
  const importConfigs = useCallback((dataString: string) => {
    const result = mcpConfigService.importData(dataString);
    if (result.success) {
      const newConfigs = mcpConfigService.getAllConfigs();
      const newTools = mcpConfigService.getAllTools();
      setConfigs(newConfigs);
      setTools(newTools);
      saveConfigs(newConfigs);
      saveTools(newTools);
    }
    return result;
  }, [saveConfigs, saveTools]);

  // 创建备份
  const createBackup = useCallback((name: string, description?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const backupId = backupService.createBackup(name, description, tools, configs);
      return { success: true, backupId };
    } catch (err) {
      setError('创建备份失败');
      return { success: false, error: err instanceof Error ? err.message : '未知错误' };
    } finally {
      setIsLoading(false);
    }
  }, [tools, configs]);

  // 恢复备份
  const restoreBackup = useCallback((backupId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = backupService.restoreBackup(backupId);
      if (result.success && result.restoredData) {
        setTools(result.restoredData.tools);
        setConfigs(result.restoredData.configs);
        saveTools(result.restoredData.tools);
        saveConfigs(result.restoredData.configs);
        return { success: true };
      } else {
        setError(result.error || '恢复备份失败');
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError('恢复备份失败');
      return { success: false, error: err instanceof Error ? err.message : '未知错误' };
    } finally {
      setIsLoading(false);
    }
  }, [saveTools, saveConfigs]);

  // 获取备份列表
  const getBackups = useCallback(() => {
    return backupService.getAllBackups();
  }, []);

  // 删除备份
  const deleteBackup = useCallback((backupId: string) => {
    return backupService.deleteBackup(backupId);
  }, []);

  // 清除所有数据
  const clearAllData = useCallback(async () => {
    setConfigs([]);
    setTools([]);
    setSelectedToolId('');
    
    // 同时清除文件系统中的数据
    await Promise.all([
      saveConfigs([]),
      saveTools([])
    ]);
  }, [saveConfigs, saveTools]);

  // 重新加载数据
  const reloadData = useCallback(async () => {
    const newConfigs = mcpConfigService.getAllConfigs();
    const newTools = mcpConfigService.getAllTools();
    setConfigs(newConfigs);
    setTools(newTools);
    await Promise.all([
      saveConfigs(newConfigs),
      saveTools(newTools)
    ]);
  }, [saveConfigs, saveTools]);

  return {
    // 数据
    configs,
    tools,
    currentToolConfigs,
    filteredConfigs,
    selectedToolId,
    
    // 状态
    isLoading: isLoading || configsLoading || toolsLoading,
    error: error || configsError || toolsError,
    
    // 搜索
    searchQuery,
    setSearchQuery,
    
    // 配置管理
    addConfig,
    updateConfig,
    deleteConfig,
    copyConfig,
    toggleConfig,
    
    // 工具管理
    setSelectedToolId,
    addTool,
    updateTool,
    deleteTool,
    
    // 文件操作
    exportConfigs,
    importConfigs,
    
    // 备份管理
    createBackup,
    restoreBackup,
    getBackups,
    deleteBackup,
    
    // 统计信息
    configStats,
    
    // 工具方法
    clearAllData,
    reloadData
  };
};