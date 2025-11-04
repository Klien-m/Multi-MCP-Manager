/**
 * 默认配置测试数据
 * 这些数据用于初始化工具和服务的默认配置
 */

import { AITool, MCPConfig } from '../types';

// 默认支持的工具列表
export const DEFAULT_TOOLS: AITool[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    icon: 'https://cursor.sh/favicon.ico',
    defaultPath: '~/.cursor/mcp.json'
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: 'https://claude.ai/favicon.ico',
    defaultPath: '~/Library/Application Support/Claude Code/mcp.json'
  },
  {
    id: 'kilo-code',
    name: 'Kilo Code',
    icon: 'https://kilocode.com/favicon.ico',
    defaultPath: '~/Library/Application Support/Code/User/globalStorage/kilocode.kilo-code/settings/mcp_settings.json'
  }
];

// 扩展的AI工具扫描配置
export const EXTENDED_TOOL_SCAN_CONFIGS = {
  'cursor': {
    paths: [
      '~/.cursor/mcp.json',
    ]
  },
  'claude-code': {
    paths: [
      '~/Library/Application Support/Claude Code/mcp.json',
      '~/.claude/mcp.json',
      '~/.config/claude-code/mcp.json'
    ]
  },
  'kilo-code': {
    paths: [
      '~/Library/Application Support/Code/User/globalStorage/kilocode.kilo-code/settings/mcp_settings.json'
    ]
  }
};

// 默认的MCP配置列表
export const DEFAULT_MCP_CONFIGS: MCPConfig[] = [];

// 默认工具ID列表（用于判断是否为默认工具）
export const DEFAULT_TOOL_IDS: string[] = DEFAULT_TOOLS.map(tool => tool.id);
