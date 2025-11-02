import { useState } from 'react';
import { useAppContext } from '../providers/AppProvider';
import { useTauriDataPersistence } from './useTauriDataPersistence';
import { MCPConfig } from '../components/ConfigCard';
import { ToolConfig } from '../types';
import { AITool } from './useDataPersistence';

export const useAppLogic = () => {
  const {
    tools,
    selectedToolId,
    configs,
    setSelectedToolId,
    setTools,
    setConfigs,
    updateConfig,
    deleteConfig,
    toggleConfig
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingConfig, setEditingConfig] = useState<MCPConfig | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewConfig, setIsNewConfig] = useState(false);
  const [copyingConfig, setCopyingConfig] = useState<MCPConfig | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isToolManagerOpen, setIsToolManagerOpen] = useState(false);

  // 当前工具的配置
  const currentToolConfigs = configs.filter(c => c.toolId === selectedToolId);
  
  const filteredConfigs = currentToolConfigs.filter(config =>
    config.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 计算每个工具的配置统计
  const configCounts = tools.reduce((acc, tool) => {
    const toolConfigs = configs.filter(c => c.toolId === tool.id);
    acc[tool.id] = {
      total: toolConfigs.length,
      enabled: toolConfigs.filter(c => c.enabled).length
    };
    return acc;
  }, {} as Record<string, { total: number; enabled: number }>);

  const handleToggle = (id: string) => {
    toggleConfig(id);
  };

  const handleEdit = (config: MCPConfig) => {
    setEditingConfig(config);
    setIsNewConfig(false);
    setIsEditorOpen(true);
  };

  const handleSave = (config: MCPConfig) => {
    if (config.id.startsWith('mcp-')) {
      updateConfig(config);
    } else {
      setConfigs([...configs, config]);
    }
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    const config = configs.find(c => c.id === id);
    if (config && confirm(`确定要删除 "${config?.name}" 吗？`)) {
      deleteConfig(id);
    }
  };

  const handleCopy = (config: MCPConfig) => {
    setCopyingConfig(config);
    setIsCopyDialogOpen(true);
  };

  const handleCopyConfirm = (sourceId: string, targetId: string) => {
    const source = configs.find(c => c.id === sourceId);
    if (!source) return;

    const updatedConfigs = configs.map((config: MCPConfig) =>
      config.id === targetId
        ? {
            ...config,
            config: { ...source.config },
            lastModified: new Date().toISOString()
          }
        : config
    );
    setConfigs(updatedConfigs);
    setIsCopyDialogOpen(false);
  };

  const handleNewConfig = () => {
    setEditingConfig(null);
    setIsNewConfig(true);
    setIsEditorOpen(true);
  };

  const handleExport = () => {
    const exportData = {
      tools,
      configs
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcp-all-configs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrentTool = () => {
    const currentTool = tools.find(t => t.id === selectedToolId);
    const exportData = {
      tool: currentTool,
      configs: currentToolConfigs
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcp-${currentTool?.name}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        
        // 判断导入的是全量数据还是单工具数据
        if (imported.tools && imported.configs) {
          // 全量导入
          setTools(imported.tools);
          setConfigs(imported.configs);
          setSelectedToolId(imported.tools[0]?.id || "");
        } else if (imported.tool && imported.configs) {
          // 单工具导入
          const toolExists = tools.find(t => t.id === imported.tool.id);
          if (!toolExists) {
            setTools([...tools, imported.tool]);
          }
          
          // 更新配置中的toolId以匹配工具ID，然后替换该工具的配置
          const updatedConfigs = imported.configs.map((config: any) => ({
            ...config,
            toolId: imported.tool.id
          }));
          
          const filteredConfigs = configs.filter((c: MCPConfig) => c.toolId !== imported.tool.id);
          setConfigs([...filteredConfigs, ...updatedConfigs]);
          setSelectedToolId(imported.tool.id);
        } else if (Array.isArray(imported)) {
          // 兼容旧格式（只有配置数组）
          const updatedConfigs = imported.map((c: any) => ({
            ...c,
            toolId: c.toolId || selectedToolId
          }));
          setConfigs(updatedConfigs);
        } else {
          alert("无效的配置文件格式");
        }
      } catch (e) {
        alert("导入失败，请检查文件格式");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveTools = (updatedTools: ToolConfig[]) => {
    setTools(updatedTools);
    
    // 如果当前选中的工具被删除，切换到第一个工具
    if (!updatedTools.find(t => t.id === selectedToolId)) {
      setSelectedToolId(updatedTools[0]?.id || "");
    }
  };

  const enabledCount = currentToolConfigs.filter(c => c.enabled).length;
  const currentTool = tools.find(t => t.id === selectedToolId);

  return {
    // State
    searchQuery,
    editingConfig,
    isEditorOpen,
    isNewConfig,
    copyingConfig,
    isCopyDialogOpen,
    isToolManagerOpen,
    currentToolConfigs,
    filteredConfigs,
    configCounts,
    enabledCount,
    currentTool,

    // Actions
    setSearchQuery,
    setEditingConfig,
    setIsEditorOpen,
    setIsNewConfig,
    setCopyingConfig,
    setIsCopyDialogOpen,
    setIsToolManagerOpen,

    // Handlers
    handleToggle,
    handleEdit,
    handleSave,
    handleDelete,
    handleCopy,
    handleCopyConfirm,
    handleNewConfig,
    handleExport,
    handleExportCurrentTool,
    handleImport,
    handleSaveTools
  };
};