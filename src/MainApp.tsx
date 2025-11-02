import React, { useState } from 'react';
import { useMCPManager } from './hooks/useMCPManager';
import { ConfigCard } from './components/ConfigCard';
import { ConfigEditor } from './components/ConfigEditor';
import { CopyConfigDialog } from './components/CopyConfigDialog';
import { ToolSelector } from './components/ToolSelector';
import { ToolManager } from './components/ToolManager';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Alert, AlertDescription } from './components/ui/alert';
import {
  Plus,
  Search,
  Download,
  Upload,
  Server,
  Settings
} from 'lucide-react';

export function MainApp() {
  const {
    // 数据
    configs,
    tools,
    selectedToolId,
    currentToolConfigs,
    filteredConfigs,
    
    // 状态
    searchQuery,
    isLoading,
    error,
    
    // 操作
    setSearchQuery,
    setSelectedToolId,
    addConfig,
    updateConfig,
    deleteConfig,
    copyConfig,
    toggleConfig,
    exportConfigs,
    importConfigs
  } = useMCPManager();

  // 本地状态管理
  const [editingConfig, setEditingConfig] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewConfig, setIsNewConfig] = useState(false);
  const [copyingConfig, setCopyingConfig] = useState(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isToolManagerOpen, setIsToolManagerOpen] = useState(false);

  // 将 AITool 转换为 ToolConfig 以兼容现有组件
  const toolConfigs = tools.map(tool => ({
    id: tool.id,
    name: tool.name,
    displayName: tool.icon || 'default',
    defaultPath: tool.configPath || '',
    supportedFormats: ['json'],
    isActive: true
  }));

  // 计算属性
  const configCounts = tools.reduce((acc, tool) => {
    const toolConfigs = configs.filter(c => c.toolId === tool.id);
    acc[tool.id] = {
      total: toolConfigs.length,
      enabled: toolConfigs.filter(c => c.enabled).length
    };
    return acc;
  }, {} as Record<string, { total: number; enabled: number }>);

  const enabledCount = currentToolConfigs.filter(c => c.enabled).length;
  const currentTool = tools.find(t => t.id === selectedToolId);

  // 事件处理函数
  const handleToggle = (id: string) => {
    toggleConfig(id);
  };

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setIsNewConfig(false);
    setIsEditorOpen(true);
  };

  const handleSave = (config: any) => {
    if (config.id.startsWith('mcp-')) {
      updateConfig(config);
    } else {
      addConfig({
        name: config.name,
        enabled: config.enabled,
        config: config.config,
        toolId: config.toolId
      });
    }
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    const config = configs.find(c => c.id === id);
    if (config && confirm(`确定要删除 "${config?.name}" 吗？`)) {
      deleteConfig(id);
    }
  };

  const handleCopy = (config: any) => {
    setCopyingConfig(config);
    setIsCopyDialogOpen(true);
  };

  const handleCopyConfirm = (sourceId: string, targetId: string) => {
    const success = copyConfig(sourceId, targetId);
    if (success) {
      setIsCopyDialogOpen(false);
    }
  };

  const handleNewConfig = () => {
    setEditingConfig(null);
    setIsNewConfig(true);
    setIsEditorOpen(true);
  };

  const handleExport = () => {
    const data = exportConfigs();
    const dataBlob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcp-all-configs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrentTool = () => {
    const data = exportConfigs(selectedToolId);
    const dataBlob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mcp-${selectedToolId}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        const result = importConfigs(imported);
        
        if (!result.success) {
          alert(result.message || "导入失败，请检查文件格式");
        }
      } catch (e) {
        alert("导入失败，请检查文件格式");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveTools = (updatedTools: any[]) => {
    // 工具管理功能已集成到 useMCPManager 中
    console.log('工具管理功能已迁移');
  };

  const clearError = () => {
    // 错误处理已集成到 useMCPManager 中
    console.log('错误已清除');
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
                <Settings className="size-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="flex items-center gap-2">
                  MCP 配置管理器
                </h1>
                <p className="text-muted-foreground">
                  管理多个 AI 工具的 Model Context Protocol 配置
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCurrentTool} disabled={isLoading}>
                <Upload className="size-4 mr-2" />
                {isLoading ? '导出中...' : '导出当前'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading}>
                <Upload className="size-4 mr-2" />
                {isLoading ? '导出中...' : '导出全部'}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <label>
                  <Download className="size-4 mr-2" />
                  导入
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </Button>
              <Button onClick={handleNewConfig} size="sm">
                <Plus className="size-4 mr-2" />
                新建配置
              </Button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
              <Button variant="outline" size="sm" onClick={clearError}>
                清除
              </Button>
            </Alert>
          )}

          {/* Stats */}
          <div className="flex gap-4">
            <Alert className="w-32">
              <Server className="size-4" />
              <AlertDescription>
                <span className="block text-muted-foreground">总配置数</span>
                <span className="block mt-1">{currentToolConfigs.length}</span>
              </AlertDescription>
            </Alert>
            <Alert className="w-32">
              <Server className="size-4 text-green-600" />
              <AlertDescription>
                <span className="block text-muted-foreground">已启用</span>
                <span className="block mt-1 text-green-600">{enabledCount}</span>
              </AlertDescription>
            </Alert>
            <Alert className="w-32">
              <Server className="size-4 text-muted-foreground" />
              <AlertDescription>
                <span className="block text-muted-foreground">已停用</span>
                <span className="block mt-1">{currentToolConfigs.length - enabledCount}</span>
              </AlertDescription>
            </Alert>
            {currentTool?.defaultPath && (
              <Alert className="flex-1">
                <AlertDescription>
                  <span className="block text-muted-foreground">配置文件路径</span>
                  <code className="block mt-1 text-sm truncate">{currentTool.defaultPath}</code>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      {/* Tool Selector */}
      <ToolSelector
        tools={toolConfigs}
        selectedToolId={selectedToolId}
        onSelectTool={setSelectedToolId}
        onManageTools={() => setIsToolManagerOpen(true)}
        configCounts={configCounts}
      />

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="搜索配置..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Config list */}
        {filteredConfigs.length === 0 ? (
          <div className="text-center py-12">
            <Server className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-muted-foreground mb-2">
              {searchQuery ? "未找到匹配的配置" : `${currentTool?.name} 还没有配置`}
            </h3>
            {!searchQuery && (
              <Button onClick={handleNewConfig} variant="outline">
                <Plus className="size-4 mr-2" />
                创建第一个配置
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConfigs.map(config => (
              <ConfigCard
                key={config.id}
                config={config}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ConfigEditor
        config={editingConfig}
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        isNew={isNewConfig}
        currentToolId={selectedToolId}
      />

      <CopyConfigDialog
        sourceConfig={copyingConfig}
        allConfigs={configs}
        tools={toolConfigs}
        open={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        onCopy={handleCopyConfirm}
      />

      <ToolManager
        tools={toolConfigs}
        open={isToolManagerOpen}
        onClose={() => setIsToolManagerOpen(false)}
        onSave={handleSaveTools}
      />
    </div>
  );
}