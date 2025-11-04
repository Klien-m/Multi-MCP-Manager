import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle2 } from "lucide-react";
import { MCPConfig } from "./ConfigCard";
import { AITool } from "../types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface CopyConfigDialogProps {
  sourceConfig: MCPConfig | null;
  allConfigs: MCPConfig[];
  tools: AITool[];
  open: boolean;
  onClose: () => void;
  onCopy: (sourceId: string, targetId: string) => void;
}

export function CopyConfigDialog({ sourceConfig, allConfigs, tools, open, onClose, onCopy }: CopyConfigDialogProps) {
  const [targetId, setTargetId] = useState<string>("");
  const [targetToolId, setTargetToolId] = useState<string>("");
  const [success, setSuccess] = useState(false);

  // 过滤目标配置（同一工具内的其他配置）
  const sameToolConfigs = allConfigs.filter(c => 
    c.toolId === sourceConfig?.toolId && c.id !== sourceConfig?.id
  );

  // 其他工具的配置
  const otherToolConfigs = allConfigs.filter(c => c.toolId !== sourceConfig?.toolId);

  const handleCopy = () => {
    if (sourceConfig && targetId) {
      onCopy(sourceConfig.id, targetId);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTargetId("");
        setTargetToolId("");
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setTargetId("");
    setTargetToolId("");
    onClose();
  };

  const handleToolChange = (toolId: string) => {
    setTargetToolId(toolId);
    setTargetId(""); // 重置目标配置选择
  };

  const availableConfigs = targetToolId 
    ? allConfigs.filter(c => c.toolId === targetToolId && c.id !== sourceConfig?.id)
    : sameToolConfigs;

  const sourceTool = tools.find(t => t.id === sourceConfig?.toolId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>复制配置</DialogTitle>
          <DialogDescription>
            将配置从 "{sourceConfig?.name}" 复制到其他位置
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {success ? (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="size-4 text-green-600" />
              <AlertDescription className="text-green-600">
                配置复制成功！
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label>源配置</Label>
                <div className="p-3 bg-muted rounded-md">
                  <div>{sourceConfig?.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {sourceTool?.name}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>目标工具</Label>
                <RadioGroup value={targetToolId || sourceConfig?.toolId} onValueChange={handleToolChange}>
                  {tools.filter(t => t.id !== sourceConfig?.toolId).map(tool => (
                    <div key={tool.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={tool.id} id={`tool-${tool.id}`} />
                      <Label htmlFor={`tool-${tool.id}`} className="cursor-pointer">
                        {tool.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-config">目标配置</Label>
                <Select
                  value={targetId}
                  onValueChange={setTargetId}
                  disabled={availableConfigs.length === 0}
                >
                  <SelectTrigger id="target-config">
                    <SelectValue placeholder={availableConfigs.length === 0 ? "暂无可用配置" : "选择要覆盖的配置"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConfigs.map(config => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {availableConfigs.length === 0 && (
                <Alert>
                  <AlertDescription>
                    所选工具中没有可用的配置。请先创建配置。
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button
              onClick={handleCopy}
              disabled={!targetId || availableConfigs.length === 0}
            >
              复制配置
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}