import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, FileJson } from 'lucide-react';
import { FoundMCPConfig, ScanResult } from '../services/LocalToolScannerService';
import { AITool } from '../types';

interface ScanConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scanResults: ScanResult[];
  onConfirm: (confirmedConfigs: FoundMCPConfig[]) => void;
  isSaving: boolean;
}

/**
 * 扫描结果确认对话框
 */
export function ScanConfirmationDialog({
  open,
  onOpenChange,
  scanResults,
  onConfirm,
  isSaving
}: ScanConfirmationDialogProps) {
  const [selectedConfigs, setSelectedConfigs] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // 计算总的配置数量
  const totalConfigs = scanResults.reduce((sum, result) => sum + result.foundConfigs.length, 0);
  
  // 获取所有可选择的配置
  const allConfigs = scanResults.flatMap(result =>
    result.foundConfigs
  );
  
  // 为每个配置生成唯一ID
  const getConfigId = (config: FoundMCPConfig, index: number): string => {
    return `config-${index}`;
  };

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allConfigIds = allConfigs.map((config, index) => getConfigId(config, index));
      setSelectedConfigs(new Set(allConfigIds));
    } else {
      setSelectedConfigs(new Set());
    }
  };

  // 处理单个配置的选择
  const handleConfigToggle = (config: FoundMCPConfig, configIndex: number) => {
    const configId = getConfigId(config, configIndex);
    const newSelected = new Set(selectedConfigs);
    
    if (newSelected.has(configId)) {
      newSelected.delete(configId);
      setSelectAll(false);
    } else {
      newSelected.add(configId);
      // 检查是否所有配置都被选中
      if (newSelected.size === allConfigs.length) {
        setSelectAll(true);
      }
    }
    
    setSelectedConfigs(newSelected);
  };

  // 获取选中的配置
  const getSelectedConfigs = (): FoundMCPConfig[] => {
    return Array.from(selectedConfigs).map(configId => {
      const index = parseInt(configId.replace('config-', ''));
      const config = allConfigs[index];
      return config;
    }).filter(config => config);
  };

  // 按工具分组的选中配置
  const getSelectedConfigsWithGrouping = (): Array<{ toolId: string; toolName: string; configs: FoundMCPConfig[] }> => {
    const selectedConfigs = getSelectedConfigs();
    
    // 按 toolId 分组
    const groupedConfigs = new Map<string, { toolId: string; toolName: string; configs: FoundMCPConfig[] }>();
    
    for (const config of selectedConfigs) {
      // 找到配置所属的工具
      const scanResult = scanResults.find(result =>
        result.foundConfigs.some(foundConfig => foundConfig === config)
      );
      
      if (scanResult) {
        const toolId = scanResult.toolId;
        const toolName = scanResult.toolName;
        
        if (!groupedConfigs.has(toolId)) {
          groupedConfigs.set(toolId, {
            toolId,
            toolName,
            configs: []
          });
        }
        
        groupedConfigs.get(toolId)!.configs.push(config);
      }
    }
    
    return Array.from(groupedConfigs.values());
  };

  // 获取配置的显示名称
  const getConfigDisplayName = (config: FoundMCPConfig, index: number) => {
    if (config.name && config.name !== 'generic-config') {
      return config.name;
    }
    return `配置 ${index + 1}`;
  };

  // 获取扫描状态图标
  const getScanStatusIcon = (result: ScanResult) => {
    switch (result.scanStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // 处理确认
  const handleConfirm = () => {
    console.log('ScanConfirmationDialog: handleConfirm called');
    const confirmedConfigs = getSelectedConfigs();
    console.log('ScanConfirmationDialog: selected configs:', confirmedConfigs);
    onConfirm(confirmedConfigs);
  };

  // 如果没有扫描结果，显示空状态
  if (scanResults.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>扫描结果确认</DialogTitle>
            <DialogDescription>
              没有找到可确认的MCP配置
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <FileJson className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">扫描完成，但没有发现有效的MCP配置文件</p>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>扫描结果确认</DialogTitle>
          <DialogDescription>
            发现 {totalConfigs} 个MCP配置，选择要添加到项目的配置
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
          {/* 扫描摘要 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-blue-600">
                  {scanResults.length}
                </div>
                <div className="text-center text-sm text-gray-500">扫描工具</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-green-600">
                  {scanResults.filter(r => r.scanStatus === 'success').length}
                </div>
                <div className="text-center text-sm text-gray-500">成功</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-yellow-600">
                  {scanResults.filter(r => r.scanStatus === 'partial').length}
                </div>
                <div className="text-center text-sm text-gray-500">部分成功</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-center text-red-600">
                  {totalConfigs}
                </div>
                <div className="text-center text-sm text-gray-500">配置数量</div>
              </CardContent>
            </Card>
          </div>

          {/* 全选选项 */}
          {totalConfigs > 0 && (
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <Input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4"
              />
              <label className="text-sm font-medium">
                全选 ({selectedConfigs.size}/{totalConfigs})
              </label>
            </div>
          )}

          {/* 配置列表 */}
          <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
            {scanResults.map((result, toolIndex) => {
              // 如果没有找到配置且没有错误信息，则跳过显示
              if (result.foundConfigs.length === 0 && !result.errorMessage) {
                return null;
              }
              
              return (
                <Card key={`${result.toolId}-${toolIndex}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getScanStatusIcon(result)}
                        <CardTitle>{result.toolName}</CardTitle>
                        <Badge variant="secondary">
                          {result.foundConfigs.length} 个配置
                        </Badge>
                      </div>
                      {result.errorMessage && (
                        <Alert variant="destructive" className="w-auto">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{result.errorMessage}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <CardDescription>{result.toolId}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {result.foundConfigs.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        未找到配置文件，已生成默认建议
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.foundConfigs.map((config, configIndex) => {
                          const configId = `config-${allConfigs.indexOf(config as any)}`;
                          const isSelected = selectedConfigs.has(configId);
                          
                          return (
                            <div
                              key={configId}
                              className={`p-3 border rounded-lg transition-colors ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <Input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleConfigToggle(config, allConfigs.indexOf(config as any))}
                                    className="mt-1 h-4 w-4"
                                  />
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">
                                        {getConfigDisplayName(config, configIndex)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {config.description}
                                    </p>
                                    <div className="text-xs text-gray-500">
                                      来源: {config.sourceFile}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            }).filter(Boolean)}
          </div>
        </div>

        <DialogFooter className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            取消
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedConfigs.size === 0 || isSaving}
            className="flex items-center space-x-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              确认选择 ({selectedConfigs.size}) 个配置
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}