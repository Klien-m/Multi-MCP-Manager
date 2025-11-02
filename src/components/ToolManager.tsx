import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { AITool } from "../types";

interface ToolManagerProps {
  tools: AITool[];
  open: boolean;
  onClose: () => void;
  onSave: (tools: AITool[]) => void;
}

const ICON_OPTIONS = [
  { value: "cursor", label: "Cursor" },
  { value: "claude", label: "Claude" },
  { value: "default", label: "默认" }
];

export function ToolManager({ tools, open, onClose, onSave }: ToolManagerProps) {
  const [editingTools, setEditingTools] = useState<AITool[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setEditingTools([...tools]);
      setError("");
    }
  }, [tools, open]);

  const handleAddTool = () => {
    const newTool: AITool = {
      id: `tool-${Date.now()}`,
      name: "",
      icon: "",
      defaultPath: "",
    };
    setEditingTools([...editingTools, newTool]);
  };

  const handleUpdateTool = (id: string, field: keyof AITool, value: string) => {
    setEditingTools(prev =>
      prev.map(tool =>
        tool.id === id ? { ...tool, [field]: value } : tool
      )
    );
    setError("");
  };

  const handleDeleteTool = (id: string) => {
    if (editingTools.length <= 1) {
      setError("至少需要保留一个工具");
      return;
    }
    setEditingTools(prev => prev.filter(tool => tool.id !== id));
  };

  const handleSave = () => {
    // 验证
    const emptyNames = editingTools.filter(t => !t.name.trim());
    if (emptyNames.length > 0) {
      setError("所有工具必须有名称");
      return;
    }

    const names = editingTools.map(t => t.name.trim());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      setError("工具名称不能重复");
      return;
    }

    onSave(editingTools);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>管理 AI 工具</DialogTitle>
          <DialogDescription>
            添加或编辑要管理的 AI 工具（如 Cursor、Claude Code 等）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {editingTools.map((tool, index) => (
            <Card key={tool.id}>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>工具名称</Label>
                      <Input
                        value={tool.name}
                        onChange={(e) => handleUpdateTool(tool.id, "name", e.target.value)}
                        placeholder="例如: Cursor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>图标</Label>
                      <Select
                        value={tool.name || "default"}
                        onValueChange={(value) => handleUpdateTool(tool.id, "name", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ICON_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>配置文件路径（可选）</Label>
                    <Input
                      value={tool.defaultPath || ""}
                      onChange={(e) => handleUpdateTool(tool.id, "defaultPath", e.target.value)}
                      placeholder="例如: ~/.cursor/mcp.json"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTool(tool.id)}
                      disabled={editingTools.length <= 1}
                    >
                      <Trash2 className="size-4 mr-2" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleAddTool}
          >
            <Plus className="size-4 mr-2" />
            添加工具
          </Button>

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
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
