import React, { useState } from 'react';
import { useMCPManager } from './hooks/useMCPManager';
import { ConfigCard } from './components/ConfigCard';
import { ConfigEditor } from './components/ConfigEditor';
import { CopyConfigDialog } from './components/CopyConfigDialog';
import { ToolSelector } from './components/ToolSelector';
import { ToolManager } from './components/ToolManager';
import { ToolScanToolbar } from './components/ToolScanToolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
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
import {Toaster} from "./components/ui/sonner.tsx";
import { AITool } from './types';
import { DEFAULT_MCP_CONFIGS, DEFAULT_TOOLS } from './data/default-configs.ts';

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
    
    // 操作
    setSearchQuery,
    setSelectedToolId,
    addConfig,
    updateConfig,
    deleteConfig,
    copyConfig,
    toggleConfig,
    exportConfigs,
    importConfigs,
    saveToolsList
  } = useMCPManager();

  // 本地状态管理
  const [editingConfig, setEditingConfig] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewConfig, setIsNewConfig] = useState(false);
  const [copyingConfig, setCopyingConfig] = useState(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isToolManagerOpen, setIsToolManagerOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isNoToolsDialogOpen, setIsNoToolsDialogOpen] = useState(false);
  const [deletingConfig, setDeletingConfig] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    console.log('📝 ConfigEditor 调用 handleSave:', config, 'isNew:', isNewConfig);
    
    if (isNewConfig) {
      // 创建新配置
      console.log('📝 调用 addConfig');
      addConfig({
        name: config.name,
        enabled: config.enabled,
        config: config.config,
        toolId: config.toolId
      });
    } else {
      // 更新现有配置
      console.log('📝 调用 updateConfig');
      updateConfig(config);
    }
    
    // 立即关闭编辑器
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    console.log('MainApp: handleDelete called with id:', id);
    const config = configs.find(c => c.id === id);
    if (config) {
      console.log('MainApp: found config to delete:', config.name);
      setDeletingConfig({ id: config.id, name: config.name });
      setIsDeleteDialogOpen(true);
    } else {
      console.error('MainApp: config not found for id:', id);
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingConfig) {
      console.log('MainApp: handleDeleteConfirm called for:', deletingConfig.id);
      deleteConfig(deletingConfig.id);
      setIsDeleteDialogOpen(false);
      setDeletingConfig(null);
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
    // 检查是否有工具，如果没有则显示对话框提示用户先创建工具
    if (!selectedToolId || tools.length === 0) {
      setIsNoToolsDialogOpen(true);
      return;
    }
    
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
        importConfigs(imported);
      } catch (e) {
        // 错误处理已集成到 importConfigs 函数中，使用 toast 显示
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveTools = async (updatedTools: AITool[]) => {
    const success = await saveToolsList(updatedTools);
    if (success) {
      // 工具保存成功后的处理
      console.log('工具配置保存成功');
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Toaster />

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScanDialogOpen(true)}
              >
                <Search className="size-4 mr-2" />
                AI扫描
              </Button>
            </div>
          </div>


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
        tools={tools}
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
              {searchQuery ? "未找到匹配的配置" : `${currentTool?.name || '当前工具'} 还没有配置`}
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
        tools={tools}
        open={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        onCopy={handleCopyConfirm}
      />

      <ToolManager
        tools={tools}
        open={isToolManagerOpen}
        onClose={() => setIsToolManagerOpen(false)}
        onSave={handleSaveTools}
      />

      {/* 扫描对话框 */}
      <Dialog open={isScanDialogOpen} onOpenChange={setIsScanDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>AI工具扫描</DialogTitle>
            <DialogDescription>
              扫描本地AI工具的MCP配置文件并自动转换为项目支持的格式
            </DialogDescription>
          </DialogHeader>
          <ToolScanToolbar supportedTools={DEFAULT_TOOLS} />
        </DialogContent>
      </Dialog>

            {/* 没有工具时的提示对话框 */}
      <Dialog open={isNoToolsDialogOpen} onOpenChange={setIsNoToolsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>无法创建配置</DialogTitle>
            <DialogDescription>
              请先创建工具，然后才能创建 MCP 配置。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsNoToolsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => {
              setIsNoToolsDialogOpen(false);
              setIsToolManagerOpen(true);
            }}>
              去创建工具
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除配置 "{deletingConfig?.name}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false);
              setDeletingConfig(null);
            }}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}