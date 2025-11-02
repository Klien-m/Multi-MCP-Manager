import { Button } from "./ui/button";
import {
  Code2,
  Bot,
  Settings,
  Plus,
  Pencil
} from "lucide-react";
import { Badge } from "./ui/badge";
import { AITool } from "../types";

export interface ToolSelectorProps {
  tools: AITool[];
  selectedToolId: string;
  onSelectTool: (toolId: string) => void;
  onManageTools: () => void;
  configCounts: Record<string, { total: number; enabled: number }>;
}

const TOOL_ICONS: Record<string, any> = {
  cursor: Code2,
  claude: Bot,
  default: Settings
};

export function ToolSelector({ 
  tools, 
  selectedToolId, 
  onSelectTool, 
  onManageTools,
  configCounts 
}: ToolSelectorProps) {
  return (
    <div className="border-b bg-card/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-3">
          {tools.map(tool => {
            const iconKey = tool.id || 'default';
            const IconComponent = TOOL_ICONS[iconKey] || TOOL_ICONS.default;
            const isSelected = tool.id === selectedToolId;
            const counts = configCounts[tool.id] || { total: 0, enabled: 0 };
            
            return (
              <Button
                key={tool.id}
                variant={isSelected ? "default" : "outline"}
                className="flex items-center gap-2 shrink-0"
                onClick={() => onSelectTool(tool.id)}
              >
                <IconComponent className="size-4" />
                {tool.name}
                <Badge variant={isSelected ? "secondary" : "outline"} className="ml-1">
                  {counts.enabled}/{counts.total}
                </Badge>
              </Button>
            );
          })}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onManageTools}
            className="shrink-0 ml-2"
          >
            <Pencil className="size-4 mr-2" />
            管理工具
          </Button>
        </div>
      </div>
    </div>
  );
}
