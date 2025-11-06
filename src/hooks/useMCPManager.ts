import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useTauriStorage } from './useTauriStorage';
import { mcpConfigService } from '../services/MCPConfigService';
import { backupService } from '../services/BackupService';
import { MCPConfig, AITool } from '../types';
import {useLocalStorage} from "@/hooks/useLocalStorage.ts";

/**
 * MCP 管理 Hook - 为 Components 提供统一的配置管理 API
 */
export const useMCPManager = () => {
  // 使用 Tauri 存储管理配置数据
  const {
    readJsonFile,
    writeJsonFile,
    getConfigPath,
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
      
      const configsData = await readJsonFile<MCPConfig[]>(getConfigPath('mcp-configs.json'));
      if (configsData) {
        setConfigs(configsData);
      } else {
        setConfigs([]);
      }
    } catch (err) {
      console.error('Failed to load configs:', err);
      const errorMessage = '加载配置数据失败';
      toast.error(errorMessage);
      setConfigsError(errorMessage);
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
      
      const toolsData = await readJsonFile<AITool[]>(getConfigPath('mcp-tools.json'));
      if (toolsData) {
        setTools(toolsData);
      } else {
        setTools([]);
      }
    } catch (err) {
      console.error('Failed to load tools:', err);
      const errorMessage = '加载工具数据失败';
      toast.error(errorMessage);
      setToolsError(errorMessage);
      setTools([]);
    } finally {
      setToolsLoading(false);
    }
  }, [readJsonFile]);

  // 保存配置数据到文件系统
  const saveConfigs = useCallback(async (configsData: MCPConfig[]) => {
    console.log('useMCPManager: saveConfigs called with:', { configsCount: configsData.length });
    try {
      setConfigsError(null);
      const newConfigsData = [...configsData];
      const success = await writeJsonFile(getConfigPath('mcp-configs.json'), newConfigsData);
      if (success) {
        console.log('useMCPManager: saveConfigs success, updating state');
        setConfigs(newConfigsData);
        // 同步更新MCP配置服务
        // mcpConfigService.reloadFromData(configsData, tools);
        console.log('useMCPManager: saveConfigs completed successfully');
      } else {
        const errorMessage = '保存配置数据失败';
        toast.error(errorMessage);
        setConfigsError(errorMessage);
      }
      return success;
    } catch (err) {
      console.error('useMCPManager: Failed to save configs:', err);
      const errorMessage = '保存配置数据失败';
      toast.error(errorMessage);
      setConfigsError(errorMessage);
      return false;
    }
  }, [writeJsonFile]);

  // 保存工具数据到文件系统
  const saveTools = useCallback(async (toolsData: AITool[]) => {
    console.log('useMCPManager: saveTools called with:', { toolsCount: toolsData.length });
    try {
      setToolsError(null);
      // 确保传入的是新数组引用，避免 React 认为没有变化
      const newToolsData = [...toolsData];
      const success = await writeJsonFile(getConfigPath('mcp-tools.json'), newToolsData);      if (success) {
        console.log('useMCPManager: saveTools success, updating state');
        setTools(newToolsData);
        // 同步更新MCP配置服务
        // mcpConfigService.reloadFromData(configs, toolsData);
        console.log('useMCPManager: saveTools completed successfully');
      } else {
        const errorMessage = '保存工具数据失败';
        toast.error(errorMessage);
        setToolsError(errorMessage);
      }
      return success;
    } catch (err) {
      console.error('useMCPManager: Failed to save tools:', err);
      const errorMessage = '保存工具数据失败';
      toast.error(errorMessage);
      setToolsError(errorMessage);
      return false;
    }
  }, [writeJsonFile]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 初始化数据
  useEffect(() => {
    loadConfigs();
    loadTools();
  }, [loadConfigs, loadTools]);

  // 初始化默认配置
  useEffect(() => {
    if (configs.length === 0 && tools.length === 0 && !configsLoading && !toolsLoading && !storageLoading) {
      // 如果没有存储数据且存储系统已初始化，使用默认配置
      const initializeDefaultData = async () => {
    try {
          // 等待存储系统完全初始化
          if (!storageLoading) {
      mcpConfigService.initializeDefaultConfigs();
      const defaultConfigs = mcpConfigService.getAllConfigs();
      const defaultTools = mcpConfigService.getAllTools();
      
      // 延迟保存，确保目录完全准备好
      setTimeout(async () => {
        await saveConfigs(defaultConfigs);
        await saveTools(defaultTools);
        
        // 设置默认选中的工具
        const defaultTool = defaultTools[0];
        if (defaultTool) {
          setSelectedToolId(defaultTool.id);
        }
            }, 500);
          }
    } catch (err) {
      console.error('Failed to initialize default data:', err);
    }
      };

      initializeDefaultData();
    } else if (tools.length > 0 && !selectedToolId && !toolsLoading) {
      // 如果有工具但没有选中，默认选中第一个
      setSelectedToolId(tools[0].id);
    }
  }, [configs.length, tools.length, configsLoading, toolsLoading, storageLoading, selectedToolId, saveConfigs, saveTools]);

  // 获取当前工具的配置
  const currentToolConfigs = configs.filter(config => config.toolId === selectedToolId);

  // 搜索过滤
  const filteredConfigs = currentToolConfigs.filter(config =>
    config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 配置统计
  const configStats = mcpConfigService.getConfigStats();
  
  // 导入配置时的错误处理
  const handleImportError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  // 添加新配置
  const addConfig = useCallback((config: Omit<MCPConfig, 'id' | 'lastModified'>) => {
    const newConfig = mcpConfigService.addConfig(config);
    const newConfigs = [...configs, newConfig];
    saveConfigs(newConfigs).then(success => {
      if (success) {
        toast.success('配置创建成功');
      }
    });
    return newConfig;
  }, [configs, saveConfigs]);

  // 更新配置
  const updateConfig = useCallback((updatedConfig: MCPConfig) => {
    const success = mcpConfigService.updateConfig(updatedConfig);
    if (success) {
      const newConfigs = configs.map(config =>
        config.id === updatedConfig.id ? updatedConfig : config
      );
      saveConfigs(newConfigs).then(saveSuccess => {
        if (saveSuccess) {
          toast.success('配置更新成功');
        }
      });
    }
    return success;
  }, [configs, saveConfigs]);

  // 删除配置
  const deleteConfig = useCallback((id: string) => {
    console.log('useMCPManager: deleteConfig called with id:', id);
    console.log('useMCPManager: current configs before delete:', configs.map(c => ({ id: c.id, name: c.name })));
    
    const success = mcpConfigService.deleteConfig(id);
    console.log('useMCPManager: mcpConfigService.deleteConfig result:', success);
    
    if (success) {
      const newConfigs = configs.filter(config => config.id !== id);
      console.log('useMCPManager: filtered configs after delete:', newConfigs.map(c => ({ id: c.id, name: c.name })));
      console.log('useMCPManager: configs count changed from', configs.length, 'to', newConfigs.length);
      
      saveConfigs(newConfigs).then(saveSuccess => {
        console.log('useMCPManager: saveConfigs result after delete:', saveSuccess);
        if (saveSuccess) {
          toast.success('配置删除成功');
        } else {
          toast.error('删除配置后保存失败');
        }
      }).catch(err => {
        console.error('useMCPManager: saveConfigs error after delete:', err);
        toast.error('删除配置后保存失败');
      });
    } else {
      console.error('useMCPManager: deleteConfig failed in service');
      toast.error('删除配置失败');
    }
    return success;
  }, [configs, saveConfigs]);

  // 复制配置（保持原有功能）
  const copyConfig = useCallback((sourceId: string, targetId: string) => {
    const success = mcpConfigService.copyConfig(sourceId, targetId);
    if (success) {
      // 重新获取配置数据
      const newConfigs = mcpConfigService.getAllConfigs();
      saveConfigs(newConfigs);
    }
    return success;
  }, [saveConfigs]);

  // 切换配置启用状态
  const toggleConfig = useCallback((id: string) => {
    const success = mcpConfigService.toggleConfig(id);
    if (success) {
      const updatedConfigs = mcpConfigService.getAllConfigs();
      saveConfigs(updatedConfigs);
    }
    return success;
  }, [saveConfigs]);

  // 添加新工具
  const addTool = useCallback((tool: Omit<AITool, 'id'>) => {
    const newTool = mcpConfigService.addTool(tool);
    const newTools = mcpConfigService.getAllTools();
    saveTools(newTools);
    return newTool;
  }, [saveTools]);

  // 更新工具
  const updateTool = useCallback((updatedTool: AITool) => {
    const success = mcpConfigService.updateTool(updatedTool);
    if (success) {
      const newTools = tools.map(tool =>
        tool.id === updatedTool.id ? updatedTool : tool
      );
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

  // 保存工具列表（用于 ToolManager）
  const saveToolsList = useCallback((updatedTools: AITool[]) => {
    try {
      // 验证工具数据
      const emptyNames = updatedTools.filter(tool => !tool.name?.trim());
      if (emptyNames.length > 0) {
        toast.error('所有工具必须有名称');
        return false;
      }

      const names = updatedTools.map(tool => tool.name.trim());
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicates.length > 0) {
        toast.error('工具名称不能重复');
        return false;
      }

      // 更新 MCP 配置服务中的工具数据
      // 先删除所有旧工具，再添加新工具
      const currentTools = mcpConfigService.getAllTools();
      currentTools.forEach(tool => {
        mcpConfigService.deleteTool(tool.id);
      });
      
      updatedTools.forEach(tool => {
        mcpConfigService.addTool(tool);
      });
      
      // 保存到文件系统
      const savePromise = saveTools(updatedTools);
      savePromise.then(success => {
        if (success) {
          toast.success('工具配置保存成功');
        } else {
          toast.error('保存工具配置失败');
        }
      }).catch(() => {
        toast.error('保存工具配置失败');
      });
      
      return savePromise;
    } catch (err) {
      console.error('Failed to save tools:', err);
      toast.error('保存工具配置失败');
      return false;
    }
  }, [saveTools]);

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
      saveConfigs(newConfigs);
      saveTools(newTools);
      toast.success('配置导入成功');
    } else {
      toast.error(result.message || '导入失败，请检查文件格式');
    }
    return result;
  }, [saveConfigs, saveTools]);

  // 创建备份
  const createBackup = useCallback((name: string, description?: string) => {
    setIsLoading(true);
    
    try {
      const backupId = backupService.createBackup(name, description, tools, configs);
      toast.success('备份创建成功');
      return { success: true, backupId };
    } catch (err) {
      const errorMessage = '创建备份失败';
      toast.error(errorMessage);
      return { success: false, error: err instanceof Error ? err.message : '未知错误' };
    } finally {
      setIsLoading(false);
    }
  }, [tools, configs]);

  // 恢复备份
  const restoreBackup = useCallback((backupId: string) => {
    setIsLoading(true);
    
    try {
      const result = backupService.restoreBackup(backupId);
      if (result.success && result.restoredData) {
        saveTools(result.restoredData.tools);
        saveConfigs(result.restoredData.configs);
        toast.success('备份恢复成功');
        return { success: true };
      } else {
        const errorMessage = result.error || '恢复备份失败';
        toast.error(errorMessage);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = '恢复备份失败';
      toast.error(errorMessage);
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
    console.log('useMCPManager: reloadData called');
    const newConfigs = mcpConfigService.getAllConfigs();
    const newTools = mcpConfigService.getAllTools();
    console.log('useMCPManager: service data:', { newConfigs, newTools });
    console.log('useMCPManager: current state before update:', { configs, tools });
    
    setConfigs([...newConfigs]);
    setTools([...newTools]);
    
    console.log('useMCPManager: state update completed');
    
    // 直接写入文件，避免触发状态更新循环
    const [configsSuccess, toolsSuccess] = await Promise.all([
      writeJsonFile(getConfigPath('mcp-configs.json'), newConfigs),
      writeJsonFile(getConfigPath('mcp-tools.json'), newTools)
    ]);
    
    if (configsSuccess && toolsSuccess) {
      console.log('useMCPManager: reloadData completed successfully');
    } else {
      console.error('useMCPManager: reloadData failed to save files');
    }
  }, [writeJsonFile, getConfigPath]);

  return {
    // 数据
    configs,
    tools,
    currentToolConfigs,
    filteredConfigs,
    selectedToolId,
    
    // 状态
    isLoading: isLoading || configsLoading || toolsLoading,
    
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
    saveToolsList,
    
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
    handleImportError,
    
    // 工具方法
    clearAllData,
    reloadData
  };
};