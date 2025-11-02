import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { MCPConfig } from "./ConfigCard";

interface ConfigEditorProps {
  config: MCPConfig | null;
  open: boolean;
  onClose: () => void;
  onSave: (config: MCPConfig) => void;
  isNew?: boolean;
  currentToolId: string; // 当前选中的工具 ID
}

export function ConfigEditor({ config, open, onClose, onSave, isNew = false, currentToolId }: ConfigEditorProps) {
  const [name, setName] = useState("");
  const [configJson, setConfigJson] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (config) {
      setName(config.name);
      setConfigJson(JSON.stringify(config.config, null, 2));
      setError("");
    } else if (isNew) {
      setName("");
      setConfigJson(JSON.stringify({
        command: "",
        args: [],
        env: {}
      }, null, 2));
      setError("");
    }
  }, [config, isNew, open]);

  const handleSave = () => {
    try {
      const parsedConfig = JSON.parse(configJson);
      
      if (!name.trim()) {
        setError("请输入配置名称");
        return;
      }

      const updatedConfig: MCPConfig = {
        id: config?.id || `mcp-${Date.now()}`,
        name: name.trim(),
        enabled: config?.enabled ?? true,
        config: parsedConfig,
        lastModified: new Date().toISOString(),
        toolId: config?.toolId || currentToolId
      };

      onSave(updatedConfig);
      onClose();
    } catch (e) {
      setError("JSON 格式错误，请检查配置");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isNew ? "新建 MCP 配置" : "编辑 MCP 配置"}</DialogTitle>
          <DialogDescription>
            {isNew ? "创建新的 MCP Server 配置" : "修改现有的 MCP Server 配置"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="config-name">配置名称</Label>
            <Input
              id="config-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: filesystem-server"
            />
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <Label htmlFor="config-json">配置内容 (JSON)</Label>
            <Textarea
              id="config-json"
              value={configJson}
              onChange={(e) => {
                setConfigJson(e.target.value);
                setError("");
              }}
              placeholder='{"command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem"]}'
              className="font-mono min-h-[300px] flex-1"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            {isNew ? "创建" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}