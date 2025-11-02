import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { 
  Edit, 
  Copy, 
  Trash2, 
  Server,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Badge } from "./ui/badge";

export interface MCPConfig {
  id: string;
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  lastModified: string;
  toolId: string; // 所属的 AI 工具
}

interface ConfigCardProps {
  config: MCPConfig;
  onToggle: (id: string) => void;
  onEdit: (config: MCPConfig) => void;
  onCopy: (config: MCPConfig) => void;
  onDelete: (id: string) => void;
}

export function ConfigCard({ config, onToggle, onEdit, onCopy, onDelete }: ConfigCardProps) {
  const configKeys = Object.keys(config.config);
  const hasCommand = config.config.command;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              <Server className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2">
                <span className="truncate">{config.name}</span>
                {config.enabled ? (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="size-3 mr-1" />
                    启用
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="size-3 mr-1" />
                    停用
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                最后修改: {new Date(config.lastModified).toLocaleString('zh-CN')}
              </CardDescription>
            </div>
          </div>
          <Switch 
            checked={config.enabled} 
            onCheckedChange={() => onToggle(config.id)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Config preview */}
          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            {hasCommand && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">命令:</span>
                <code className="text-sm break-all">{config.config.command}</code>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">配置项:</span>
              <span className="text-sm">{configKeys.length} 个</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onEdit(config)}
            >
              <Edit className="size-4 mr-2" />
              编辑
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => onCopy(config)}
            >
              <Copy className="size-4 mr-2" />
              复制
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(config.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}